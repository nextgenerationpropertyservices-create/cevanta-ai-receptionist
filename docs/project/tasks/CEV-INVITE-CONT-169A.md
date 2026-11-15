# CEV-INVITE-CONT-169A — Invitation continuation database contract

- **Owner:** Atlas (`architect_data`)
- **Status:** Accepted with limitations after CEV-INVITE-CONT-169D review
- **Scope:** Implement the reviewed private invitation-continuation table and narrow anonymous exchange/authenticated acceptance commands from `INVITATION_CONTINUATION_CONTRACT.md`. Revoke authenticated execution of the old raw-token acceptance command. No hosted application.
- **Dependencies:** Accepted architecture task CEV-PROJECT-AUDIT-167P and existing invitation issuance/acceptance migrations.
- **Allowed files:**
  - `supabase/migrations/202610260005_invitation_continuations.sql`
  - `supabase/tests/invitation_continuations.sql`
  - `scripts/test-invitation-continuations-embedded.mjs`
  - `scripts/test-db-embedded.mjs`
  - `package.json`
  - `docs/project/handoffs/CEV-INVITE-CONT-169A-atlas.md`
- **Acceptance criteria:** Exact bounded inputs; digest-only storage; 15-minute maximum expiry; exact invitation/recipient/request binding; one active continuation; wrong-account/expired/revoked/substituted/replay/concurrency failure; atomic membership/invitation/audit/receipt/consumption; table denial; fixed search paths/owners/grants; no service-role command execution; old raw-token RPC authenticated grant revoked; fail-closed safe results.
- **Required reviewer:** Quinn before hosted migration or release.
- **Required evidence:** Focused SQL runner, maintained DB suites, grant/RLS/owner/search-path checks, role and tenant negative tests, rollback notes, migration ordering, and no-deploy statement.

