# CEV-DASHBOARD-132A

- **Owner:** Morgan (Product Manager / Orchestrator)
- **Scope:** Improve call chronology and dark-theme readability across the overview queue, lead list/detail, and calendar.
- **Dependencies:** Existing `created_at` lead contract and current dark command-board theme.
- **Allowed files:** `src/app/workspaces/[tenantId]/page.tsx`, `src/app/workspaces/[tenantId]/leads/page.tsx`, `src/app/workspaces/[tenantId]/leads/[leadId]/page.tsx`, `src/app/globals.css`, this task record, and its handoff.
- **Acceptance criteria:**
  1. Overview Today’s queue shows each AI caller name and received date/time.
  2. Lead list and lead detail show the call received date/time in UTC.
  3. Calendar board, events, and appointment cards retain readable dark surfaces with no white card backgrounds.
  4. Typecheck, lint, focused UI tests, and build result are recorded.
- **Evidence required:** Command output for typecheck, lint, focused tests, and production build; manual review of affected markup and CSS.
- **Status:** implemented; production deployment remains pending owner approval.
