# CEV-ATTENTION-155A
- Owner: Morgan (coordinator)
- Scope: Complete the in-app Needs Attention queue with callback/missing-info categories and a verified data-health panel.
- Dependencies: Existing tenant-scoped lead, job, appointment, technician queries and current notification route.
- Allowed files: `src/app/workspaces/[tenantId]/notifications/page.tsx`, `tests/notifications-ui.test.ts`, `docs/project/handoffs/CEV-ATTENTION-155A-morgan.md`, `docs/project/PROJECT_STATUS.md`.
- Acceptance criteria:
  1. The queue includes urgent work, new leads, callbacks due, missing lead contact information, unassigned jobs, and urgent assigned jobs when records are available.
  2. Each queue item links directly to the relevant lead or job.
  3. The page exposes shortcut counts for callbacks and missing information.
  4. A system-health panel distinguishes ready data sources from unavailable sources without claiming provider delivery.
  5. Existing safety copy remains intact and no external writes are added.
- Required evidence: focused notification tests, typecheck, lint, and production build result with known local limitations recorded.
- State: assigned.
