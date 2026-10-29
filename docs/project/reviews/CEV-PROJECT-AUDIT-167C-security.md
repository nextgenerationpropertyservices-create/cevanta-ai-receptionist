# CEV-PROJECT-AUDIT-167C — Security and tenant-safety review

Date: 2026-10-26  
Reviewer: Quinn (Quality and Security)  
Review type: Independent source, migration, contract, and focused-test review

## Decision

**Full application / all-products production release: REJECTED.** The current tree still has an invitation bearer token in the URL query, a job-delete contract that cannot succeed, client-editable milestones that can label a client “live,” and several non-atomic multi-record workflows. Email, SMS, external calendar writes, automatic booking, subscription billing, payment reconciliation, and automatic dispatch also remain outside the proven release boundary. Retell mapping and Reactivation authority defects are repaired locally, but their hosted migrations and role/JWT evidence remain release gates.

**Narrow managed pilot: CONDITIONAL PASS.** Cevanta may be offered only as a closely monitored AI-receptionist call-to-lead workflow in which a verified provider event creates one tenant-scoped lead for office review. The pilot must meet all of these conditions:

1. Deploy the approved authenticated Retell adapter before its migration, complete the hosted positive/negative role checks, and have a trusted Cevanta operator manually verify the Retell/Make tenant mapping. Until that hosted proof is complete, the narrow pilot remains operator-managed and the legacy mapping action must not be exposed to an external client owner/admin.
2. The current invitation-link flow is not sent to a client until CEV-PROJECT-AUDIT-167P replaces query-string bearer transport. Use an approved private access-provisioning process meanwhile.
3. Reactivation, Stripe link creation, email, SMS, external calendar writes, automatic booking, payments, subscriptions, and automatic dispatch stay off.
4. Each client passes a fictional end-to-end call, correct-workspace check, duplicate-replay check, and pause/recovery check before real calls.
5. Operators monitor the first calls because an unmapped event is currently acknowledged without a durable failure record.
6. No launch or provider claim relies on the client-editable legacy milestone row.

No Critical defect or direct cross-tenant read/write exploit was confirmed in the guarded call-to-lead database ingestion contract. This is not evidence that the entire dashboard or every advertised product is ready.

## Severity key

- **Critical:** direct compromise, credential exposure, or broad cross-tenant access with no meaningful precondition.
- **High:** plausible tenant misrouting, privileged-boundary bypass, or a release-breaking integrity failure.
- **Medium:** material privacy, authorization, availability, or consistency defect requiring repair before the affected workflow is released.
- **Low:** defense-in-depth or operational hardening gap with limited immediate impact.

## Confirmed defects and current disposition

