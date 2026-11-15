# CEV-PROJECT-AUDIT-167H — Launch evidence trust contract

Date: 2026-10-26  
Reviewer: Atlas (Software Architect and Data)  
Decision: **Approve a follow-up implementation only with the contract below. Do not let the current milestone row activate a client or certify a provider.**

## Executive decision

Cevanta currently has two intentionally different status models:

1. `client_onboarding_milestones` is a client-workspace owner/admin editable progress row.
2. `buildProvisioningReadiness` uses derived setup and private Retell mapping state, but keeps test-call and activation gates hard-blocked.

That is fail-safe, but it is not a launch contract. A client owner/admin can presently write `paid`, `passed`, `verified`, and `approved`, while the Launch and Integrations pages describe those values as recorded evidence. Those values must never become activation inputs because the writer is also the party being verified.

The smallest safe replacement is:

- derive **setup completion** from the saved onboarding snapshot and its `config_revision`;
- derive **Retell route state** from the existing private server-side mapping;
- let only a verified internal Cevanta owner/admin with an active managed-client relationship record **payment, Make-route, fictional test-call, and final office-review launch attestations**;
- expose one sanitized, tenant-authorized readiness projection to every UI consumer;
- keep automatic booking, SMS, email, external calendar writes, payment collection, subscription billing, and dispatch off. An office-review launch attestation authorizes only call-to-lead intake for office review.

No provider side effect belongs in the attestation RPC. Recording evidence must not publish an agent, enable a Make scenario, send a message, write a calendar, charge money, or dispatch a technician.

## Current-state evidence

### Client-controlled milestones are not trusted evidence

- The server action accepts all six statuses in one request and authorizes any owner/admin of the target client workspace (`src/app/actions/onboarding-milestones.ts:11-24`). It does not distinguish a Cevanta internal operator from a client owner.
- The shared type combines payment, setup, test-call, Retell, Make, and launch status in one mutable object (`src/lib/onboarding-milestones.ts:3-19`). It has no evidence source, verifier, revision binding, revocation reason, or per-gate timestamp.
- The table is explicitly described as owner-controlled and gives authenticated client-workspace owners/admins direct insert and update grants through RLS (`supabase/migrations/202610210001_client_onboarding_milestones.sql:1-34`).
- The current SQL test positively requires a workspace owner to be able to update the row and only rejects a forged `updated_by` value (`supabase/tests/client_onboarding_milestones.sql:3-9`). It does not test an internal-operator boundary.
- The internal Clients screen uses those values to classify a workspace as live and presents the same full edit form (`src/app/workspaces/[tenantId]/clients/page.tsx:164-167,203`). Putting the form on an internal route is not authorization; the action and Data API grants remain client-accessible.

### The UI and canonical readiness builder disagree

- The Launch page calls matching milestone values “verification evidence recorded,” derives a provisional launch evidence flag from them, and then correctly says trusted operator verification is still required (`src/app/workspaces/[tenantId]/launch/page.tsx:12-40`).
- That page separately calls `buildProvisioningReadiness` without any milestone or attestation input (`src/app/workspaces/[tenantId]/launch/page.tsx:59-69`).
- The Integrations page likewise labels Retell, Make, and a test call from the same editable milestone row (`src/app/workspaces/[tenantId]/integrations/page.tsx:15-40,75-87`).
- The canonical readiness builder uses actual Retell mapping state, but hard-codes provider connections to `manual_required` and both test call and activation to `blocked` (`src/lib/provisioning-readiness.ts:67,87-113`).

The hard block is the correct safety behavior. The contradiction must be resolved by adding trusted evidence to the canonical readiness contract, not by teaching the builder to trust the current milestone row.

### Existing managed-client authority is the pattern to reuse

