# Guided onboarding booking preferences and escalation contacts UI

- Task ID: CEV-ONBOARD-SETUP-53.
- Owner: Nova owns frontend/UX implementation. Morgan coordinates and accepts. Quinn reviews security/browser/source behavior before acceptance.
- State: accepted with limitations.
- Scope: Extend the accepted Setup page with owner/admin editors for booking preferences and escalation contacts using the accepted backend action path. Keep the slice limited to saved setup data: request-only booking preferences and escalation contact list. Do not add automated reminders, provider checks, customer-facing booking, live readiness, invitation issuance, or completion policy.
- Dependencies: CEV-ONBOARD-SETUP-52 accepted with limitations; accepted backend/RPC validators for `save_booking_preferences` and `replace_escalation_contacts`.
- Allowed files: src/app/workspaces/[tenantId]/onboarding/page.tsx; src/app/workspaces/[tenantId]/onboarding/onboarding-form.tsx; src/app/globals.css; tests/onboarding-ui.test.ts; docs/project/handoffs/CEV-ONBOARD-SETUP-53-nova.md. If implementation requires backend actions/contracts/shared validators, stop and ask Morgan for ownership transfer.
- Prohibited/shared files: No migrations, SQL tests, backend action logic, workspace shell changes, provider settings, hosted database changes, live provider calls, invitation issuance/delivery, new account provisioning, public signup, token-continuation store, production deployment, real customer data, credentials or external writers.
- Acceptance criteria: Owners/admins can edit request-only booking preferences and escalation contacts through accepted onboarding configuration actions. UI clearly states booking remains request-only and provider/live booking readiness is pending. Contacts are only visible/editable in owner/admin projection. Drafts are retained after recoverable failures, uncertain saves retry the exact request, duplicate submission is blocked, invalid fields are caught before transport where shared validators can catch them, and no receipt/token/provider/internal data appears. Existing profile/services/hours behavior and limited-role read-only views remain intact.
- Required evidence: Nova handoff using docs/templates/AGENT_HANDOFF.md with files changed, commands/results, skipped checks, limitations, risks, rollback notes and exact next action.
- Reviewers: Quinn security/browser/source review required. Morgan acceptance required. Authenticated browser/live HTTP gates remain separate.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Record that all narrowed setup storage editors are present; assign status/readiness shell or credentialed browser/live gates when prerequisites are available.

