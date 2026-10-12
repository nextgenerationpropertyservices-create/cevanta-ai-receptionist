# CEV-FULLAPP-102A — Front office workflow polish

- Owner: Morgan — Product Manager and Orchestrator
- Scope: Continue the full-app dashboard build by tightening manual technician/job assignment, upgrading the calendar presentation, adding an in-app notification center, and making SMS/email/calendar writes visible as controlled approval-gated options, keeping automatic booking/payment/dispatch disabled, and keeping onboarding/billing/automation as visible next steps.
- Dependencies: Existing jobs, appointments, lead inbox, technician profiles, workspace topbar, onboarding setup, integrations page, and internal dashboard.
- Allowed files:
  - `src/app/workspaces/[tenantId]/jobs/dispatch-board.tsx`
  - `src/app/workspaces/[tenantId]/jobs/page.tsx`
  - `src/app/workspaces/[tenantId]/calendar/page.tsx`
  - `src/app/workspaces/[tenantId]/notifications/page.tsx`
  - `src/components/workspace-shell.tsx`
  - `src/app/globals.css`
  - `tests/jobs-ui.test.ts`
  - `tests/calendar-ui.test.ts`
  - `tests/workspace-shell-ui.test.ts`
  - `tests/notifications-ui.test.ts`
  - `docs/project/tasks/CEV-FULLAPP-102A.md`
  - `docs/project/handoffs/CEV-FULLAPP-102A-morgan.md`
  - `docs/project/PROJECT_STATUS.md`
- Acceptance criteria:
  1. Jobs/dispatch makes technician assignment steps and office confirmation boundaries clearer.
  2. Calendar keeps year/month/week/day/hour views and makes urgent or unassigned work impossible to miss.
  3. Calendar entries visually distinguish status and assignment state and link back to jobs.
  4. A new in-app notification center lists new AI leads, urgent AI leads, unassigned jobs, and today’s scheduled visits without sending external notifications.
  5. Workspace top navigation links to the notification center with attention count badges.
  6. SMS/email and external calendar writes are presented only as controlled owner-approved options; automatic booking, payment collection, and dispatch automation remain off and approval-gated.
  7. Meaningful focused UI tests, typecheck, lint, and production build pass.
- Required reviewers: Quality review recommended before full security acceptance because this adds a cross-module attention surface. No schema/shared contract change is planned.
- Evidence: Pending implementation verification.
- Result: Assigned and in progress.

