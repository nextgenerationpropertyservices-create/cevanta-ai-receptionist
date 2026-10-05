# CEV-SELF-SERVE-73A — Phase 1 owner signup and first-workspace provisioning

Owner: Morgan — Product Manager and Orchestrator
Status: implemented and accepted with limitations on 2026-10-05

## Scope

Build the first safe self-service SaaS slice so a new HVAC owner can create an account, confirm email, sign in, and create their first Cevanta workspace without manual membership provisioning.

## Dependencies

- Supabase Auth must be configured for email signup and confirmation.
- Hosted development Supabase project must have reviewed onboarding migrations 005 and 006 installed.
- Production deployment remains blocked pending explicit owner approval.
- Live Retell, Make, Twilio, SMS, email/calendar sending and billing remain separate later phases.

## Allowed files

- `src/app/actions/auth.ts`
- `src/app/sign-in/page.tsx`
- `src/app/sign-up/page.tsx`
- `src/app/workspaces/page.tsx`
- `src/lib/server/action-state.ts`
- `src/lib/validation.ts`
- `supabase/migrations/202610020007_workspace_provisioning.sql`
- `supabase/tests/workspace_provisioning.sql`
- `scripts/test-workspace-provisioning-embedded.mjs`
- `tests/security.test.ts`
- `package.json`
- `docs/project/PROJECT_STATUS.md`
- `docs/project/FIRST_CLIENT_EVIDENCE_TRACKER.md`
- `docs/project/tasks/CEV-SELF-SERVE-73A.md`
- `docs/project/handoffs/CEV-SELF-SERVE-73A-morgan.md`

## Acceptance criteria

- Signup page exists and uses Supabase Auth without logging or exposing provider details.
- New workspace creation is available only after a verified signed-in user has no existing memberships.
- Workspace provisioning is atomic and creates tenant, owner membership, audit record and replay receipt through a reviewed security-definer RPC.
- Browser-submitted tenant IDs, user IDs and roles are ignored.
- Duplicate submit replays safely; reused request IDs with changed details are rejected.
- Anonymous, unconfirmed, deleted and existing-member users cannot create a workspace.
- Public RPC is executable by authenticated users only; private helpers and receipt table are not exposed.
- Existing owner workspace access remains working.

## Evidence

- `pnpm test:provisioning:db` PASS on 2026-10-05.
- Focused app test run PASS on 2026-10-05: 16 files, 726 tests.
- `pnpm check` PASS on 2026-10-05: typecheck, lint, 726 Vitest tests, embedded DB suites, provisioning DB suite and production build.
- Hosted Supabase development migration `workspace_provisioning` applied successfully to project `rafiksklbrfgefkypvkn`.
- Hosted catalog verification returned: `public_rpc_count=1`, `receipt_rls_enabled=true`, `private_helper_exposed=false`, `receipt_auth_has_table_privilege=false`.
- Browser smoke: `/sign-up` loads with owner account form; current signed-in owner at `/workspaces` still sees existing Cevanta Demo HVAC workspace and not the first-workspace form.

## Known limitations

- New-account email delivery and confirmation were not tested with a fresh inbox during this task.
- Successful first-workspace creation was proven in embedded SQL and app tests, but not yet with a fresh hosted Supabase Auth user in the browser.
- Billing, provider connection, live AI receptionist activation, team invitations and production deployment remain separate phases.
- Hosted direct JWT/PostgREST negative tests remain open.

## Exact next action

Create and confirm a fresh test owner account, sign in, create a first workspace from `/workspaces`, complete Setup, then run a browser proof pass before any sales or production claim.
