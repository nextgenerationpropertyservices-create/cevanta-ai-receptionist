# Signed-in Jobs and Calendar smoke verification

- Task ID: CEV-LIVE-15
- Owner: Morgan — Product Manager and Orchestrator
- State: accepted for authenticated owner Jobs/Calendar smoke scope; multiuser acceptance remains open
- Scope: Verify authenticated owner session and fictional Job create/edit/reopen plus Appointment create/reschedule/reopen in development.
- Dependencies: CEV-DB-12, CEV-DB-13, CEV-AUTH-14 and owner-provided signed-in browser session.
- Allowed files: docs/project/tasks/CEV-LIVE-15.md, docs/project/handoffs/CEV-LIVE-15.md, docs/project/handoffs/CEV-LIVE-15-job.png, docs/project/handoffs/CEV-LIVE-15-calendar.png, docs/project/PROJECT_STATUS.md.
- External scope: Fictional QA records only in Cevanta Demo HVAC development workspace; no real customer mutations or reads beyond necessary navigation.
- Acceptance criteria: Owner session visible; Jobs board loads; fictional job persists through reload and edit; linked fictional appointment persists through reload and reschedule; safe evidence and explicit remaining multiuser gates.
- Required evidence: Observed success, reloaded records, safe screenshots without customer information.
- Reviewers: Existing architecture/security approvals; Morgan live workflow evidence.
- Prohibited/shared files: Application edits, credentials, customer data, membership changes, production resources.
- Branch/worktree or ownership fallback: Disjoint documentation ownership; no commit.
- Exact next action: Plan live tenant/role/technician-assignment verification without altering existing user memberships.
