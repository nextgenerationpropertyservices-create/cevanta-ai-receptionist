# CEV-DISPATCH-97A — Quick technician assignment from dispatch board

- **Owner:** Morgan (`product_manager`), implementation by coordinator.
- **Status:** Implemented locally, verified locally, production release pending explicit owner approval.
- **Scope:** Make unassigned active jobs more obvious and allow owner/admin/dispatcher users to assign or change technicians directly from each job card while preserving technician read-only behavior.
- **Dependencies:** Existing jobs table, existing `updateJob` server action, existing technician roster RPC, and existing role/membership enforcement.
- **Allowed files:**
  - `src/app/workspaces/[tenantId]/jobs/page.tsx`
  - `src/app/workspaces/[tenantId]/jobs/[jobId]/page.tsx`
  - `src/app/workspaces/[tenantId]/jobs/dispatch-board.tsx`
  - `src/app/globals.css`
  - `tests/jobs-ui.test.ts`
  - this task/status/handoff record.
- **Acceptance criteria:**
  1. Active unassigned jobs are visually flagged from the dispatch board.
  2. Office roles can assign or change a technician from the job card using the existing secured job update path.
  3. Technician view remains read-only and does not show assignment controls.
  4. No database migration or provider write is introduced.
  5. Typecheck, lint, focused tests, and production build pass locally.
- **Evidence:** `pnpm typecheck` PASS; `pnpm lint` PASS; focused `pnpm test -- tests/jobs-ui.test.ts tests/jobs.test.ts tests/calendar-ui.test.ts` PASS with the full configured suite, 28 files / 795 tests; `pnpm build` PASS.
