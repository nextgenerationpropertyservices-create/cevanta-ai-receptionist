# CEV-DASHBOARD-99A — Workspace attention badges

- Owner: Morgan — Product Manager and Orchestrator
- Scope: Make new AI receptionist leads and unassigned jobs visible from the top navigation so office staff can see urgent work from any dashboard page.
- Dependencies: Existing leads and jobs queries; existing AI receptionist lead detection; CEV-DISPATCH-97A unassigned-job workflow.
- Allowed files: `src/app/workspaces/[tenantId]/layout.tsx`; `src/components/workspace-shell.tsx`; `src/app/globals.css`; `tests/workspace-shell-ui.test.ts`; this task file; matching handoff; project status.
- Acceptance criteria:
  - Workspace topbar shows a clear attention pill when new AI leads or unassigned jobs exist.
  - Leads and Jobs nav items show count badges for their own attention items.
  - Technician users are not shown unassigned-job counts they cannot manage.
  - No provider, database, payment, SMS, email, external calendar, quote, booking, or dispatch automation is added.
  - Typecheck, lint, focused UI tests, and production build pass.
- Required evidence: command results, changed files, limitations, and release gate notes in handoff.
