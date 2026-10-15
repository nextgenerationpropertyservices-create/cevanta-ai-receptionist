# Client invitation issuance and acceptance — CEV-CLIENT-INVITE-124A

- Task ID: CEV-CLIENT-INVITE-124A
- Owner: Morgan (coordinator)
- Scope: Add a secure owner/admin-only invitation issuance command for an existing confirmed Cevanta account, a one-time invite URL page, and internal client dashboard controls to issue and copy a client-owner link. Reuse the existing invitation acceptance command and keep provider email delivery out of scope.
- Dependencies: Existing onboarding invitation table and `onboarding_accept_invitation` command; managed client workspace relation; authenticated Supabase sessions.
- Allowed files: `supabase/migrations/202610150001_client_invitation_issuance.sql`, `supabase/tests/onboarding_commands.sql`, `src/lib/onboarding-contracts.ts`, `src/lib/onboarding-validation.ts`, `src/lib/server/onboarding-rpc.ts`, `src/app/actions/invitations.ts`, `src/app/invite/page.tsx`, `src/app/workspaces/[tenantId]/clients/page.tsx`, `src/components/invitation-link.tsx`, `tests/client-invitations.test.ts`, this task file, and matching handoff.
- Acceptance criteria:
  1. Only an authenticated internal owner/admin can issue an invitation for a managed client workspace.
  2. Issuance requires an existing confirmed account email, client tenant membership is not created until acceptance, tokens are one-time, expiring, hashed at rest, and never logged.
  3. The internal Clients page can issue and display a one-time private link once, with clear copy/send guidance and safe errors.
  4. The invite page explains sign-in/confirmation, accepts the token only after authenticated matching identity, and routes the accepted user to client Setup.
  5. Reuse, conflicting membership, unknown email, expired token, and unauthorized issuer are denied without revealing private details.
  6. Focused tests, typecheck, lint, application tests, database tests, and production build are run and recorded.
- Evidence required: command/API tests, UI tests, SQL isolation/command tests, typecheck/lint/test/build results, and handoff with limitations. No production deployment in this task.
- Review: self-review recorded; architect and quality review are required by project policy before acceptance because this changes a security-sensitive cross-module contract.

## Coordinator status

- State: implemented, pending architect/quality review and owner release approval.
- Evidence: the embedded onboarding command suite covers created, duplicate-pending, unknown-account, early-membership, and non-member issuer cases; application checks passed. The local production build is blocked by OneDrive filesystem permissions in both Turbopack and Webpack paths.
