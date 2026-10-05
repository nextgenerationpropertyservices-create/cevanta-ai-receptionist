# Agent handoff

- Task ID: CEV-AUTO-16, Quinn readiness review.
- Work completed: Read current contract, role guide, original prompts, collaboration rules, project status, assignment and CEV-LIVE-15. Reviewed verified-user/membership authorization, ordinary Supabase client creation, CRM/Jobs/Calendar actions, Jobs/Calendar RLS and grants, existing automated and embedded SQL coverage, browser configuration and authentication logging. Independent review decision: local implementation evidence supports continuing scoped development; full delivered-module security acceptance and production readiness remain OPEN. No authorization bypass was verified in inspected code. Findings below are verified test coverage and product-copy defects, not claims of a live exploit.
- Files changed: docs/project/handoffs/CEV-AUTO-16-quinn.md only. Code, test, migration and other agents' records remain read-only.
- Database changes: None. Tests used disposable embedded databases. No hosted writes, account changes, membership changes, private session capture or browser changes.
- API or contract changes: None.
- Verification commands and results: `pnpm test` exit 0, 312 tests: foundation/CRM 146, intake 44, jobs 67, appointments 55. `pnpm test:db:embedded` exit 0, all four migrations plus foundation isolation/permissions/parent/identity/audit assertions. `pnpm test:intake:db` exit 0. `pnpm test:jobs:db` exit 0. `pnpm test:appointments:db` exit 0. These execute actual SQL in PGlite with synthetic Auth compatibility; they do not exercise Supabase Auth/JWT/PostgREST. Source searches in src, tests, SQL and text handoffs found no bearer/private-key-shaped literals in inspected scope; authentication warnings log only allowlisted category/status. No env values were read or recorded. `pnpm typecheck`, `pnpm lint`, `pnpm build`, browser E2E, live PostgREST/JWT tests, hosted CI and restore checks were NOT RUN by Quinn in this read-only readiness assignment; earlier recorded results do not become fresh passes. Morgan owns integrated checks and acceptance.
- Known limitations: CEV-LIVE-15 supplies recorded owner-only browser creation/edit/reload and appointment creation/reschedule/reload evidence. Quinn did not independently replay it. No technician identity/assignment exists in that recorded workspace; no multiuser access is inferred from the owner session. Image binaries, runtime log history, private configuration, every document and every repository file were not exhaustively audited. Secrets search is limited evidence, not a complete secrets certification.
- Risks: Tenant leakage or excessive permissions in actual hosted JWT/PostgREST behavior remain unverified, with high impact if present. Embedded fixtures deliberately set the subject directly; they cannot verify JWT validity, refresh, expiration, gateway grants or hosted schema drift. Required cross-module acceptance must stay open until the matrix below passes. No blocking implementation exploit is asserted without reproduction.
- Rollback notes: Reverting this handoff removes documentation only. No schema/data recovery is needed. Do not rerun installed migrations 003/004 or repurpose existing user memberships for testing.
- Exact next action: Morgan creates the smallest scoped real-Auth/PostgREST authorization test task below, assigns exact test ownership, and obtains isolated fictional test identities using an approved fixture/provisioning path. Continue independent preparation if live identities are unavailable. Do not request ordinary approval for writing the scoped tests.

## Verified findings

### Q16-01 — Medium: foreign-tenant browser assertion cannot detect read-only leakage

Location: tests/e2e/foundation.spec.ts, authenticated owner/admin workflow, final foreign-workspace assertions.

Exact reproduction of the test weakness: inspect the final navigation to the foreign tenant. Its only assertions are that Create customer is absent and the customer name created in the original tenant is absent. A response rendering another tenant's existing customer names with no creation button satisfies both assertions. Expected: verify a known fictional foreign sentinel is absent and assert an explicit unavailable/denied outcome, then directly test the foreign record/table through authenticated PostgREST. Actual: neither foreign sentinel nor denial outcome nor direct data request is asserted. This is a verified missing security assertion; no actual live leakage was reproduced. Fix in the next test task, preserving real authorization.

### Q16-02 — Low: dashboard advertises installed modules as future work

Location: src/app/workspaces/[tenantId]/page.tsx, coming-next text.

Exact reproduction: sign in and open an accessible workspace overview; the footer says Dispatch and scheduling will connect in later milestones. Expected: copy reflects delivered Jobs and Calendar and only identifies undelivered AI calls as future work. Actual: source still labels all three as future. Source inspection confirms the defect; Quinn did not repeat a browser observation. Assign a separate Frontend copy fix; it is not a security blocker.

