# CEV-M1-02

- Owner: architect_data
- State: implemented and reviewed; milestone acceptance gates remain open (see PROJECT_STATUS.md)
- Scope: Database, RLS, seed, validation and shared contracts
- Dependencies: 01
- Allowed files: supabase/**; src/lib/contracts.ts; src/lib/validation.ts; docs/agents/ARCHITECTURE.md; docs/project/handoffs/CEV-M1-02.md
- Acceptance criteria: Composite tenant constraints, RLS, five roles, atomic audit and fictional seed
- Required evidence: SQL tests and architecture review; runtime limitation stated if unexecuted
- Reviewers: Architect for schema/contracts; Quality for cross-module/security; coordinator for acceptance.
- Isolation: disjoint path ownership for unborn repository; use worktrees once a base commit exists.
- Exact next action: implement scope and submit full handoff for review.