| ID | Severity | Finding | Evidence | Disposition |
|---|---:|---|---|---|
| C-1 | High | The reviewed baseline used the service role for ordinary Retell mapping and allowed a client-workspace owner/admin to claim an unmapped syntactically valid agent ID without database-verifiable internal-operator authority. | Baseline proof is retained in the exact reproduction section; final database/app pair at `202610260004_authenticated_retell_mapping_commands.sql` and `src/app/actions/retell-provisioning.ts`. | **Resolved locally by 167T + 167U and independently approved.** Authenticated commands now derive confirmed identity, require an active internal owner/admin managed relationship for mutations, return status only, and leave service-role ingress unchanged. Release still requires adapter-first/migration-second hosted role/JWT and fictional route tests. |
| C-2 | High | The reviewed baseline exposed broad Reactivation reads/direct state changes, and the first database-only repair would have made the legacy direct-write adapter incompatible. | Baseline proof and repair contract are recorded under 167K; final adapter at `src/app/actions/reactivation.ts:25-138`. | **Resolved locally by 167K + 167L and independently approved.** The app now uses only the narrow actor-deriving RPCs and validates results before success. Release still requires adapter-first/migration-second hosted role/JWT tests. |
| C-3 | Medium | Invitation links place the raw one-time bearer token in the query string. The token can enter browser history, same-origin referrers, analytics, screenshots, or request logs. Recipient binding reduces account-takeover impact but does not make query transport acceptable. | `src/app/actions/invitations.ts:69`; `src/app/invite/page.tsx:9-24`; `next.config.ts:11` | Open under 167P. CEV-PROJECT-AUDIT-167O fixed issuer/acceptor digest compatibility but intentionally did not fix transport. Keep invitation release blocked. |
| C-4 | Medium | The job-delete action can never succeed for an authenticated application user. It issues a direct table delete, while the jobs migration intentionally grants no delete policy/privilege and the database test asserts deletion is denied. | `src/app/actions/jobs.ts:72-87`; `supabase/migrations/202610020003_dispatch_jobs.sql:47-54`; `supabase/tests/jobs_isolation.sql:46` | Open under 167M/167N. Add a narrow tenant-safe command and adapt the action; do not restore broad delete grants. |
| C-5 | Medium | Job conversion and technician roster/profile synchronization are non-atomic. A job can commit before its lead-status update fails; retry then returns “Job already saved” without repairing the lead. A roster write result is checked only after a linked profile update, so one record can change while the other fails. | `src/app/actions/jobs.ts:18-27,43-60`; `src/app/actions/technician-roster.ts:18-30` | Open. Replace each related-write sequence with one transaction/RPC or a durable repair command and test forced failures plus replay. |
| C-6 | Medium | Client workspace owners/admins can directly set payment, Retell, Make, test-call, and launch milestone values; the internal Clients page converts those values into stage `live`. The Launch and Integrations pages now warn that these are not telemetry, and canonical activation remains blocked, but the internal stage is still an untrusted claim. | `src/app/actions/onboarding-milestones.ts:11-28`; `supabase/migrations/202610210001_client_onboarding_milestones.sql:19-34`; `src/app/workspaces/[tenantId]/clients/page.tsx:164-170`; canonical block at `src/lib/provisioning-readiness.ts:101-116` | Open. Implement the Architect-reviewed trusted launch attestation/readiness contract from 167H. Legacy milestones may remain progress notes only and must not drive “live” or provider-verification status. |
| C-7 | Medium | Both Retell ingress paths return HTTP 202 for a valid but unmapped event and create no durable failure/attention record. Upstream may treat 202 as final success, allowing a real call to disappear from the dashboard after a mapping error. | `src/app/api/integrations/retell/route.ts:50-60`; `src/app/api/integrations/make/retell-lead/route.ts:193-205` | Open. Add an Architect-reviewed minimal failure receipt/attention queue and an explicit safe retry/replay policy before unattended scale. Monitor the narrow pilot manually. |
| C-8 | Medium | The reviewed baseline redirected a hosted payment URL, client label, payment type, and amount through the Clients-page query string and had no bounded provider deadline. | Baseline locations were `src/app/actions/stripe-payment-links.ts:30,94-104` and `src/app/workspaces/[tenantId]/clients/page.tsx:174,214`. | **Resolved locally by 167S and independently approved.** Results now remain in authorized action state, exact Stripe hosts are validated twice, and each request has a five-second header/body deadline. Live Stripe checkout and payment reconciliation remain unverified, so link creation stays outside the narrow pilot until a fictional test-mode proof. |

## Exact reproduction or proof steps

### C-1 — Retell mapping can be claimed through the wrong authority boundary

These steps reproduce the reviewed baseline before 167T/167U. The current local tree repairs the path as described below.

1. Authenticate as an owner/admin of any client workspace.
2. Call `registerRetellAgentMapping(clientTenantId, validUnmappedAgentId)` with an `agent_...` identifier.
3. The action checks only membership in that same client workspace, then switches to `createServiceClient()` and calls the service-role-only RPC.
4. The RPC inserts the mapping if the agent ID is not already mapped; it does not prove an internal managed relationship or provider assignment.
5. A later correctly authenticated ingest event with that agent ID resolves the newly claimed tenant.

