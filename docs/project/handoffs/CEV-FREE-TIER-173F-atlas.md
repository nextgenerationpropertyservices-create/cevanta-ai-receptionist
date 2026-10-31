# Agent handoff
- Task ID: CEV-FREE-TIER-173F
- Work completed: Independently reviewed the free-tier migration, plan summary contract, server preflight, database capacity triggers, managed provisioning replacement, and Retell ingress guard against `docs/architecture/FREE_TIER_CONTRACT.md`. **Decision: BLOCK** until the two contract gaps below are corrected and independently verified. The core plan enum/backfill/default, explicit managed-client plan, column-level tenant grants, tenant-scoped summary read, stable limit errors, tenant-row locking, and early Retell `plan_restricted` result otherwise match the approved direction.
- Files changed: `docs/project/handoffs/CEV-FREE-TIER-173F-atlas.md` only.
- Database changes: None in this review. Inspected `supabase/migrations/202610310001_workspace_plans.sql`. The migration backfills existing tenants before setting the `free` default; explicitly provisions operator-created clients as `managed_receptionist`; adds tenant-row-serialized lead/roster triggers; and checks the mapped tenant plan before Retell receipts, leads, or notification outbox writes. Existing `grant update(name,trade,timezone)` on `public.tenants` does not grant clients permission to write the new `plan` column.
- API or contract changes: None in this review. The implementation adds the approved plan identifiers and plan-summary shape. The Retell database result adds `plan_restricted` without exposing tenant or record identifiers.
- Verification commands and results:
  - Read `AGENTS.md`, both original build prompts, `docs/agents/COLLABORATION.md`, `docs/project/PROJECT_STATUS.md`, CEV-FREE-TIER-173F, the architecture contract, and the 173B handoff — PASS.
  - Compared the new managed-client and Retell function definitions with their latest prior definitions — PASS for preserved behavior plus the intended plan fields/guard.
  - Inspected tenant policies and grants across migrations — PASS: owners/admins have an RLS update policy, but authenticated callers retain only column-level update permission for `name`, `trade`, and `timezone`; `plan` is not client-writable.
  - Inspected `src/lib/workspace-plans.ts`, `src/lib/server/workspace-plan-queries.ts`, `src/lib/contracts.ts`, `src/lib/server/queries.ts`, `src/app/actions/intake.ts`, `src/app/actions/technician-roster.ts`, the focused plan tests, and the embedded runner — PASS for tenant-scoped summary reads, friendly preflight, stable database error mapping, and manual lead/roster limits.
  - Searched all application and migration plan enforcement references — **BLOCKING RESULT**: only manual lead, technician, and Retell ingress paths enforce plan state; reactivation and other locked automation mutations do not enforce the free-plan boundary server-side.
  - Local SQL/test commands were not rerun in this read-only review; 173B reports 72 focused Vitest tests, embedded database PASS, focused lint PASS, and direct TypeScript PASS. Those are specialist-reported local results, not hosted evidence.
- Known limitations:
  - No hosted Supabase Auth/JWT/PostgREST test was available. Embedded SQL does not prove hosted RLS or grants.
  - The tenant-row lock algorithm is structurally correct, but the final-slot race was not exercised with simultaneous hosted transactions.
  - The embedded runner creates its free and managed fixtures after all migrations. It does not execute the plan migration against a pre-existing tenant and therefore does not prove the actual backfill behavior.
  - The embedded runner does not invoke `provision_owner_workspace` or `provision_managed_client_workspace`; their plan assignments are supported by inspection/static assertions rather than end-to-end database evidence.
- Risks:
  - **BLOCKER 1 — locked product actions remain callable:** The approved contract requires reactivation campaigns and automated follow-up to fail closed for `free`. `src/app/actions/reactivation.ts` and its database commands contain no authoritative plan check. Hiding or describing this feature as locked in the interface is not authorization. A free owner/dispatcher can directly invoke campaign creation/review/scheduling with existing membership permissions. The same audit must cover every mutation behind SMS, email, external calendar, live booking, payment, dispatch, provider authorization, and automation controls; each free-plan mutation must fail closed at an appropriate trusted server/database boundary.
  - **BLOCKER 2 — rollout is not app-first compatible:** The contract requires application reads to tolerate a database response without `plan` as temporarily unavailable, never guess a paid/managed state. `Tenant.plan` is required, `getWorkspacePlanSummary` throws when the column/value is absent, and the workspace layout calls it for every workspace. `workspaces/page.tsx` also maps any non-`free`/non-`dashboard_plus` value—including a temporarily missing value—to “Managed receptionist.” Deploying the compatible app before the migration would make workspace routes unavailable or display a false managed label. Add an explicit unavailable state and use it until the migration is present, or obtain an Architect-approved migration-first maintenance rollout that prevents mixed-version requests.
  - **Required evidence gap:** The architecture contract lists actual backfill, both provisioning paths, cross-tenant/RLS denial, and simultaneous final-slot behavior as required before acceptance. Current focused evidence does not cover all of those. These may remain hosted-preview gates, but they cannot be reported as passed.
- Rollback notes: This review changes no runtime code or database state. Before any free tenant exists, the proposed migration can be rolled back as documented in the architecture contract. After a free tenant exists, preserve plan data and use forward repair; never delete customer records to resolve a limit issue.
- Exact next action: Morgan should create disjoint repair tasks for (1) authoritative free-plan guards on every locked mutation, starting with all reactivation commands, and (2) an explicit plan-unavailable rollout state. After fixes and focused tests, rerun this Architect review, then send the integrated candidate to Quinn for security review. Do not apply the migration or deploy this candidate while this review is BLOCK.

## Rerun after CEV-FREE-TIER-173G