- A managed relationship pairs `operator_tenant_id` with one `client_tenant_id`, and only internal operator owners/admins can read it (`supabase/migrations/202610020009_managed_client_workspaces.sql:4-22`).
- `provision_managed_client_workspace` uses a confirmed authenticated identity, verifies that the selected operator tenant is internal, and independently verifies the actor's owner/admin membership before it writes (`supabase/migrations/202610020009_managed_client_workspaces.sql:60-102`).
- Client invitation issuance further verifies the exact managed-client pair and active relationship status (`supabase/migrations/202610150001_client_invitation_issuance.sql:23-27`).
- The archive command also verifies internal account type, actor membership, and the managed relationship (`supabase/migrations/202610190002_managed_client_workspace_archive.sql:13-31`).

For launch evidence, do not accept or trust an operator tenant ID from the browser. The database can derive the single operator tenant from `managed_client_workspaces.client_tenant_id`, then prove the authenticated actor is an owner/admin member of that internal tenant. The current schema makes each client tenant belong to at most one managed relationship, so this derivation is unambiguous.

### Setup and automation controls have different meanings

- Onboarding contracts explicitly state that configuration storage does not confer operational readiness, and every owner snapshot carries a monotonic `config_revision` (`src/lib/onboarding-contracts.ts:33,47-51,63-69`).
- Automation controls let a client owner/admin record requested state, approval, test text, rollback text, and even `active` when fields are present (`supabase/migrations/202610120003_workspace_automation_controls.sql:3-24,33-49`). These are client intent and configuration records, not provider proof.

Trusted test and launch attestations must therefore bind to the reviewed onboarding `config_revision` and the reviewed route version. A configuration or route change makes prior evidence stale.

### Confirmed milestone audit defect

The milestone table has `tenant_id` as its primary key and no `id` column (`supabase/migrations/202610210001_client_onboarding_milestones.sql:4-15`), but its audit trigger calls `record_audit_event` (`:36-37`). That shared trigger always casts `row_data->>'id'` into the non-null `audit_events.entity_id` (`supabase/migrations/202610020001_foundation.sql:37-40,57-65`).

An embedded PGlite insert against the current migration tree failed with SQLSTATE `23502`: `null value in column "entity_id" of relation "audit_events" violates not-null constraint`. This is independent of the trust problem and can make milestone saves fail. A follow-up migration must remove or replace this incompatible trigger; do not weaken the audit table or suppress the error in application code.

## Required authority matrix

| Evidence or state | Authoritative source | Who may create/change it | Client owner/admin capability |
|---|---|---|---|
| Business/setup answers | Existing onboarding commands and snapshot | Client owner/admin; authorized internal support paths already allowed by onboarding contracts | Enter and revise their own setup |
| Setup complete | Derived policy over the current snapshot and `config_revision` | System computation only | Cannot manually certify completion |
| Payment confirmed | Stripe reconciliation when later implemented, or an internal manual attestation | Internal Cevanta owner/admin with the active managed-client relationship | May view safe status; cannot mark paid |
| Retell route configured | Existing private `integration_private.retell_connections` mapping | Existing server-only mapping command; final readiness reads private mapping health | May request/configure through approved flow, but mapping alone is not verification |
| Retell end-to-end proof | Trusted fictional test-call attestation bound to the current route and setup revision | Internal Cevanta owner/admin after reviewing the resulting tenant lead and duplicate behavior | May participate in a test; cannot mark it passed |
| Make route verified | Future provider-derived observation, or an internal manual attestation after checking Make | Internal Cevanta owner/admin with the active managed-client relationship | May authorize credentials; cannot mark the scenario verified |
| Optional capability consent | Existing automation control/request record | Client owner/admin | May request or withdraw consent; this is not activation proof |
| Final office-review launch | Internal launch attestation with explicit `office_review_lead_intake_v1` scope | Internal Cevanta owner/admin only | May view status; cannot approve launch |
| Automatic booking/messages/calendar/payment/dispatch | Separate future capability-specific provider proof and internal approval | Not part of this contract | Must remain off |

If a provider can later supply signed or API-derived evidence, a dedicated server adapter may write a provider observation. Provider observations and human attestations must remain distinguishable; neither should masquerade as the other.

## Minimal data contract for the follow-up migration

Use a private schema such as `onboarding_private`; do not add these rows to a browser-writable public table.

### 1. Current attestation state

`onboarding_private.client_launch_attestations`

Required logical fields:

