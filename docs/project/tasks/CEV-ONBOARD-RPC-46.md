# Guided onboarding guarded database commands and read projections

- Task ID: CEV-ONBOARD-RPC-46.
- Owner: Atlas owns guarded database command/read function migration and shared contract updates. Morgan coordinates and accepts. Blake and Quinn review before backend server actions.
- State: accepted with limitations. Earlier partial SQL remains archived at docs/project/handoffs/CEV-ONBOARD-RPC-46-atlas-partial.sql for recovery history.
- Scope: Add protected database functions/read projections for the accepted narrowed onboarding subset: owner/admin configuration commands, resume save, invitation acceptance for privately provisioned existing verified accounts, owner/admin setup snapshot, dispatcher operational projection, and technician/viewer workspace capability projection if needed. Preserve all CEV-ONBOARD-38/42/43 and CEV-ONBOARD-SCHEMA-44 boundaries. Do not implement invitation issuance/delivery, new-account provisioning, token-continuation store, public signup, UI, server actions, provider checks, hosted migration, production, or external effects.
- Dependencies: CEV-ONBOARD-SCHEMA-44 accepted foundation; CEV-ONBOARD-TESTS-45 may run in parallel but must not be weakened.
- Allowed files: supabase/migrations/202610020006_onboarding_commands.sql; supabase/tests/onboarding_commands.sql; src/lib/onboarding-contracts.ts; src/lib/onboarding-validation.ts; docs/project/handoffs/CEV-ONBOARD-RPC-46-atlas.md. Morgan may update this task, docs/project/PROJECT_STATUS.md and docs/project/BACKLOG.md. No other writes.
- Prohibited/shared files: No route handlers, server actions, UI components, package scripts, existing applied migrations, provider settings, hosted database changes, live provider calls, production deployment, real customer data, credentials, external messages/calls/calendar writers or ordinary service-role request design.
- Acceptance criteria: Functions use explicit current auth/member/role checks, pinned search_path, narrow execute grants, private receipt behavior, safe result enums, revision/no-op handling, and read projections that do not expose sensitive contact/invitation/receipt data outside approved roles. SQL tests cover allowed roles, denied roles, cross-tenant access, direct table/helper denial, revision behavior, receipt/replay basics and safe readiness not_evaluated boundaries.
- Required evidence: Atlas handoff using docs/templates/AGENT_HANDOFF.md with files changed, commands/results, skipped checks, limitations, risks, rollback notes and exact next action.
- Reviewers: Blake backend-fit review and Quinn security/RLS/privacy review required. Morgan acceptance required before backend server actions.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Assign authenticated backend server actions/result decoding for the narrowed onboarding subset, plus separate live Auth/concurrency evidence before any UI/workflow acceptance.


