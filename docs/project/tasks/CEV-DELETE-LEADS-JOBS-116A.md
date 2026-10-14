# CEV-DELETE-LEADS-JOBS-116A — Client lead and job deletion controls

Owner: Morgan — Product Manager and Orchestrator

Scope: Let authorized client workspace office users delete lead and job records from their detail pages.

Dependencies: Existing lead/job detail pages, server actions, tenant membership checks and RLS-backed tables.

Allowed files:
- src/app/actions/intake.ts
- src/app/actions/jobs.ts
- src/app/workspaces/[tenantId]/leads/[leadId]/page.tsx
- src/app/workspaces/[tenantId]/jobs/[jobId]/page.tsx
- tests/intake.test.ts
- tests/jobs.test.ts
- tests/lead-detail-ui.test.tsx
- tests/jobs-ui.test.ts
- docs/project/tasks/CEV-DELETE-LEADS-JOBS-116A.md
- docs/project/handoffs/CEV-DELETE-LEADS-JOBS-116A-morgan.md

Acceptance criteria:
- Owners, admins and dispatchers can delete a lead from the lead detail page.
- Owners, admins and dispatchers can delete a job from the job detail page.
- Technicians and viewers cannot delete leads or jobs.
- Deletes are tenant-scoped by verified membership and record ID.
- Delete failures return safe messages and do not leak provider/database details.
- Deleting a lead/job does not enable SMS, email, booking, calendar writes, payments, subscriptions, dispatch automation or provider actions.

Evidence required:
- Focused action and UI tests.
- Typecheck, lint, production build or explicit blocker.