### Q16-03 — Low: current status understates the executed test count

Location: docs/project/PROJECT_STATUS.md verification table.

Exact reproduction: run `pnpm test`; observed 312 total and 55 appointment tests. Status reports 310 total and 53 appointment tests. Expected: fresh command evidence and timestamp determine the reported result. Actual: status retains the older count. Morgan can reconcile during integration; no code fix is required.

## Remaining live acceptance matrix

| Identity or condition | Expected behavior to prove through app and direct authenticated PostgREST |
| --- | --- |
| Anonymous, malformed token, expired token | Protected app redirects to sign-in; direct protected data/RPC access denied, no customer data returned |
| Verified user without memberships | No workspace/tenant records accessible; tenant supplied in body/query cannot confer membership |
| Owner and admin in fictional tenant A | CRM, intake, Jobs and Calendar permitted; settings update permitted; foreign tenant B rows and links denied |
| Dispatcher in A | Office record creation/edit and scheduling permitted; settings update denied directly as well as through app |
| Viewer in A | Same-tenant read allowed per documented module policy; creation/update denied directly; no permission inferred from hidden controls |
| Technician T1 and T2 in A | CRM/lead reads follow current documented same-tenant policy; Jobs and Calendar expose only currently assigned Jobs/appointments; direct detail IDs cannot bypass assignment; all office mutations/settings writes denied |
| Foreign member in B | Tenant A lists/details absent and writes denied; cross-tenant customer/location/lead/job/appointment references rejected |
| Assignment transfer T1 to T2 then clear | New browser/database reads immediately remove Job and appointment from T1, expose them to T2, then remove from both when unassigned; do not change existing memberships |
| Retry and failure | Same submission repeated and concurrent duplicate requests yield one lead/Job/appointment and expected audit count; hostile immutable tenant/parent/token changes and malformed inputs denied; failed writes add no success state/audit event |

Audit reads and expected actor/count should be checked with the permitted office identity; raw payloads, emails, tokens and session cookies must never be placed in evidence. Role revocation/demotion and membership-deletion live cases remain separate until disposable-only membership mutations are assigned explicitly. Assignment transfer alone does not prove those cases. Appointment cancellation/reload, lead conversion/reload and CRM contact/location/equipment edit/reload also lack independently recorded current multiuser live evidence.

## Minimal meaningful next test task

Suggested task ID: CEV-AUTO-16-AUTH-01. Owner: Quinn, with Phoenix responsible for separately owned disposable real Supabase runtime/provisioning preparation if needed. Dependencies: approved current role contracts and four installed migrations, real Auth/PostgREST runtime, browser runtime, explicit fictional fixture scope. Suggested exact allowed files for Quinn: tests/e2e/authorization.spec.ts, scripts/test-auth-live.mjs, docs/project/handoffs/CEV-AUTO-16-AUTH-01-quinn.md. Morgan must grant these paths in the ledger before edits; no migration/shared-contract edits are needed for test preparation.

Prepare runner and browser tests without requiring private live credentials: use a disposable local Supabase stack when supported, or existing approved isolated development fixture tenants/accounts supplied privately. Required fixture identities are owner, admin, dispatcher, viewer, two technicians in A, a B-only member and a verified no-membership user. A contains known fictional CRM/lead records, a Job assigned to T1, an unassigned Job and linked appointments; B contains a different known fictional sentinel. Existing owner CEV-LIVE-15 can add owner smoke evidence but cannot stand in for these identities. Provisioning must be trusted administrative setup, separated from ordinary app requests; never add service credentials to application code or alter current real memberships.

First executable slice: authenticated direct PostgREST reads/writes and browser list/detail checks for assigned technician T1, unassigned technician T2, viewer, no-membership and B-only member; office owner reassigns only a fictional Job T1 → T2 → unassigned, while both technician sessions verify Job and appointment visibility after fresh reads. Add owner/admin/dispatcher mutation checks and settings denials before accepting the complete role matrix. Fix Q16-01 by checking the known foreign sentinel and explicit denial outcome. Retries, immutable-field attempts, cancellation and validation/failure checks complete the delivered-flow acceptance task.

Use actual sign-in to obtain tokens in memory only; use public/publishable application credentials for ordinary requests. Do not use the existing private browser session as a token source. Evidence records role alias, operation, expected/actual allow/deny, affected fictional-row count and command exit result. Redact provider errors and disable traces/screenshots/page dumps/session persistence. Missing required fixture inputs must produce a clear blocked result rather than a green skip-only suite. Run full relevant checks before Morgan accepts the task, and label hosted evidence separately from local Supabase evidence.
