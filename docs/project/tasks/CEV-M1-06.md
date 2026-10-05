# CEV-M1-06

- Owner: devops_release
- State: implemented and reviewed; milestone acceptance gates remain open (see PROJECT_STATUS.md)
- Scope: CI, local/preview/staging/prod operations and rollback
- Dependencies: 01/03
- Allowed files: .github/**; scripts/check-environment.mjs; docs/project/OPERATIONS.md; docs/project/handoffs/CEV-M1-06.md
- Acceptance criteria: Reproducible setup/checks/health/release/rollback; no production deploy
- Required evidence: CI review, environment checks, build evidence supplied by coordinator
- Reviewers: Architect for schema/contracts; Quality for cross-module/security; coordinator for acceptance.
- Isolation: disjoint path ownership for unborn repository; use worktrees once a base commit exists.
- Exact next action: implement scope and submit full handoff for review.
