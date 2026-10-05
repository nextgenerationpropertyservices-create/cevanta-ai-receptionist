# Onboarding settings backend alignment

- Task ID: CEV-ONBOARD-SETTINGS-65A.
- Owner: Blake owns backend/application implementation. Morgan coordinates. Quinn reviews before Morgan acceptance. Atlas review is required only if Blake proposes shared contract, schema or migration changes beyond the accepted LOCK60 contract.
- State: accepted with limitations.
- Scope: Create a backend-only settings alignment path for tenant name, trade and timezone that follows the accepted onboarding lock/concurrency contract. Prefer a dedicated action module over editing the legacy workspace settings action. Reuse accepted onboarding validation and ordinary authenticated session clients. Do not wire UI yet.
- Dependencies: CEV-ONBOARD-BACKEND-48, CEV-ONBOARD-SETUP-53, CEV-ONBOARD-STATUS-54, CEV-ONBOARD-LOCK-60 and CEV-ONBOARD-BACKEND-GAP-57 accepted with limitations.
- Allowed files: src/app/actions/onboarding-settings.ts; tests/onboarding-settings.test.ts; docs/project/handoffs/CEV-ONBOARD-SETTINGS-65A-blake.md. If implementation requires changing src/app/actions/workspace.ts, onboarding.ts, onboarding-rpc.ts, validation/contracts, migrations, package scripts or UI files, stop and ask Morgan for ownership transfer.
- Prohibited/shared files: No UI changes, no migrations, no SQL tests, no package script changes, no provider settings, no hosted database changes, no credentials, no real customer data, no external writers and no production deployment. Do not weaken existing workspace settings authorization.
- Acceptance criteria: The backend path verifies authenticated user, tenant membership and owner/admin role through ordinary session behavior; uses pinned validation for tenant name/trade/timezone; uses current configuration revision as the precondition; preserves business contact values because UI is not editing them; returns safe saved/replayed/conflict/validation/unavailable semantics compatible with LOCK60; treats no-op, stale revision, request reuse and denied roles honestly; does not use service-role ordinary requests.
- Required evidence: Blake handoff using docs/templates/AGENT_HANDOFF.md with changed files, tests run/results, skipped checks, limitations, risks, rollback notes and exact next action. Focused tests must cover positive owner/admin behavior, denied roles, invalid timezone/trade/name, stale/request-reuse/no-op/replay semantics or explicitly explain any backend limitation that prevents coverage.
- Reviewers: Quinn security/cross-module review required after Blake handoff. Morgan acceptance required after review.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Wire the accepted backend path into Settings UI in a separate Nova task, then Quinn review.
