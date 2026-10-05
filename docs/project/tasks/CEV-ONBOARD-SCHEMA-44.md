# Guided onboarding schema and shared contracts

- Task ID: CEV-ONBOARD-SCHEMA-44.
- Owner: Atlas owns additive schema, RLS/grants and shared contract files. Morgan coordinates and accepts. Blake and Quinn review before backend/UI implementation.
- State: accepted with limitations on 2026-10-04.
- Scope: Implement the accepted schema/shared-contract foundation for the narrowed CEV-ONBOARD subset: configuration persistence and acceptance of privately provisioned invitations for already verified accounts. Include tenant setup state, business contact profile fields, services, weekly hours, hours exceptions, booking preferences, escalation contacts, setup resume, private invitation/receipt/readiness structures as accepted or explicitly blocked, RLS/grants, indexes, constraints, and SQL isolation tests where feasible. Do not implement invitation issuance/delivery, new-account provisioning, public signup, token-continuation store, provider checks, backend actions, UI, production, or external effects.
- Dependencies: AGENTS.md, MEMORY.md, context/, docs/project/tasks/CEV-ONBOARD-38.md, docs/project/tasks/CEV-ONBOARD-CLARIFY-42.md, docs/project/tasks/CEV-ONBOARD-FINALIZE-43.md and their handoffs, especially Atlas38/42/43 plus Blake/Quinn/Nova final confirmations.
- Allowed files: supabase/migrations/202610020005_onboarding_setup.sql; supabase/tests/onboarding_isolation.sql; src/lib/onboarding-contracts.ts; src/lib/onboarding-validation.ts; docs/project/handoffs/CEV-ONBOARD-SCHEMA-44-atlas.md. Morgan may update this task, docs/project/PROJECT_STATUS.md and docs/project/BACKLOG.md. No other writes.
- Prohibited/shared files: No route handlers, server actions, UI components, existing applied migrations, provider settings, hosted database changes, live provider calls, production deployment, real customer data, credentials, screenshots with private data, external messages/calls/calendar writers or service-role ordinary request design.
- Acceptance criteria: Additive migration and shared contracts reflect the accepted narrowed onboarding contract, preserve existing tenant name/trade/timezone invariants, keep sensitive invitation/receipt/readiness data private, enforce tenant isolation, provide safe grants/RLS, and include meaningful SQL tests for role/tenant boundaries and direct access denial. No existing delivered module authorization may be weakened.
- Required evidence: Atlas handoff using docs/templates/AGENT_HANDOFF.md with files changed, schema/contracts summary, SQL tests or skipped checks, limitations, risks, rollback notes and exact next action. Run focused checks feasible for assigned files; report all skipped checks explicitly.
- Reviewers: Blake for backend fit; Quinn for security/RLS/privacy review. Morgan acceptance required before backend/UI tasks.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Atlas implements the additive migration/shared contract files and writes docs/project/handoffs/CEV-ONBOARD-SCHEMA-44-atlas.md.

## Coordinator acceptance — 2026-10-04

Decision: ACCEPTED WITH LIMITATIONS for storage/shared-contract foundation.

Evidence accepted: Atlas implemented the five assigned files and reported typecheck, lint, 438 unit tests, five database suites, focused validation/parity checks and production build passing. Blake and Quinn independently passed the foundation with limitations. Blake reran the onboarding storage SQL suite. Quinn reran typecheck, lint, 438 tests, five database suites, production build and focused validation assertions.

Acceptance boundary: storage/contracts only. No protected onboarding commands, read projections, invitation delivery, new-account provisioning, token-continuation store, provider checks, hosted migration, UI, production, or complete onboarding journey is accepted.

Next gates: CEV-ONBOARD-TESTS-45 for permanent test registration and CEV-ONBOARD-RPC-46 for guarded database command/read functions.