- `id uuid primary key`
- `operator_tenant_id uuid not null`
- `client_tenant_id uuid not null`
- `gate text not null` constrained to `payment`, `make_route`, `test_call`, or `launch_approval`
- `state text not null` constrained to `pending`, `satisfied`, `failed`, or `revoked`
- `scope text not null`; the initial launch scope is exactly `office_review_lead_intake_v1`
- `evidence_method text not null` from a small allowlist such as `manual_review`, `provider_observation`, or `payment_webhook`
- `evidence_summary text`; bounded, sanitized, and prohibited from containing secrets, raw provider payloads, transcripts, real customer data, webhook URLs, or credentials
- `setup_config_revision bigint` for test and launch evidence
- `route_fingerprint text` and `route_updated_at timestamptz` for test and launch evidence; the fingerprint is server-derived and must not expose a Retell agent ID or connection secret
- `version bigint not null default 1`
- `verified_by uuid not null references auth.users(id)`
- `verified_at`, `created_at`, and `updated_at` as finite timestamps
- unique key `(operator_tenant_id, client_tenant_id, gate)`

Add a unique constraint on `(operator_tenant_id, client_tenant_id)` in `managed_client_workspaces`, then use a composite foreign key from the attestation row to that pair. This prevents an operator/client pair that does not exist from being represented, even if application logic is wrong.

Do not create manual `setup` or `retell_route` attestation rows in the minimum version. Setup is derived; Retell route health is a private system observation. The test-call attestation is the human proof that the mapped path worked.

### 2. Immutable transition history

`onboarding_private.client_launch_attestation_events`

Append one event for every state transition, including failure and revocation. Store attestation ID, operator/client pair, gate, old/new state, actor, request ID, state version, reviewed setup revision, reviewed route fingerprint/version, safe evidence method/summary, reason, and timestamp. No update or delete grant belongs on this table.

The existing generic `audit_events` table is too small for this structured history and its shared trigger is incompatible with a tenant-keyed table that lacks `id`. The RPC may also append one coarse `audit_events` record in the same transaction, but the private event is the authoritative evidence history.

### 3. Idempotency receipts

`onboarding_private.client_launch_attestation_receipts`

Store `(actor_user_id, request_id)` as the unique request key, plus a canonical input digest, attestation ID, result version, and created timestamp. A repeated request with the same digest returns `replayed`; reuse of the same request ID with different content returns `conflict`. Receipts are private and immutable.

## Write RPC contract

Add one narrow command, for example:

`public.record_client_launch_attestation(input jsonb) -> jsonb`

Input should contain only:

- `request_id`
- `client_tenant_id`
- `gate`
- `state`
- `scope`
- safe `evidence_method` and bounded `evidence_summary`
- `expected_version`
- `expected_setup_config_revision` when applicable
- `expected_route_fingerprint` when applicable

Do **not** accept `verified_by`, a role, or an operator tenant ID. Derive the actor from `onboarding_private.current_identity()` and derive the operator tenant from the managed relationship. A browser-supplied client tenant ID is only a selector; it confers no authority.

The function must:

1. Be `security definer` with `search_path=''` and fully qualified objects.
2. Be owned by the database owner, revoked from `public`, `anon`, and `authenticated`, then granted explicitly to `authenticated` only.
3. Require a confirmed, non-deleted authenticated identity through `onboarding_private.current_identity()`.
4. Lock and resolve the managed-client row by `client_tenant_id`.
5. Verify the derived operator tenant has `account_type='internal'` and the actor is its owner/admin.
6. Permit positive `satisfied` attestations only while the relationship is `onboarding`, `pilot`, or `active`. Permit `failed`/`revoked` during `paused` so an operator can fail closed. Deny all writes for `archived`.
7. Reject stale `expected_version`, setup revision, or route fingerprint with a conflict result.
8. Validate gate-specific required fields. `test_call` and `launch_approval` require the current setup revision and active route fingerprint. `launch_approval` requires exact office-review scope.
9. Serialize the same `(client_tenant_id, gate)` with a row lock or transaction advisory lock.
10. Atomically write current state, immutable event, coarse audit event if retained, and idempotency receipt. Any one failure rolls back all four.
11. Return only safe state, version, and timestamps. Never return a provider account/agent ID, management token, webhook URL, transcript, or raw payload.

