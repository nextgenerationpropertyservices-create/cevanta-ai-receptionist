# CEV-M1-05

- Owner: quality_security
- State: implemented and reviewed; milestone acceptance gates remain open (see PROJECT_STATUS.md)
- Scope: Independent security review and meaningful tests
- Dependencies: 02/03/04
- Allowed files: tests/**; vitest.config.ts; playwright.config.ts; docs/project/QUALITY_REVIEW.md; docs/project/handoffs/CEV-M1-05.md
- Acceptance criteria: Test roles, hostile tenant/parent IDs, failure, validation, auth and workflows
- Required evidence: Exact commands/results and reproduction findings; blocked checks explicit
- Reviewers: Architect for schema/contracts; Quality for cross-module/security; coordinator for acceptance.
- Isolation: disjoint path ownership for unborn repository; use worktrees once a base commit exists.
- Exact next action: implement scope and submit full handoff for review.