Expected: only a trusted internal operator can bind an agent that the provider account proves belongs to the intended managed client.  
Baseline actual: the first client-workspace owner/admin to submit an unmapped valid ID could bind it. This proof was static and non-mutating; no live provider mapping was changed.

### C-2 — Reactivation migration/app version mismatch

These steps describe the intermediate 167K-only state. The final local 167L adapter resolves the incompatibility.

1. Apply the current migration tree through `202610260002_reactivation_database_hardening.sql`.
2. Run `pnpm test:reactivation:db`; the suite proves authenticated direct `INSERT`, `UPDATE`, and `DELETE` are denied.
3. Submit the current create/approve/dismiss server actions.
4. Those actions still call `.insert()`/`.update()` on the revoked tables, so the secure database correctly rejects them.

Before 167K, a safe fictional embedded reproduction showed a same-tenant viewer could read one campaign and its personalized candidate, while a dispatcher could directly forge an approved campaign and a booked candidate. The 167K suite now proves those paths are denied. Do not recover availability by restoring direct grants.

### C-3 — Invitation token appears in the URL

1. Run `pnpm exec vitest run --configLoader native tests/invitations.test.ts`.
2. The fixed-vector test confirms issuer and SQL digest algorithms now match.
3. The same test confirms the returned link still has `/invite?request_id=...&token=...`.
4. Opening that link leaves the token in the address bar until a separate transport repair removes it.

Expected: a URL fragment or other non-logged handoff is immediately exchanged for an opaque HttpOnly, Secure, SameSite continuation; the clean URL replaces the original.  
Actual: the bearer remains in the query string.

### C-4 — Job deletion is denied by design while the UI offers it

1. Create a fictional job as an office-role user.
2. Invoke `deleteJob` for that tenant/job.
3. The action sends a direct delete.
4. Database RLS/grants reject it and the action returns “Unable to delete this job.”
5. `pnpm test:jobs:db` passes because the maintained isolation suite expects direct delete denial.

### C-5 — Related writes can partially commit

- Job conversion performs the job insert and lead-status update as separate committed requests. Force the lead update to fail after the job insert (for example, remove/update the lead in a concurrent authorized session). The job remains; retry finds the job/submission and exits before repairing lead status.
- Technician edit performs the roster request, then may update a linked profile before checking the roster request's error. Force the roster request to fail while the linked-user lookup succeeded; the profile request can still commit before the action reports failure.

Expected: both related records commit or both roll back.  
Actual: the code has no shared transaction and no repair-on-replay path.

### C-6 — Client-editable milestones can label a client live

1. Sign in as a client-workspace owner/admin.
2. Submit the milestone action with values matching paid/passed/verified/approved.
3. RLS permits the upsert for that same tenant.
4. The internal Clients page computes `launchReady` from those values and returns stage `live`.

Expected: trusted provider/test/launch evidence is written only by the authorized internal operator or verified provider observation.  
Actual: client progress data can produce the internal live label. Canonical activation remains blocked, which limits operational impact.

### C-7 — Unmapped provider event is acknowledged without recovery evidence

1. Send a correctly authenticated fictional event whose agent mapping is absent/paused.
2. The database returns `unmapped_tenant`.
3. Each route responds HTTP 202 with `persisted: false`.
4. No lead, failure receipt, retry item, or operator notification is stored.

Expected: fail/retry semantics or a durable minimal recovery record.  
Actual: the delivery may be considered successful upstream even though the dashboard received nothing.

## Remediation reviews completed in this audit

### CEV-PROJECT-AUDIT-167I — Make ingress and management deadlines

**Approved locally.** One five-second deadline now spans stalled ingress body reads and the Make management call through response-body parsing. Abort/listener/timer cleanup is present, provider errors are redacted, no retry or payload logging was added, and auth/mapping/deduplication contracts did not change (`src/app/api/integrations/make/retell-lead/route.ts:134-175`; `src/lib/server/make-management.ts:40-73`).