The RPC must not use a service-role client for an ordinary application request. Service-role/provider ingestion identities also must not be able to approve launch.

## Read/RLS contract

- Keep current attestation, event, and receipt tables in a non-exposed private schema. Enable RLS as defense in depth, but grant no direct table privileges to `anon` or `authenticated`.
- Expose a separate sanitized read RPC or invoker-safe projection, for example `public.get_client_launch_readiness(client_tenant_id uuid)`.
- A client workspace owner/admin may read safe gate state and timestamps for that client. Internal Cevanta owners/admins may read the safe evidence summary only when the managed relationship matches.
- Do not reveal operator-only notes, raw evidence, request digests, route/provider identifiers, or records from any other client.
- Follow current Supabase behavior explicitly: do not rely on new public objects being automatically exposed or granted. Declare every schema/table/function privilege in the migration.

## One canonical readiness projection

All Launch, Integrations, Clients, and provisioning UI should consume one contract, conceptually:

```ts
type TrustedLaunchReadiness = {
  clientTenantId: string;
  scope: "office_review_lead_intake_v1";
  setup: { state: "ready" | "needs_setup"; configRevision: number | null };
  retellRoute: { state: "active" | "paused" | "not_mapped" | "unavailable"; routeRevision: string | null };
  payment: TrustedGate;
  makeRoute: TrustedGate;
  testCall: TrustedGate;
  launchApproval: TrustedGate;
  overall: "setup_needed" | "operator_needed" | "ready_for_office_review" | "blocked" | "unavailable";
  blockers: Array<{ code: string; nextAction: string }>;
};
```

`TrustedGate` must distinguish `missing`, `satisfied`, `failed`, `revoked`, and `stale`. A UI label such as “verified” must mean this trusted projection says `satisfied`, not that a legacy milestone has that text.

The projection must evaluate all inputs from one consistent database snapshot where practical:

1. Current onboarding setup satisfies the documented required-field policy.
2. The private Retell mapping is active.
3. Payment is satisfied for the current pilot policy.
4. Make route evidence is satisfied if Make is the configured intake path.
5. The test-call attestation is satisfied and matches the current setup revision and route fingerprint.
6. Launch approval is satisfied, has `office_review_lead_intake_v1` scope, and matches the same current revisions.
7. The managed relationship is not paused or archived.

Only then may `overall` be `ready_for_office_review`. This is a readiness result, not an activation mutation. Provider changes remain separate explicit commands and are outside this task.

Legacy `client_onboarding_milestones` may remain temporarily as a progress display, but none of its values may contribute to `TrustedLaunchReadiness`, client stage=`live`, or provider status. Rename its UI semantics to “legacy progress notes” until it is removed.

## Staleness, revocation, and recovery

- When `config_revision` changes, mark or compute `test_call` and `launch_approval` as stale. Do not delete their history.
- When a Retell route is remapped, paused, or its private mapping `updated_at` changes, mark or compute route-bound test and launch evidence as stale.
- When Make authorization/mapping changes, stale the Make and launch gates once a trusted Make route revision exists.
- `failed`, `revoked`, `paused`, missing, stale, or unavailable evidence always fails closed.
- Revoking launch does not delete provider data; it changes readiness to blocked and records an immutable reason.
- A provider outage or unreadable projection returns `unavailable`, never “ready.”
- Recovery is a new attestation against current revisions after a new fictional test. Never edit old event history to make it look current.

## Forward migration plan