- Review decision: **BLOCK remains.** The repair adds useful server-action checks and an explicit `unavailable` read value, but neither original blocker is fully closed.
- Improvements confirmed:
  - Reactivation actions, automation-control saves, Make authorization creation, and Retell mapping register/pause now query the tenant plan after authentication and fail closed when it is missing or `free`.
  - `getWorkspacePlanSummary` returns an explicit unavailable summary when the plan column/value is unavailable, rather than guessing `free` or managed.
  - The workspace picker explicitly labels an unknown value `Plan unavailable`.
- Remaining blocker 1 — database/direct-RPC bypass:
  - `create_reactivation_campaign`, `review_reactivation_candidate`, and `schedule_reactivation_visit` remain executable by `authenticated` and contain no database plan check. A free office user can bypass the guarded Next.js action and call these RPCs directly.
  - `workspace_automation_controls` still grants authenticated owners/admins direct column-level insert/update under RLS policies that check role but not plan. A free owner can bypass `saveAutomationControl` through PostgREST.
  - These are security/entitlement boundaries, so an action-only preflight is helpful UX but not authoritative enforcement. Add plan checks inside the security-definer reactivation commands and a database trigger or plan-aware RLS/check boundary for automation controls. Tests must attempt the direct RPC/table paths as a free authenticated tenant.
- Remaining blocker 2 — unavailable state still claims managed service:
  - `WorkspaceShell` maps every value other than `free` and `dashboard_plus` to `Managed receptionist`; therefore an unavailable plan displays a false managed badge.
  - The workspace Overview treats `unavailable` as non-free and displays managed/AI receptionist copy.
  - Billing branches only on `free`; `unavailable` falls into the managed pilot pricing/payment presentation.
  - Render a dedicated maintenance/unavailable state in the shell, Overview, and Billing before normal plan-specific content. Do not show free limits, managed entitlement, or pricing while plan state is unknown.
- Evidence issue: CEV-FREE-TIER-173G added no focused tests and did not run them. Its handoff reports only a TypeScript command pending coordinator confirmation and the existing OneDrive pnpm limitation. The original backfill/provisioning/hosted-concurrency evidence gaps also remain.
- Updated exact next action: Add database-level free-plan enforcement for directly callable reactivation and automation-control paths; complete unavailable-state rendering across Shell, Overview, and Billing; add focused direct-bypass and unavailable-UI tests; then rerun Atlas and Quinn reviews. Do not migrate or deploy while this decision is BLOCK.

## Final rerun after CEV-FREE-TIER-173H and 173I

- Final architecture decision: **ACCEPT WITH RELEASE LIMITATIONS.** The two architecture blockers are closed in the integrated local candidate. This accepts the migration/contract design; it is not production approval and does not replace Quinn or Release evidence.
- Trusted-boundary review:
  - `202610310002_free_plan_trusted_boundaries.sql` preserves the previously reviewed reactivation and Retell command implementations under private, non-executable names, then restores their public signatures with authenticated, relationship-aware plan wrappers.
  - Free or missing plans are rejected before the private reactivation/Retell commands can mutate records. Public wrapper grants remain limited to `authenticated`; direct execution of the private implementations is revoked from `public`, `anon`, `authenticated`, and `service_role`.
  - The automation-control trigger derives the plan from `NEW.tenant_id`, locks that tenant row, and rejects both direct inserts and updates for free/missing plans with a stable non-sensitive identifier. Existing RLS and column grants remain additive authorization boundaries.
  - The managed-plan path continues through the preserved command implementations. Embedded evidence exercises managed Retell register/pause and managed automation-control insertion.
  - Stripe now checks the related client workspace's authoritative plan after verifying the internal operator relationship and before the first provider request. Free/missing plans produce no Stripe product, price, or payment-link request.
- Unavailable-state review:
  - Workspace Shell now labels the state `Plan temporarily unavailable` rather than managed.
  - Overview stops before operational/AI widgets and reports that no free or managed services were assumed.
  - Billing stops before plan pricing, free usage, automation-control reads, or managed claims and reports `NO PLAN ASSUMED`.
  - Free and managed branches remain explicit and separately covered.
- Independent verification performed in this final review:
  - `node scripts/test-workspace-plans-embedded.mjs` — PASS. Reported plan defaults/limits, trusted-boundary guards, managed compatibility, and provider restriction assertions.
  - Focused Vitest for workspace-plan database assertions, Stripe guard, Workspace Shell, Overview, and Billing — PASS, 5 files / 29 tests.
  - Inspected both forward migrations, wrapper ownership/grants, trigger ordering, Stripe guard ordering, and unavailable UI branches — PASS for the reviewed architecture criteria.
- Remaining release limitations:
  - Embedded PGlite does not prove hosted Supabase JWT/PostgREST grants, concurrent final-slot serialization, or provider behavior. Hosted migration/authorization evidence remains required.
  - CEV-FREE-TIER-173H reports 15 failures in pre-existing reactivation/automation-control test harnesses because they do not mock the new plan preflight. Those suites must be repaired and pass; an architecture accept does not waive failing regression tests.
  - The earlier required evidence gaps for a true pre-existing-tenant migration backfill, both provisioning RPCs, and hosted concurrent final-slot writes remain explicit release gates unless Quinn/Release supply equivalent evidence.
  - Production build remains unproven in this review; 173I reports the known OneDrive `.next` filesystem failure.
- Final exact next action: Quinn should rerun direct-bypass/security review against both plan migrations. Morgan should repair the reactivation/automation-control test harnesses, then Phoenix should run the complete suite and a production build outside OneDrive plus authorized hosted-preview migration/RLS checks. Do not deploy to production without those gates and explicit owner approval.
