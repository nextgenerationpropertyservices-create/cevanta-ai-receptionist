# CEV-THEME-140A — Dashboard light and dark mode

- **Owner:** Morgan — Product Manager and Orchestrator
- **Scope:** Add an accessible dashboard theme switch with persistent local preference; preserve the dark command-board default and provide readable light surfaces.
- **Dependencies:** Authenticated workspace shell and shared global theme CSS.
- **Allowed files:** `src/components/theme-toggle.tsx`, `src/components/workspace-shell.tsx`, `src/app/globals.css`, `tests/workspace-shell-ui.test.ts`, this task record, matching handoff, and project status.
- **Acceptance criteria:** The switch is visible in the workspace header, toggles light/dark mode without navigation, persists the choice in the browser, and keeps text/cards/forms readable in both modes. No provider or database side effects.
- **Required evidence:** Focused shell test, typecheck, lint, and production build result with any local filesystem limitation documented.
