# Persisted onboarding resume UI

- Task ID: CEV-ONBOARD-RESUME-66A.
- Owner: Nova owns frontend/UX implementation. Morgan coordinates. Quinn reviews before Morgan acceptance. Blake supports only if the existing saveOnboardingProgress action proves insufficient.
- State: accepted with limitations.
- Scope: Add a narrow owner/admin Setup control that lets a user save or update their own onboarding resume step using the accepted saveOnboardingProgress action and existing snapshot resume_step/resume_version. This is a convenience/progress marker only; it must not mark setup complete, advance configuration readiness, connect providers, issue invitations, create accounts or affect other users.
- Dependencies: CEV-ONBOARD-BACKEND-48, CEV-ONBOARD-UI-50, CEV-ONBOARD-STATUS-54 and CEV-ONBOARD-LOCK-60 accepted with limitations.
- Allowed files: src/app/workspaces/[tenantId]/onboarding/page.tsx; src/app/workspaces/[tenantId]/onboarding/onboarding-form.tsx; tests/onboarding-ui.test.ts; docs/project/handoffs/CEV-ONBOARD-RESUME-66A-nova.md. If implementation requires backend actions, RPC, shared contracts, migrations, package scripts, Settings files, CSS or provider changes, stop and ask Morgan for ownership transfer.
- Prohibited/shared files: No backend action changes, no migrations, no SQL tests, no Settings files, no package script changes, no provider settings, no hosted database changes, no credentials, no real customer data, no external writers and no production deployment.
- Acceptance criteria: Owner/admin can save one allowlisted resume step from the current snapshot resume_version using a frozen request_id for uncertain retry. The UI must preserve typed/selected values on validation/conflict/retryable failures, require fresh review after saved/replayed/conflict/unavailable results, and state that saved progress does not complete setup or readiness. Limited roles must not see owner resume controls. Product markup must not expose request IDs, versions, receipts, tokens or private contact details.
- Required evidence: Nova handoff using docs/templates/AGENT_HANDOFF.md with changed files, commands/results, skipped checks, limitations, risks, rollback notes and exact next action. Focused tests must cover save input shape, retry same request, conflict/retry copy, limited-role privacy, no internal field leakage and no readiness/provider/production claims.
- Reviewers: Quinn security/cross-module review required. Morgan acceptance required after review.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Move to date-specific hours exception UI and later browser/live evidence gates.
