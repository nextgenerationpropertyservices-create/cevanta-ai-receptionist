# CEV-PROJECT-AUDIT-167T + 167U — Independent security review

Date: 2026-10-26  
Reviewer: Quinn (Quality and Security)

## Decision

**PASS WITH LIMITATIONS.** The final database and application pair repairs the Retell mapping authority defect identified in CEV-PROJECT-AUDIT-167C. Ordinary register, pause, and health operations now use the authenticated user's session client. PostgreSQL derives a confirmed, non-deleted identity and is the final authority for role, internal operator tenant, active managed-client relationship, target client type, and route scope. Client workspace owners/admins receive only a status value and cannot mutate a route. Provider identifiers stay private, and the existing service-role-only verified ingest command is unchanged.

No unresolved Critical, High, or Medium defect was confirmed in the final 167T/167U pair. This approval does not authorize a production deployment. Hosted Supabase JWT/PostgREST behavior, the migration itself, live Retell ownership, and real call delivery remain unverified.

## Authorization and identity findings

- Register/pause/health obtain the actor only from `onboarding_private.current_identity()`, which reads `auth.uid()` and requires a confirmed, non-deleted Auth record (`202610020006_onboarding_commands.sql:131-137`; `202610260004_authenticated_retell_mapping_commands.sql:84-87,167-170,220-224`). No actor or role is accepted from the client.
- Register and pause lock the active managed relationship, internal operator tenant, client target tenant, and operator membership before mutation. Authority requires owner/admin in an internal tenant linked to the target client with status `onboarding`, `pilot`, or `active` (`202610260004...sql:89-108,172-189`). The row locks prevent a concurrent archive or role removal from racing the checked mutation.
- Internal viewer/dispatcher/technician, unrelated operator, client owner/admin, client viewer, cross-tenant caller, anonymous caller, service role, unconfirmed user, deleted user, and archived/paused managed relationship all fail closed in the focused SQL suite.
- Health is intentionally narrower than mutation. A target client owner/admin may receive only `active`, `paused`, or `not_mapped`; an internal identity must still satisfy the active operator owner/admin relationship and cannot bypass an archived relationship through stale client membership (`202610260004...sql:35-68,207-238`).

## Privacy, grants, and route integrity

- The three public commands are PostgreSQL-owned `SECURITY DEFINER` functions with `search_path = ''`; execution is revoked from `PUBLIC`, `anon`, and `service_role` and granted only to `authenticated` (`202610260004...sql:70-79,154-162,207-215,241-260`).
- The two private authorization helpers remain non-executable by API roles. Direct `integration_private.retell_connections` access remains unavailable to anonymous, authenticated, and service-role callers. The public commands return status-only JSON.
- Register validates the `agent_...` format, serializes both the target route and connection-scoped agent key, preserves an existing other-tenant mapping on conflict, idempotently replays the same active mapping, and re-enables a same-tenant paused mapping (`202610260004...sql:110-150`). Pause is tenant-and-connection scoped and serialized with register (`202610260004...sql:191-203`).
- Health aggregates only route state for the exact target tenant and server-configured connection. It never returns the agent ID, private row ID, connection ID, provider account, or telemetry (`202610260004...sql:226-237`).
- Existing `ingest_retell_call_lead(jsonb)` remains a separate service-role-only, fixed-search-path command. The mapping migration does not change its function or grants. The independent ingest suite confirms mapping-based tenant resolution, deduplication, and rejection of ordinary roles still work.

## Application adapter and UI findings

- Register, pause, and health call `requireUser()` and use its Supabase session client; no service client or service-role key is imported or referenced (`src/app/actions/retell-provisioning.ts:39-53,78-89,104-115`).
- Tenant, connection, and agent values are schema-validated. The Make connection UUID comes only from the server environment. RPC errors and malformed results map to safe statuses without database detail.
- Each result parser is strict. Identifier-bearing or extra-field responses fail closed, so a future database regression cannot echo a provider ID through action state (`retell-provisioning.ts:12-20,54-69,90-99,116-121`).
- The Integrations page asks its authenticated RLS-scoped client for an active managed relationship before rendering map/pause controls (`integrations/page.tsx:17-29,99-112,182-199`). A client owner/admin still gets health, but no mutation form. A relationship-read error hides controls.
- Copy accurately requires the operator to verify the agent in Retell and states that mapping does not prove ownership, publish an agent, configure the phone number, prove live delivery, or change Retell/phone configuration (`integrations/page.tsx:183-198`; mapping/pause form messages).
- The UI relation check is guidance only; a crafted server-action call is still decided by the authenticated database command.

## Independent verification

- `node node_modules/vitest/vitest.mjs run --configLoader native tests/retell-provisioning.test.ts tests/integrations-ui.test.ts` — **PASS**, 2 files / 24 tests.
- `node scripts/test-retell-mapping-embedded.mjs` — **PASS**, identity/relationship/role/privacy/conflict/connection assertions.
- `node scripts/test-retell-lead-ingestion-embedded.mjs` — **PASS**, tenant mapping/deduplication/authorization assertions; confirms service-role ingest is unchanged.
- Runtime scan for `createServiceClient`, `@/lib/supabase/service`, and `SUPABASE_SERVICE_ROLE_KEY` across the four assigned Retell runtime files — **PASS by absence**.
- Rendered-UI source scan for `provider_account_id`, `connection_id`, or `agent_id` across the Integrations page/forms — **PASS by absence**.
- Known credential/webhook-prefix scan across owned migration, SQL test, runner, action, UI, and focused tests — **PASS by absence**.
- `git diff --check` across the 167T/167U owned implementation and tests — **PASS**, with only Windows LF-to-CRLF notices.

Atlas and Blake additionally report full Vitest **PASS** (56 files / 949 tests), typecheck **PASS**, lint **PASS**, all maintained database runners **PASS**, and a clean non-OneDrive webpack production build **PASS**. Those full/build results are specialist-reported rather than independently rerun here.

## Limitations and risks

- PGlite uses a synthetic Auth fixture and one connection. It does not prove hosted JWT/PostgREST claims, session revocation, or simultaneous route-management races.
- The database stores a trusted operator decision; it does not call Retell or prove provider-account ownership. The manual Retell ownership check and fictional end-to-end call remain mandatory.
- `MAKE_RETELL_INGRESS_CONNECTION_ID` must be a valid server-only UUID and must match the ingress connection. The action never reveals it.
- The page is reachable only to users who can open the client workspace. The database contract authorizes an active internal owner/admin relationship independently, but an internal operator who lacks client-workspace membership may require a separate supported navigation/access flow. This is an operator usability limitation, not an authorization bypass.
- Mapping status is route configuration, not live telemetry. `active` does not prove the agent is published, a phone number is assigned, Make is running, or a call succeeds.

## Required release order and hosted proof

1. Deploy the fail-closed 167U application adapter first.
2. Apply migration `202610260004_authenticated_retell_mapping_commands.sql` second. Do not restore ordinary service-role mapping execution during recovery.
3. With fictional identities on hosted Supabase, prove internal owner/admin map and pause; client owner/admin health only; internal lower-role, archived/paused relationship, stale membership, unrelated and cross-tenant denial; identifier-free results; and direct private-table denial.
4. Run one fictional Retell call through the correct route, verify exactly one correct-tenant lead, replay the event to prove no duplicate, pause the route, and verify the safe recovery path.
5. Keep claims limited to a manually verified mapping until live provider evidence exists.