Independent evidence: `tests/make-retell-lead-ingress.test.ts` and `tests/make-management.test.ts` passed, 2 files / 20 tests. This does not prove Vercel buffering or live Make behavior. Make may finish a credential request after the local abort, so an operator must check Make before retrying.

### CEV-PROJECT-AUDIT-167J — Milestone audit-trigger repair

**Approved locally; hosted application remains unverified.** The original generic trigger expected an `id` field that `client_onboarding_milestones` does not have, producing SQLSTATE 23502. The additive repair uses non-null `tenant_id` as the stable coarse audit entity, keeps a fixed empty search path, revokes direct execution, and retains role/tenant RLS (`supabase/migrations/202610260001_client_onboarding_milestone_audit_repair.sql`).

Independent evidence: `pnpm test:db:embedded` passed with owner insert, admin update, audit actor/action/entity checks, and anon/dispatcher/forged/cross-tenant denial. This repair does not make legacy milestones trustworthy.

### CEV-PROJECT-AUDIT-167K — Reactivation database hardening

**Approved locally as the database contract; do not deploy alone.** The migration now provides:

- confirmed, non-deleted owner/admin/dispatcher-only reads;
- no direct authenticated writes;
- fixed-search-path authenticated RPCs;
- actor-derived creator/reviewer/scheduler attribution;
- actor-bound request replay protection;
- bounded/null-checked input;
- tenant/customer/lead relationship validation;
- atomic campaign/candidate creation and atomic internal job/appointment scheduling;
- no email, SMS, weather, payment, external calendar, automatic booking, or dispatch side effect.

Independent evidence: `pnpm test:reactivation:db` passed the office-read/RPC/direct-write/tenant/identity/replay/atomicity suite; `pnpm test:db:embedded` passed the full migration sequence. Embedded Auth and one-connection execution do not prove hosted JWT/PostgREST or true concurrency.

### CEV-PROJECT-AUDIT-167L — Reactivation application adapter

**Approved locally with limitations.** Campaign creation, candidate approve/dismiss, and internal scheduling now consume only the 167K commands after office-role authorization. History reads are tenant-filtered, client-forged state/actor/linkage fields are stripped, request reuse is preserved, and result mismatches fail closed. The initial review found that scheduling trusted any error-free RPC response; the final repair requires exactly one strict `{ job_id UUID, appointment_id UUID }` row and includes five negative cases.

Independent evidence: focused Reactivation tests passed, 2 files / 20 tests, and the embedded Reactivation database suite passed. See `docs/project/reviews/CEV-PROJECT-AUDIT-167L-security.md`. Deploy the adapter before the migration and run hosted role/tenant/JWT tests before offering the feature.

### CEV-PROJECT-AUDIT-167T + 167U — Authenticated Retell mapping

**Approved locally with limitations.** Ordinary map, pause, and health operations now use the authenticated session client. PostgreSQL derives a confirmed, non-deleted identity; only an active managed-client internal owner/admin may mutate; client owner/admin access is status-only; lower roles, stale/archived relationships, and cross-tenant callers fail closed; provider identifiers stay private; and service-role ingress is unchanged.

Independent evidence: focused action/UI tests passed, 2 files / 24 tests; mapping and lead-ingestion database suites passed; service-client and identifier-render scans were clean. See `docs/project/reviews/CEV-PROJECT-AUDIT-167TU-security.md`. Release requires 167U adapter first, migration 167T second, and hosted role/JWT plus fictional correct-tenant/dedupe/pause verification.

### CEV-PROJECT-AUDIT-167O — Invitation digest alignment

**Approved locally, but invitation release remains blocked.** The action now decodes the canonical base64url token to exactly 32 bytes, re-encodes to prove canonical form, and hashes those bytes exactly as SQL does (`src/app/actions/invitations.ts:25-38`). The deterministic test proves the new digest differs from the former token-text digest and that invalid/noncanonical output fails before authorization/RPC.

