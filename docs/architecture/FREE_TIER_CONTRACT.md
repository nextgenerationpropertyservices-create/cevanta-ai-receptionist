# Free tier architecture contract

Task: CEV-FREE-TIER-173A
Status: architecture contract for implementation review

## Purpose and non-goals

This contract adds a safe, useful free workspace that can collect an email/account relationship and demonstrate the Cevanta dashboard without silently enabling paid or provider-backed behavior. A plan is an entitlement label, not evidence of payment, subscription state, provider setup, approval, or successful automation.

This slice does **not** enable Retell/Make ingestion, live booking, SMS, email delivery, payment collection, external calendar writes, dispatch automation, or reactivation campaigns. Existing automation controls and verified provider readiness remain authoritative even on higher plans.

## Plan model

Use one database enum and one tenant-owned column:

```sql
create type public.workspace_plan as enum (
  'free',
  'dashboard_plus',
  'managed_receptionist'
);

alter table public.tenants
  add column plan public.workspace_plan;
```

The identifiers mean:

- `free`: self-service dashboard with the limits and locked capabilities below.
- `dashboard_plus`: expanded dashboard entitlement; provider actions still require separate configuration, approval, and verification.
- `managed_receptionist`: operator-managed receptionist entitlement; it still does not assert that payment cleared or any provider is live.

Do not store payment status, Stripe state, provider readiness, or automation approval in this column. Do not infer those states from it.

Ordinary authenticated clients receive read access to `plan` through their existing tenant membership but no direct `UPDATE(plan)` grant. A future upgrade command must be a separate, audited, operator-only server operation with its own commercial evidence. It is outside this task.

## Backward-compatible migration sequence

1. Create `public.workspace_plan`.
2. Add nullable `public.tenants.plan` without a default.
3. In the same transaction, set every existing tenant to `managed_receptionist`. This includes internal workspaces and existing client workspaces and prevents a release from removing capabilities they already had.
4. Set the column `NOT NULL` and set the database default to `free` for newly self-provisioned workspaces.
5. Replace the internal managed-client provisioning function so it explicitly inserts `plan = 'managed_receptionist'`. Keep its current authorization, idempotency, tenant membership creation, and response behavior.
6. Replace the self-service owner provisioning function only as needed to return the plan in its response. Its insert may rely on the `free` default, although an explicit `plan = 'free'` is preferred for clarity.
7. Add the enforcement functions/triggers described below, then add supporting tenant/status indexes if query plans show they are needed.

The application must tolerate a response without `plan` during an app-first/database-second rollout by treating it as temporarily unavailable, never by guessing `free`. After the migration, the database value is authoritative.

No existing tenant is automatically downgraded. A future deliberate downgrade above a free limit must preserve all records and block only new capacity or reactivation; it must never delete data.

## Entitlements and visible upgrade boundaries

Free workspaces may use existing tenant-safe, manual dashboard behavior:

- manual lead entry and lead review, up to 50 active leads;
- customer records and CRM history;
- internal reminders and follow-up dates;
- internal Cevanta calendar and manually managed jobs;
- reports and the existing assumption-labelled ROI calculator;
- up to two technician roster entries, linked or unlinked.

The following may be visible with a plain upgrade explanation, but must be disabled and fail closed for `free`:

- AI receptionist/call ingestion and call-driven lead capture;
- SMS or email sending;
- live/automatic booking;
- external calendar writes;
- payment collection or subscription billing;
- automatic assignment or dispatch;
- lead reactivation campaigns and automated follow-up;
- provider authorization, provider execution, or any claim that an integration is working.

`dashboard_plus` and `managed_receptionist` remove plan-level locks only. Existing owner approval, provider credentials, verified route status, test-call, automation-control, and rollback requirements still apply. UI visibility is not authorization enforcement.

## Limit definitions

### Active leads

An active lead is a row in `public.leads` whose status is `new`, `contacted`, or `scheduled`. The existing terminal status `closed` does not consume free capacity.

- Maximum: 50 active leads per tenant where `tenants.plan = 'free'`.
- Creating an active lead consumes one slot.
- Reopening a `closed` lead consumes one slot and must be checked.
- Editing an already-active lead does not consume another slot.
- Closing or deleting a lead releases a slot.
- Counts must always be scoped to the verified row's `tenant_id`.

### Technician roster

Every row in `public.technician_roster` consumes one slot, whether the technician is pending, linked to a user, or has no email.

- Maximum: two roster rows per free tenant.
- Editing an existing roster entry in the same tenant does not consume another slot.
- Deleting a roster entry releases a slot.
- Moving a row between tenants is treated as an insertion into the destination and must be checked. Ordinary clients should not receive permission to change `tenant_id`.

## Secure enforcement

The database is the final enforcement boundary because current lead and technician actions perform direct tenant-scoped table inserts. UI checks and server preflight counts are only for a friendly experience and cannot replace database enforcement.

Implement security-definer helpers with a fixed safe `search_path`, no client-selectable plan, and no grants that allow direct execution unless explicitly required. Each helper must:

