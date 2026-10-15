# CEV-DASHBOARD-120A — Owner insights

- **Owner:** Morgan (Product Manager and Orchestrator)
- **Scope:** Add a read-only owner insights page using existing tenant-scoped leads, jobs, and appointments.
- **Dependencies:** Existing query contracts and editable ROI estimator.
- **Allowed files:** `src/app/workspaces/[tenantId]/reports/page.tsx`, `src/components/workspace-shell.tsx`, `src/app/globals.css`, `tests/reports-ui.test.ts`, this task file, and the matching handoff.
- **Acceptance criteria:**
  1. Owners can see lead conversion, open workload, scheduled visits, and an estimated recovered-value snapshot.
  2. Metrics are clearly labeled as estimates where attribution is not persisted.
  3. The page links to the records behind each metric and has useful empty states.
  4. No external provider action, billing action, or database write is introduced.
- **Required evidence:** focused UI test, typecheck, lint, and full test run.