Independent evidence: focused invitation test passed, 1 file / 2 tests. Blake separately reported full Vitest 54 files / 908 tests and a clean temporary webpack build. CEV-PROJECT-AUDIT-167P must still replace query-string token transport.

### CEV-PROJECT-AUDIT-167Q — Tracked personal setup data

**Approved for the current working tree.** The identified real owner email/Auth identifiers were removed from current tracked setup/history files, the development SQL now fails safely with a non-routable `.invalid` placeholder, and `.deploy-worktree/` plus `demo-video-output/` are ignored. No credential value was found in the targeted or generic known-secret-prefix scans.

History advice: the removed values were personal metadata, not credentials. If the repository has remained private to intended collaborators, a destructive history rewrite is not proportionate; retain the current redaction and keep identifiers in the provider console. If the repository or an archive was shared publicly or outside the intended team, create a separate owner-approved history-sanitization task, coordinate any force-push with collaborators, and verify cached artifacts. No credential rotation is indicated by this finding alone.

An untracked downloaded `tools/` tree also exists. It did not match known credential prefixes in this review, but it is generated third-party content and should not be committed without explicit inventory/licensing/security review.

### CEV-PROJECT-AUDIT-167S — Stripe result privacy and deadlines

**Approved locally with limitations.** The final action returns a validated one-time hosted link in authorized action state rather than a redirect/query, preserves owner/admin plus internal-tenant and exact managed-client checks, validates exact Stripe hosts on both server and client, and applies one five-second deadline through response parsing for each provider request. In-page failures retain the same request ID/idempotency keys; success rotates it. No automatic retry, recurring price, subscription, webhook, provider logging, or payment-status claim was added.

Independent evidence: focused Stripe/managed-client tests passed, 2 files / 26 tests, including explicit unconnected-client denial before any provider fetch; query-name and credential-prefix scans were clean. See `docs/project/reviews/CEV-PROJECT-AUDIT-167S-security.md`. No live Stripe checkout was performed, and payment completion remains manual/untrusted.

## Claim and safety review

### CEV-PROJECT-AUDIT-167B product wording

**Pass with limitations.** The catalog correctly labels the Lead Rescue Starter as manual office review, Reactivation as guarded/setup-required, and quote/blueprint products as planned/not live (`src/lib/product-catalog.ts:28-38,48-58,68-77,88-113`; `products/page.tsx:17-29,42-46`).

Limitations:

- The “up to 25” starter limit is commercial/process wording, not an enforced software quota.
- Reactivation must not be sold as available until the approved 167L adapter and 167K migration pass hosted role tests and a client-specific controlled test.
- Suggested prices are commercial suggestions, not proven ROI.
- No planned product may imply working outreach, blueprint extraction, weather triggers, provider messaging, or autonomous booking.

### CEV-PROJECT-AUDIT-167E Launch and Integrations wording

**Pass with limitations.** The pages now distinguish saved operator records from provider telemetry, show unavailable instead of inventing health, state that optional automations remain off, and preserve canonical activation blocks (`integrations/page.tsx:16-63,96-103`; `launch/page.tsx:13-40,151`; `provisioning-readiness.ts:101-116`).

The client-editable milestone boundary in C-6 remains unresolved. Those fields are legacy progress notes, not provider/test/payment/launch proof. A route marked active proves a private database mapping, not that Retell is published, the number is assigned, credits are available, or a call currently succeeds.

## Sampled protected-operation matrix

