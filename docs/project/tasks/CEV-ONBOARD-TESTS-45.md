# Permanent onboarding storage and validation checks

- Task ID: CEV-ONBOARD-TESTS-45.
- Owner: Quinn implemented the initial test files before a usage-limit interruption; Morgan owns recovery verification and acceptance. Phoenix reviews only if CI/package-script behavior changes materially.
- State: accepted with limitations.
- Scope: Make onboarding storage and validation checks permanent and runnable through project scripts. Add a durable onboarding embedded SQL runner and focused TypeScript validation tests for the accepted storage/shared-contract foundation. Update the main check path so onboarding storage is not only transient handoff evidence. Do not broaden product behavior.
- Dependencies: CEV-ONBOARD-SCHEMA-44 and its handoffs; package scripts and current test patterns.
- Allowed files: scripts/test-onboarding-embedded.mjs; tests/onboarding-validation.test.ts; package.json; docs/project/handoffs/CEV-ONBOARD-TESTS-45-quinn.md. Morgan may update this task, docs/project/PROJECT_STATUS.md and docs/project/BACKLOG.md. No other writes.
- Prohibited/shared files: No migrations, source app code, server actions, UI components, provider settings, hosted database changes, live provider calls, production deployment, real customer data, credentials or external writers.
- Acceptance criteria: `pnpm check` now runs the onboarding SQL suite and validation tests. Tests cover role/direct-access denial through the SQL suite runner plus TypeScript validation for tenant authority, incomplete contacts, strict booleans/numbers, dates/hours, token shape and readiness constants. Existing checks were not weakened.
- Required evidence: Quinn handoff was not produced because the specialist hit a usage limit after writing the files. Morgan recovery evidence is recorded in docs/project/handoffs/CEV-ONBOARD-TESTS-45-morgan.md.
- Reviewers: Morgan accepted. Phoenix review was not required because CI behavior was not materially changed beyond the package check path.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Resume CEV-ONBOARD-RPC-46 from the archived partial draft and complete protected onboarding database commands/read projections before backend server actions.
