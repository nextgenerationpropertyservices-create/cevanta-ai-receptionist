# CEV-DASHBOARD-119A — Receptionist test center

- **Owner:** Morgan (Product Manager and Orchestrator)
- **Scope:** Add a protected, read-only receptionist QA workspace with fictional scenarios, guardrails, and draft/published state.
- **Dependencies:** Existing workspace membership and automation-control boundaries.
- **Allowed files:** `src/app/workspaces/[tenantId]/receptionist/page.tsx`, `src/components/workspace-shell.tsx`, `src/app/globals.css`, `tests/receptionist-ui.test.ts`, this task file, and the matching handoff.
- **Acceptance criteria:**
  1. Workspace members can see the scenario library and current draft/published status.
  2. The page clearly states that tests are fictional and no live calls, bookings, messages, payments, or dispatches occur.
  3. The page presents a safe review flow: test, inspect, approve, publish, rollback.
  4. No provider credentials, database writes, or external side effects are introduced.
- **Required evidence:** focused UI test, typecheck, lint, and full test run.
- **Review:** coordinator acceptance; no migration required.
