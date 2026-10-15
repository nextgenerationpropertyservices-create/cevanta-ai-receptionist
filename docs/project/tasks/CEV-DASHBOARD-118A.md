# CEV-DASHBOARD-118A — Customer 360 timeline

- **Owner:** Morgan (Product Manager and Orchestrator)
- **Scope:** Add a tenant-scoped Customer 360 timeline to customer detail pages using existing leads, jobs, and appointments.
- **Dependencies:** Existing customer, lead, job, and appointment contracts and RLS-scoped queries.
- **Allowed files:** `src/lib/server/queries.ts`, `src/app/workspaces/[tenantId]/customers/[customerId]/page.tsx`, `tests/customer-timeline-ui.test.ts`, this task file, and the matching handoff.
- **Acceptance criteria:**
  1. Customer detail shows a chronological activity timeline when related leads, jobs, or appointments exist.
  2. Every related record is tenant-scoped through the authenticated server query and links to its existing detail page.
  3. Empty and unavailable states are clear; no provider side effects are introduced.
  4. Existing customer editing, locations, equipment, and contacts remain intact.
- **Required evidence:** focused UI test, typecheck, lint, and full test run.
- **Review:** coordinator acceptance; no migration required.
