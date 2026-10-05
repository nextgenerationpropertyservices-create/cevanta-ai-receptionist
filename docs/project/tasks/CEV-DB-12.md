# Development Jobs migration verification

- Task ID: CEV-DB-12
- Owner: Morgan — Product Manager and Orchestrator
- State: accepted for hosted Jobs schema installation; authenticated workflow acceptance remains open
- Scope: Verify the intended development project and existing Jobs schema; apply reviewed migration 003 only if absent and verify installation.
- Dependencies: Recorded CEV-M3-01 Architect and Quality approvals; owner approval to complete the development database step; authenticated Supabase administration session.
- Allowed files: docs/project/tasks/CEV-DB-12.md, docs/project/handoffs/CEV-DB-12.md, docs/project/handoffs/CEV-DB-12-verification.png, docs/project/PROJECT_STATUS.md.
- External scope: Cevanta Development project only; read-only schema checks and reviewed supabase/migrations/202610020003_dispatch_jobs.sql if absent.
- Acceptance criteria: Project matches app configuration; no duplicate execution; Jobs schema, RLS and policies checked; exact hosted execution or existing installation evidence recorded.
- Required evidence: SQL Editor results without private customer records; distinguish schema installation from authenticated user-flow acceptance.
- Reviewers: Existing recorded Architect and Quality migration approvals; Morgan verifies execution evidence.
- Prohibited/shared files: Source code, migration edits, credentials, customer records, production resources, other migrations.
- Branch/worktree or ownership fallback: Documentation-only disjoint ownership; no commit.
- Exact next action: Verify signed-in Jobs persistence and multiuser tenant/assignment permissions; appointments migration 004 remains unapplied.
