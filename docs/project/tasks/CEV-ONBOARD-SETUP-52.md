# Guided onboarding services and weekly hours UI

- Task ID: CEV-ONBOARD-SETUP-52.
- Owner: Nova owns frontend/UX implementation. Morgan coordinates and accepts. Quinn reviews security/browser behavior before acceptance.
- State: accepted with limitations.
- Scope: Extend the accepted Setup page with owner/admin editors for services and weekly hours using the accepted backend action path. Keep the first slice narrow: services list with enabled/name/description/position and weekly hours with seven explicit days, closed/open state and one or more intervals where supported by the current contract. Preserve current business profile behavior and all role-safe read-only projections. Booking rules, escalation contacts, exceptions, resume persistence, invitations, provider readiness and completion policy remain out of scope.
- Dependencies: CEV-ONBOARD-UI-50 accepted with limitations; CEV-ONBOARD-BROWSER-51 accepted with limitations; accepted backend/RPC validators for `replace_services` and `replace_weekly_hours`.
- Allowed files: src/app/workspaces/[tenantId]/onboarding/page.tsx; src/app/workspaces/[tenantId]/onboarding/onboarding-form.tsx; src/app/globals.css; tests/onboarding-ui.test.ts; docs/project/handoffs/CEV-ONBOARD-SETUP-52-nova.md. If implementation requires backend actions/contracts or shared validators, stop and ask Morgan for ownership transfer.
- Prohibited/shared files: No migrations, SQL tests, backend action logic, workspace shell changes, provider settings, hosted database changes, live provider calls, invitation issuance/delivery, new account provisioning, public signup, token-continuation store, production deployment, real customer data, credentials or external writers.
- Acceptance criteria: Owners/admins can edit services and weekly hours through accepted onboarding configuration actions with safe validation, retained input after recoverable failures, exact request retry behavior for uncertain results, and clear copy that saving setup information does not enable live booking/readiness. Dispatcher/technician/viewer still cannot mutate setup and do not see sensitive owner-only details. UI remains labelled, keyboard-accessible, responsive and free of receipt/token/provider/internal fields.
- Required evidence: Nova handoff using docs/templates/AGENT_HANDOFF.md with files changed, commands/results, skipped checks, limitations, risks, rollback notes and exact next action.
- Reviewers: Quinn security/browser/source review required. Morgan acceptance required. Authenticated browser/live HTTP gates remain separate.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Assign booking preferences and escalation contacts editor slice; keep authenticated browser/runtime gates visible.

