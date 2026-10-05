# Development sign-in network diagnosis

- Task ID: CEV-AUTH-14
- Owner: Morgan — Product Manager and Orchestrator
- State: implemented; owner authenticated retry pending
- Scope: Diagnose failed development sign-in and restore app-server connectivity without changing authorization or credentials.
- Dependencies: Configured development Supabase and existing sign-in action.
- Allowed files: docs/project/tasks/CEV-AUTH-14.md, docs/project/handoffs/CEV-AUTH-14.md, docs/project/PROJECT_STATUS.md.
- Operational scope: Stop the coordinator-started preview process and restart it with approved network access.
- Acceptance criteria: Identify network failure; verify Auth service connectivity; restart preview; preserve security and credential handling; distinguish retry pending from verified sign-in.
- Required evidence: Safe network error category, Auth settings response status, server readiness and browser state.
- Reviewers: Morgan operational verification; no application code, permissions or schema changes.
- Branch/worktree or ownership fallback: Disjoint documentation ownership; no commit.
- Exact next action: Owner retries sign-in privately in connected browser.