| Workflow | Auth/membership/role | Input and tenant scope | Database defense | Review result |
|---|---|---|---|---|
| Ordinary protected pages/actions | `auth.getUser()` plus exact tenant membership in `requireMembership` | UUID and feature schemas; tenant filters | RLS on tenant tables | Good baseline (`src/lib/server/authorization.ts:8-23`). Live session-revocation behavior still unverified. |
| Managed-client archive | Confirmed identity; internal tenant owner/admin; exact managed relationship | Bounded exact confirmation phrase and client selector | Security-definer command, row locks, archive/audit in one transaction, authenticated-only execute | Good; recoverable archive rather than destructive tenant deletion (`202610190002_managed_client_workspace_archive.sql:5-38`). |
| Invitation issue/accept | Internal operator owner/admin and managed pair at issue; confirmed recipient identity and token/tenant/user/email match at acceptance | Strict keys, UUIDs, canonical email, bounded expiry, one-time digest | Private invitation table, fixed-search-path commands, actor/recipient binding, advisory lock | Digest fixed; query transport still blocked. |
| Job create/update | Office role; tenant-scoped parents and technician roster | Job schema, customer/location/lead relationship checks | RLS and composite tenant relationships | Authorization is sound; related lead update is non-atomic. Delete contract is broken. |
| Technician roster | Settings role and tenant lookup | Roster schema and tenant-scoped linked account | RLS plus narrow link RPC | Link boundary is reasonable; roster/profile update is non-atomic. |
| Retell/Make ingress | Provider signature or secret, not end-user auth | Raw-byte budget, freshness for HMAC, strict envelope/fields | Service-role-only ingest RPC resolves tenant from private mapping; event/call dedupe is transactional | Service role is appropriate here. Recovery/rate limits remain; mapping authority is repaired locally. |
| Retell mapping management after 167T/U | Confirmed identity; active internal managed-client owner/admin for mutation; client owner/admin health only | Tenant/connection/agent validation and strict status-only results | Fixed-path authenticated commands, private table, relationship/role locks, connection-scoped conflict handling | Approved locally; hosted migration/role/JWT and manual ownership/call proof pending. |
| Reactivation after 167K/L | Confirmed office identity derived in DB | Strict keys, bounded fields, tenant/customer/lead validation and strict command results | Office-only RLS, no direct writes, narrow atomic RPCs | Database and app contracts approved locally; hosted evidence pending. |
| Legacy launch milestones | Client tenant owner/admin | Enum schema and tenant filter | RLS and repaired audit trigger | Suitable only for progress notes; not trusted readiness or launch proof. |

## Provider, privacy, and defense-in-depth risks

These were not demonstrated as direct exploits in the guarded pilot, but they should remain visible:

1. Public ingress has local byte/time limits but no shared distributed rate/concurrency limit or fleet-wide admission control.
2. Make accepts a timestamped HMAC or a long-lived static Bearer fallback. The fallback has no freshness protection and needs rotation/revocation operations.
3. Default Make credential requests ask for wildcard Gmail and Google Calendar modules (`src/lib/server/make-management.ts:17-20`). Narrow the requested modules to the minimum approved operations.
4. Make authorization requests are not durably bound to a workspace, polled, or mapped to a scenario in Cevanta. Any authorized status still needs manual Make verification.
5. Onboarding-to-Sheet sync sends contact/escalation data to a secret Make webhook without a second signed envelope, durable receipt, or server retry ledger.
6. The base RLS helper checks the authenticated subject and membership, while newer sensitive RPCs also confirm that the Auth identity is confirmed and not deleted. Hosted stale-session and account-deletion behavior should be tested explicitly.
7. Explicit application CSP/HSTS headers were not found in the reviewed Next configuration; hosting defaults were not verified.
8. A prior project record says leaked-password protection was disabled. Current hosted Auth settings were not rechecked.

## Verification evidence

### Independently run by Quinn