1. obtain the tenant from `NEW.tenant_id`, not a separate client claim;
2. lock that exact `public.tenants` row `FOR UPDATE` to serialize concurrent capacity checks;
3. read its authoritative plan;
4. count only rows belonging to that tenant, excluding the row being updated where applicable;
5. reject with a stable application-mappable code before the write exceeds the limit.

Required triggers:

- `BEFORE INSERT OR UPDATE OF tenant_id, status` on `public.leads`. For a free tenant, reject an insertion/reopening that would create active lead 51. Permit active-to-active edits, active-to-closed transitions, and closed-to-closed edits.
- `BEFORE INSERT OR UPDATE OF tenant_id` on `public.technician_roster`. For a free tenant, reject a third roster row while permitting edits to either existing row.

Recommended stable error identifiers are `free_plan_active_lead_limit` and `free_plan_technician_limit`, raised without record data or database details. Server actions translate them into friendly messages and an upgrade action. All other database errors retain the existing safe generic handling.

The authenticated user must still pass the existing action authorization and RLS policy: office roles for leads and owner/admin for technician roster changes. The limit trigger adds entitlement enforcement; it does not replace authentication, membership, role, RLS, validation, or audit triggers.

Provider ingress must fail closed for free workspaces before any provider effect or lead creation. A free workspace must not receive trusted server-side provider mappings that enable receptionist events. Because the current `leads` table has no source column, this contract does not attempt to infer manual versus provider origin inside the lead trigger. Integration handlers must separately check the authoritative tenant plan and existing readiness/automation state. Quality must test that a service path cannot bypass this check.

## Server/UI read contract

Expose a tenant-scoped read model assembled only after authenticated membership verification:

```ts
type WorkspacePlan =
  | "free"
  | "dashboard_plus"
  | "managed_receptionist";

type WorkspacePlanSummary = {
  plan: WorkspacePlan;
  limits: {
    activeLeads: number | null;
    technicianRoster: number | null;
  };
  usage: {
    activeLeads: number;
    technicianRoster: number;
  };
  remaining: {
    activeLeads: number | null;
    technicianRoster: number | null;
  };
};
```

For `free`, limits are 50 and 2. For the other plans, these two plan limits are `null`; this does not mean unlimited provider usage or paid status. Usage queries count the current tenant only. Never accept a tenant ID without verifying membership, never accept a plan from form data, and never reuse one tenant's summary for another tenant.

The UI may preflight and display remaining capacity, but it must handle a concurrent database rejection and preserve user input. Locked controls explain the required upgrade and must not claim payment or activation.

## Tenant isolation and audit requirements

- Keep existing tenant membership/RLS checks on tenants, leads, customers, jobs, calendar records, and technician roster.
- Capacity checks always lock and count by the row's tenant ID.
- A cross-tenant ID must fail authorization/RLS before any useful count or plan information is returned.
- Do not use a service-role client for ordinary app requests.
- Plan changes, when implemented later, require an atomic audit event recording actor, tenant, old plan, and new plan without payment details.
- Existing row audit triggers remain active for accepted lead and roster writes. Limit rejections must not create a false success/audit event.

## Rollout, rollback, and forward repair

Safe rollout order is app-compatible reads first, migration second, then limit-aware UI. Provider paths must remain disabled for free throughout.

Rollback is safe before any free tenants are created: remove triggers/helpers, remove the column, then drop the enum. After free tenants exist, do not drop or reinterpret their plan silently. Prefer a forward repair: keep the enum/column, disable only the defective trigger, correct it, and re-enable it after concurrency/isolation tests. Never resolve an over-limit state by deleting tenant data.

If a trigger defect blocks legitimate edits, an operator may temporarily change only the affected tenant to the prior entitlement through a reviewed, audited repair procedure. Direct client plan writes remain prohibited.

## Required verification before acceptance

Database tests must use at least two fictional tenants and cover:

- migration backfills every existing tenant to `managed_receptionist` and new self-service provisioning receives `free`;
- internal managed-client provisioning explicitly receives `managed_receptionist`;
- free active-lead inserts 1–50 pass and 51 fails;
- `closed` leads do not count; closing releases capacity; reopening checks capacity;
- active lead edits pass at capacity and duplicate retry behavior remains unchanged;
- free technician inserts 1–2 pass and 3 fails; edits pass and deletion releases capacity;
- simultaneous final-slot inserts serialize so only one succeeds;
- identical counts in another tenant do not affect the current tenant;
- unauthorized and cross-tenant direct writes still fail RLS;
- existing managed workspaces retain previous lead/roster behavior;
- provider ingress and all locked automation actions reject free workspaces without external effects;
- stable limit errors are translated safely and preserve recoverable form input.

Run typecheck, lint, focused application tests, all maintained database suites, and production build. Hosted Supabase Auth/JWT/PostgREST and concurrency evidence remains a separate required gate; embedded SQL alone does not prove hosted behavior.

## Inspected implementation basis

This contract was based on the current `public.tenants`/memberships/RLS foundation, self-service and internal managed-client provisioning functions, `public.leads` schema (`new`, `contacted`, `scheduled`, `closed`), direct lead action inserts, `public.technician_roster`, and its direct owner/admin action inserts. Those direct writes are why database triggers, not UI-only checks, are required.
