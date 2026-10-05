# Permanent onboarding command SQL checks

- Task ID: CEV-ONBOARD-COMMAND-TESTS-47.
- Owner: Morgan owns coordination and recovery implementation. Quinn and Blake already required this durable registration in CEV-ONBOARD-RPC-46 reviews; Phoenix review is optional unless CI behavior changes materially.
- State: accepted with limitations.
- Scope: Register the protected onboarding command SQL suite in the permanent local check path without broadening product behavior. Add a disposable embedded runner for `supabase/tests/onboarding_commands.sql` and include it in `pnpm check` after the onboarding storage suite.
- Dependencies: CEV-ONBOARD-TESTS-45 accepted with limitations; CEV-ONBOARD-RPC-46 implemented by Atlas and reviewed PASS WITH LIMITATIONS by Blake and Quinn.
- Allowed files: scripts/test-onboarding-commands-embedded.mjs; package.json; docs/project/tasks/CEV-ONBOARD-COMMAND-TESTS-47.md; docs/project/handoffs/CEV-ONBOARD-COMMAND-TESTS-47-morgan.md. Morgan may update docs/project/PROJECT_STATUS.md, docs/project/BACKLOG.md and context/NEXT_TASK.md.
- Prohibited/shared files: No migrations, SQL command test changes, source app code, server actions, UI components, provider settings, hosted database changes, live provider calls, production deployment, real customer data, credentials or external writers.
- Acceptance criteria: `pnpm check` runs `supabase/tests/onboarding_commands.sql` through a durable package script. The runner uses a disposable local PGlite database, applies active migrations in order, suppresses raw row/payload output on failure, and clearly states that live Auth/JWT/concurrency remain unverified.
- Required evidence: Morgan handoff using docs/templates/AGENT_HANDOFF.md with files changed, commands/results, skipped checks, limitations, risks, rollback notes and exact next action.
- Reviewers: Morgan accepts. Phoenix review is not required unless the CI/package behavior change is broader than adding this fail-fast local gate.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Continue to authenticated backend integration for the accepted narrowed onboarding subset; keep live Auth/concurrency evidence separate.

