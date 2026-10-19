# CEV-LEADS-UI-135A — Leads needs-attention panel scroll

- Owner: Morgan (Product Manager / Orchestrator)
- Scope: Keep the Leads needs-attention queue readable by containing vertical and horizontal table scrolling inside the queue panel, with a sticky header and complete row visibility.
- Dependencies: Existing Leads route and shared dashboard styling.
- Allowed files: `src/app/workspaces/[tenantId]/leads/page.tsx`, `src/app/globals.css`, `tests/leads-ui.test.ts`, this task record, and the handoff record.
- Acceptance criteria:
  - The needs-attention table is a named panel with a bounded internal scroll region.
  - Table headers remain visible while the queue scrolls.
  - Rows retain readable content and do not clip the action controls.
  - Narrow screens can scroll the table region horizontally without moving the entire page unexpectedly.
  - Existing Leads rendering and tests remain passing.
- Required evidence: focused Leads UI test, typecheck, lint, and production build result (or documented environment blocker).
