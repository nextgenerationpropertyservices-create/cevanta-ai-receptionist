# Guided onboarding status and readiness shell

- Task ID: CEV-ONBOARD-STATUS-54.
- Owner: Nova owns frontend/UX implementation. Morgan coordinates and accepts. Quinn reviews security/source behavior before acceptance.
- State: accepted with limitations.
- Scope: Improve the Setup page status/readiness summary now that all accepted narrowed storage editors exist. Show a clear non-technical status shell for owners/admins: saved setup sections, missing/incomplete storage sections, explicit readiness pending state, provider/live booking/production blocked state, and what owner/admin can do next. Preserve dispatcher/technician/viewer safe read-only states. This is presentation only; do not add readiness completion, provider checks, hosted checks, invitations, public signup or new backend behavior.
- Dependencies: CEV-ONBOARD-SETUP-53 accepted with limitations and current accepted snapshot/readiness contracts.
- Allowed files: src/app/workspaces/[tenantId]/onboarding/page.tsx; src/app/globals.css; tests/onboarding-ui.test.ts; docs/project/handoffs/CEV-ONBOARD-STATUS-54-nova.md. If implementation requires backend/contracts/actions, stop and ask Morgan for ownership transfer.
- Prohibited/shared files: No onboarding-form.tsx changes unless Morgan explicitly transfers ownership; no migrations, SQL tests, backend action logic, workspace shell changes, provider settings, hosted database changes, live provider calls, invitation issuance/delivery, new account provisioning, public signup, token-continuation store, production deployment, real customer data, credentials or external writers.
- Acceptance criteria: Owner/admin summary clearly distinguishes saved setup data from operational readiness, never claims setup complete/live booking/provider connection/production, lists missing setup sections using existing snapshot data only, and points owners/admins to available editors. Limited roles remain read-only and do not see owner-only contacts. UI remains semantic, responsive, and free of receipt/token/provider/internal fields.
- Required evidence: Nova handoff using docs/templates/AGENT_HANDOFF.md with files changed, commands/results, skipped checks, limitations, risks, rollback notes and exact next action.
- Reviewers: Quinn security/source review required. Morgan acceptance required. Authenticated browser/live HTTP gates remain separate.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Morgan accepted this presentation slice. Runtime browser, live Auth/JWT/PostgREST, concurrency and hosted/provider gates remain separate follow-up tasks.