- `pnpm exec vitest run --configLoader native tests/invitations.test.ts` — PASS, 1 file / 2 tests.
- `pnpm test:reactivation:db` — PASS, office reads/RPC/direct writes/tenant/identity/replay/atomicity.
- `pnpm test:db:embedded` — PASS, all migrations through 167K plus RLS/role/identity/parent/audit assertions.
- `pnpm test:jobs:db` — PASS; importantly, the suite preserves direct job-delete denial and therefore confirms the action/contract mismatch.
- `pnpm exec vitest run --configLoader native tests/make-retell-lead-ingress.test.ts tests/make-management.test.ts` — PASS, 2 files / 20 tests.
- `pnpm typecheck` — PASS.
- `pnpm lint` — PASS.
- Updated 167S focused Stripe/managed-client suite — PASS, 2 files / 26 tests.
- Final 167L focused Reactivation suite — PASS, 2 files / 20 tests.
- Final 167T/U focused action/UI suite — PASS, 2 files / 24 tests.
- `node scripts/test-retell-mapping-embedded.mjs` and `node scripts/test-retell-lead-ingestion-embedded.mjs` — PASS.
- Earlier focused audit run across auth, onboarding, managed clients, recovery, Retell, Make, Reactivation, products, Launch, and Integrations — PASS, 12 files / 338 tests.
- Generic known credential-prefix scan of the current source tree — no match.
- Current `.deploy-worktree/` and `demo-video-output/` ignore rules verified; generated contents were not deleted or exhaustively inspected.

### Specialist evidence reviewed, not treated as independent live proof

- 167O: Blake reports full Vitest 54 files / 908 tests, typecheck/lint, and a clean temporary webpack production build PASS.
- 167K: Atlas reports full Vitest 54 files / 908 tests, typecheck/lint, all embedded suites PASS; current OneDrive build remains blocked by the known worker/filesystem failure.
- 167J: Atlas reports all configured embedded suites PASS; current OneDrive build blocked for the same environment reason.
- 167U: Blake reports full Vitest 56 files / 949 tests, typecheck/lint, mapping DB, and a clean non-OneDrive webpack build PASS.

## Checks not run or not proven

- No hosted Supabase migration was applied by Quinn.
- No live Supabase Auth/JWT/PostgREST, session revocation, or browser multi-role test was run. Embedded Auth is a compatibility fixture.
- No real concurrent two-connection race test was run for replay/locking contracts.
- No live Retell, Make, Stripe checkout, email, SMS, calendar, payment, or dispatch call was made.
- No Vercel edge buffering, WAF/rate-limit, production header, or distributed-concurrency behavior was verified.
- No independent production build completed in the OneDrive workspace. The environment has a known Turbopack/webpack filesystem failure; specialist clean temporary webpack builds cover 167O, 167L, 167S, and 167U.
- Git history, remote mirrors, caches, and ignored/generated media were not exhaustively searched. Current-tree redaction does not erase history.

## Required release gates

Before a **full application** release:

1. Deploy the approved 167U authenticated adapter before 167T, then run hosted role/JWT and fictional correct-tenant/deduplication/pause tests.
2. Deploy the approved 167L fail-closed adapter before 167K, then run hosted positive/negative role and tenant tests.
3. Complete 167P and prove the invitation token is removed from the address bar/history before protected navigation.
4. Complete 167M/167N and prove permitted job removal plus protected-linked-record failure behavior.
5. Replace legacy milestone-driven `live` status with the 167H trusted readiness projection.
6. Add an unmapped-ingress failure ledger/attention flow and an explicit retry/replay policy.
7. Make job/lead conversion and roster/profile synchronization atomic or durably repairable.
8. 167S is approved locally; before Stripe link generation is offered, run a fictional Stripe test-mode request/checkout and document manual confirmation/recovery. Subscription billing and automatic payment status remain separate unbuilt capabilities.
9. Run a clean non-OneDrive production build and hosted multi-role/JWT/PostgREST tests with two fictional tenants.
10. Keep every unimplemented provider automation labeled off/design-only until its own provider, consent, idempotency, delivery, recovery, and rollback evidence passes.

For the **narrow call-to-lead pilot**, only the conditions in the Decision section are approved. Nothing in this review authorizes a production deployment, migration application, provider mutation, or broader sales claim.
