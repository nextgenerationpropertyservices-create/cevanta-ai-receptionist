# Task CEV-DASHBOARD-POLISH-149A — Dashboard-wide usability polish

- **Owner:** Morgan — Product Manager and Orchestrator
- **State:** assigned
- **Scope:** Improve the shared authenticated dashboard shell and both internal/client overview presentation without changing persistence, permissions, or provider behavior.
- **Dependencies:** Existing workspace shell, navigation, overview widgets, theme toggle, and current dashboard contracts.
- **Allowed files:** `src/app/workspaces/[tenantId]/page.tsx`; `src/components/workspace-shell.tsx`; `src/components/workspace-nav.tsx`; `src/app/globals.css`; `tests/dashboard-ui.test.ts`; this task record; matching handoff.
- **Acceptance criteria:**
  1. Internal and client workspace context is immediately clear in the shared header.
  2. Overview actions and attention states remain prominent and keyboard accessible.
  3. Navigation remains usable on narrow screens without horizontal overflow or unreadable controls.
  4. Dashboard cards, alerts, and empty states use consistent dark-theme surfaces and readable contrast.
  5. Existing routes, data loading, permissions, and provider-side-effect boundaries remain unchanged.
- **Required evidence:** focused dashboard tests, typecheck, lint, and production build (or a documented environment limitation).
