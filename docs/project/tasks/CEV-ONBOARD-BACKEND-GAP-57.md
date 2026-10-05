# Onboarding backend next-slice plan

- Task ID: CEV-ONBOARD-BACKEND-GAP-57.
- Owner: Blake owns backend/application planning. Morgan coordinates and accepts.
- State: accepted with limitations.
- Scope: Review accepted onboarding backend actions and UI usage to identify the next backend work required before full first-client onboarding: settings route alignment, resume persistence UI support, safe server-side adapters for future editors, result decoding gaps, direct API/JWT tests and duplicate/retry behavior. No implementation.
- Dependencies: CEV-ONBOARD-BACKEND-48, UI50, SETUP52/53 and STATUS54 pending review.
- Allowed files: docs/project/ONBOARDING_BACKEND_NEXT.md; docs/project/handoffs/CEV-ONBOARD-BACKEND-GAP-57-blake.md. No other writes.
- Prohibited/shared files: No source code, migrations, SQL tests, package scripts, provider settings, hosted changes, credentials, production deployment or external writers.
- Acceptance criteria: Produce a backend-focused next-slice plan with safe boundaries, proposed tasks, allowed-file suggestions, acceptance criteria and required security evidence. Preserve no-service-role ordinary request rule and live/Auth gate distinctions.
- Required evidence: Blake handoff using docs/templates/AGENT_HANDOFF.md.
- Reviewers: Morgan accepts.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Morgan uses this plan to scope settings, resume, exception, retry and live-test tasks after ENV59/LOCK60 are underway.
