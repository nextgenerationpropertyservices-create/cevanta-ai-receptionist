# First guided onboarding UI consumer

- Task ID: CEV-ONBOARD-UI-50.
- Owner: Nova owns frontend/UX implementation. Blake reviews only if backend action signatures must change. Quinn reviews security/browser behavior before Morgan acceptance.
- State: accepted with limitations.
- Scope: Add the first role-aware guided onboarding UI consumer inside an authenticated workspace. It should render the accepted onboarding snapshot, add a Setup navigation link, show owner/admin progress and business-profile form wired to accepted backend actions, show safe read-only/operational states for dispatcher/technician/viewer, and keep all readiness/provider claims pending. Include loading/error/empty/validation states and preserve user input after recoverable failures. Keep this as a narrow first slice.
- Dependencies: CEV-ONBOARD-SCHEMA-44, CEV-ONBOARD-RPC-46, CEV-ONBOARD-BACKEND-48 and CEV-ONBOARD-TRANSPORT-49 accepted with limitations.
- Allowed files: src/app/workspaces/[tenantId]/onboarding/page.tsx; src/app/workspaces/[tenantId]/onboarding/onboarding-form.tsx; src/components/workspace-shell.tsx; src/app/globals.css; tests/onboarding-ui.test.ts; docs/project/handoffs/CEV-ONBOARD-UI-50-nova.md. If implementation requires changing backend actions/contracts, stop and ask Morgan for ownership transfer.
- Prohibited/shared files: No migrations, SQL tests, backend action logic, provider settings, hosted database changes, live provider calls, invitation issuance/delivery, new account provisioning, public signup, token-continuation store, production deployment, real customer data, credentials or external writers.
- Acceptance criteria: Owners/admins can reach `/workspaces/[tenantId]/onboarding`, see current setup data/readiness as pending, and submit business profile changes through accepted backend actions. Dispatcher sees operations-safe setup context without sensitive contact/escalation/receipt data. Technician/viewer see workspace access without owner setup controls. UI uses semantic labels, keyboard-accessible controls, visible focus styles, mobile-friendly layout, safe messages and no internal implementation details.
- Required evidence: Nova handoff using docs/templates/AGENT_HANDOFF.md with files changed, commands/results, skipped checks, limitations, risks, rollback notes and exact next action.
- Reviewers: Quinn security/browser review required. Morgan acceptance required. Real Server Action HTTP oversize verification remains a follow-up after rendered UI exists.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Assign fictional-session browser/HTTP verification for the rendered Setup page and Server Action transport behavior.

