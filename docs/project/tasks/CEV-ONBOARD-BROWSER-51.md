# Rendered onboarding browser and HTTP verification

- Task ID: CEV-ONBOARD-BROWSER-51.
- Owner: Quinn owns independent browser/security verification. Morgan coordinates and accepts. Nova fixes UI defects only if Morgan transfers exact ownership.
- State: accepted with limitations.
- Scope: Add and run privacy-safe Playwright/browser verification for the rendered Setup page. Cover anonymous protection, owner/admin visibility and save/reload when disposable authenticated environment variables are available, limited-role no-control behavior when credentials are available, mobile overflow, safe copy/no private fields, and the clearest achievable Server Action oversize/error evidence. Do not add a temporary unsafe endpoint.
- Dependencies: CEV-ONBOARD-UI-50 accepted with limitations; existing Playwright privacy rules.
- Allowed files: tests/e2e/onboarding.spec.ts; docs/project/handoffs/CEV-ONBOARD-BROWSER-51-quinn.md. If verification requires a helper file or UI/source fix, ask Morgan for ownership transfer before editing.
- Prohibited/shared files: No UI/source changes, backend action changes, migrations, SQL tests, provider settings, hosted database changes, live provider calls, invitation issuance/delivery, new account provisioning, public signup, token-continuation store, production deployment, real customer data, credentials, screenshots/videos/traces, or external writers beyond the already accepted fictional authenticated test workflow.
- Acceptance criteria: Unauthenticated `/workspaces/:tenantId/onboarding` redirects to sign-in or setup according to configuration. Authenticated owner/admin can load Setup, sees pending readiness and no provider/live claims, can save fictional business-profile data and reload to see the saved value when credentials are provided. Limited roles do not see setup mutation controls when credentials are provided. 390px viewport has no horizontal overflow. Tests and handoff distinguish automated evidence from skipped credentials. Actual oversized rendered Server Action POST behavior is either safely tested without secrets or recorded as blocked with exact reason and next harness requirement.
- Required evidence: Quinn handoff using docs/templates/AGENT_HANDOFF.md with files changed, commands/results, skipped checks, limitations, risks, rollback notes and exact next action.
- Reviewers: Morgan acceptance. Nova receives exact defect follow-up only if Quinn finds a blocking UI issue.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Continue implementation with the next setup editor slice while keeping credentialed browser/live HTTP gates open and visible.

