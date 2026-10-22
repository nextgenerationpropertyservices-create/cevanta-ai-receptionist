# CEV-UX-THEME-154A — Internal chooser priority and complete light mode

- **Owner:** Morgan — Product Manager and Orchestrator
- **Scope:** Put the internal operations workspace first on the workspace chooser and remove dark command-board surfaces when light mode is selected.
- **Dependencies:** Existing workspace picker, shared theme toggle, and dashboard component classes.
- **Allowed files:** `src/app/workspaces/page.tsx`, `src/app/globals.css`, `tests/workspaces-page-ui.test.tsx`, this task record, matching handoff.
- **Acceptance criteria:**
  1. The internal workspace section renders before the welcome and client sections.
  2. Light mode uses readable light surfaces for the chooser, overview, alerts, calendar, guide, and internal operations cards.
  3. Dark mode remains unchanged.
  4. No authorization, data, provider, or route behavior changes.
- **Required evidence:** Focused UI tests, typecheck, lint, and production build result with any local filesystem limitation documented.
