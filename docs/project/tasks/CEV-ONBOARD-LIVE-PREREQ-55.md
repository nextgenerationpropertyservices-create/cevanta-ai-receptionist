# Onboarding live/browser verification prerequisites

- Task ID: CEV-ONBOARD-LIVE-PREREQ-55.
- Owner: Phoenix owns operational prerequisite documentation. Morgan coordinates and accepts.
- State: accepted with limitations.
- Scope: Define the exact disposable environment prerequisites and safe runbook needed to turn skipped onboarding browser tests into executed evidence: owner/admin/dispatcher/technician/viewer fictional accounts, tenant IDs, foreign tenant, Chrome/Playwright executable setup, dev/prod preview startup, no screenshots/traces/video, and safe evidence handling. Do not run live tests or request credentials.
- Dependencies: CEV-ONBOARD-BROWSER-51, SETUP52/53 and STATUS54 pending review.
- Allowed files: docs/project/ONBOARDING_BROWSER_PREREQS.md; docs/project/handoffs/CEV-ONBOARD-LIVE-PREREQ-55-phoenix.md. Morgan may update backlog/status/context. No other writes.
- Prohibited/shared files: No source code, tests, package scripts, migrations, provider settings, hosted database changes, credential files, real customer data, screenshots, traces, videos, production deployment or external writers.
- Acceptance criteria: Document names exact env vars, required role memberships, test-data safety rules, start/stop commands, skip/pass interpretation, evidence redaction rules, and unresolved blockers. It must distinguish local anonymous evidence, disposable authenticated evidence, hosted/live evidence and production approval.
- Required evidence: Phoenix handoff using docs/templates/AGENT_HANDOFF.md.
- Reviewers: Morgan accepts. Quinn may later use this as input for browser verification.
- Branch/worktree or ownership fallback: Repository remains unborn/dirty; use disjoint file ownership and no commit.
- Exact next action: Use this runbook as input to CEV-ONBOARD-ENV-59 and later Quinn credentialed browser execution.