1. **Repair the existing milestone audit trigger first.** Replace it with a table-specific trigger that uses `tenant_id` as a stable entity identifier, or add a compatible immutable row ID and use that. Do not make `audit_events.entity_id` nullable.
2. Add the unique managed pair constraint and private attestation/event/receipt tables in an additive migration.
3. Add write and sanitized read RPCs with explicit grants, fixed search paths, fully qualified objects, and no direct authenticated table access.
4. Backfill **no trusted satisfied/approved evidence** from `client_onboarding_milestones`. Existing values are untrusted. At most preserve them as legacy notes awaiting operator review.
5. Add the trusted readiness projection and switch every UI consumer together. Until that switch, keep activation hard-blocked.
6. Replace the current internal milestone form with the operator-only attestation flow. Keep client setup and optional-capability consent separate.
7. After an observation period, remove legacy milestone values from client-stage calculations and then retire the table in a later migration if no longer needed.

This is forward-only. If the new projection fails after release, switch the application back to a blocked/unavailable launch state, revoke the new RPC execute grant if necessary, and leave private evidence/history intact for repair. Do not destructively roll back or copy untrusted legacy statuses into the trusted tables.

## Required Quality and security tests

### Authority and isolation

- Client owner/admin cannot write a trusted attestation through the RPC or direct SQL/Data API.
- Internal owner/admin with the exact active managed relationship can write allowed evidence.
- Internal dispatcher, technician, viewer, unconfirmed user, deleted user, and anonymous caller are denied.
- Internal owner/admin without the relationship is denied.
- A forged client tenant, forged operator tenant, cross-tenant pair, and archived relationship are denied without revealing whether the other tenant exists.
- A paused relationship permits fail-closed/revocation only and cannot create a positive launch approval.
- Client reads return only their own sanitized status; internal reads require the exact relationship.

### Integrity, retries, and atomicity

- Same actor/request ID and same canonical input returns one replayed result with one event and one audit record.
- Reusing the request ID with changed input returns conflict and changes nothing.
- Concurrent writes with the same expected version produce one success and one conflict.
- A forced event, audit, or receipt failure rolls back the state update.
- Direct table grants and function grants match the contract; `anon` has no execute privilege.
- Function owner, `security definer`, empty search path, and fully qualified references are asserted.

### Staleness and scope

- Changing onboarding configuration makes prior test and launch evidence stale.
- Pausing or remapping Retell makes route-bound test and launch evidence stale.
- Failed/revoked/stale Make or test evidence blocks launch.
- An office-review launch never flips automation controls or performs an external provider action.
- Client consent in `workspace_automation_controls` cannot satisfy internal provider verification.
- Provider/service identities cannot record human launch approval.

### Evidence safety

- Validation rejects oversized summaries and secret-like/raw payload fields.
- Returned projection contains no Retell agent ID, connection ID, webhook URL, token, transcript, payment details, or real customer data.
- Embedded SQL tests use two fictional client tenants and at least two fictional internal identities.
- Hosted Supabase JWT/PostgREST tests are required before acceptance; embedded PGlite tests alone do not prove hosted Auth or API behavior.

## Risks and limitations

- Retell “active” currently proves an enabled private mapping, not live provider availability, phone-number assignment, credits, or agent publication. The fictional test attestation is still required.
- Make has no trusted status feed today. Its initial evidence remains a human attestation after manual Make review, clearly labeled as such.
- Existing Retell mapping actions authorize a client-workspace owner/admin (`src/app/actions/retell-provisioning.ts:29-30,64,85-86`). Mapping must therefore remain configuration, not proof. Restricting mapping changes to internal operators can be a separate hardening task.
- Existing automation controls are client-editable. They must remain consent/request records and cannot be treated as provider activation.
- The audit-trigger defect means current milestone persistence should be considered unreliable until repaired, regardless of UI appearance.
- No hosted database, provider account, or production environment was changed or verified in this review.

## Follow-up implementation boundary

The next implementation should be a migration/shared-contract task jointly owned by Atlas, Blake, and Quinn:

1. Atlas: additive schema, RPC/readiness contract, grants, recovery SQL, and isolation tests.
2. Blake: server adapters that call only the approved RPCs and replace legacy launch-stage decisions.
3. Quinn: independent RLS/RPC/JWT, cross-tenant, concurrency, atomicity, staleness, and no-side-effect verification.
4. Nova/Echo only after the contract lands: switch UI consumers and provider observation adapters without broadening office-review scope.

Until that work is accepted, keep the current canonical test and activation gates blocked.
