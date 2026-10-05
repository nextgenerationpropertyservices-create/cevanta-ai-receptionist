# Development calendar installation

- Task ID: CEV-DB-13
- Owner: Morgan — Product Manager and Orchestrator
- State: accepted for hosted calendar schema installation; signed-in workflow acceptance remains open
- Scope: Apply reviewed appointments migration004 if absent; verify hosted schema and inspect available development Jobs/Calendar screens.
- Dependencies: CEV-DB-12 Jobs installation; CEV-M3-02 Atlas and Quinn approvals; owner instruction to move on with development work.
- Allowed files: docs/project/tasks/CEV-DB-13.md, docs/project/handoffs/CEV-DB-13.md, docs/project/handoffs/CEV-DB-13-verification.png, docs/project/PROJECT_STATUS.md.
- External scope: Cevanta Development database only; existing reviewed migration004 and read-only schema verification; development app inspection.
- Acceptance criteria: Confirm Jobs exists and Appointments absent before execution; SQL succeeds; RLS, policies, triggers and anonymous denial verified; browser limitations recorded honestly.
- Required evidence: SQL results and safe screenshot; observed application state where available.
- Reviewers: Existing migration architecture/security approvals; Morgan execution verification.
- Prohibited/shared files: Application edits, migration edits, secrets, customer data, production resources.
- Branch/worktree or ownership fallback: Disjoint documentation ownership; no commit.
- Exact next action: Owner signs into the connected local app; verify fictional Jobs and Calendar persistence using that session.
