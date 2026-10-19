# Task CEV-STARTUP-142A — Clean workspace startup

- Owner: Morgan (Product Manager and Orchestrator)
- Scope: Simplify the authenticated workspace picker so owners can identify the internal dashboard, client workspaces, and the next setup action quickly.
- Dependencies: Existing workspace query, membership checks, workspace provisioning action, and shared UI styles.
- Allowed files: `src/app/workspaces/page.tsx`; `src/app/globals.css`; `tests/workspaces-page-ui.test.tsx`; this task record; its handoff.
- Acceptance criteria:
  - The page has one clear welcome area and a visible first action.
  - Internal and client workspaces are visually and textually distinct.
  - Existing links, sign-out, and workspace creation still work.
  - Layout remains readable on narrow screens and in both themes.
- Required evidence: focused workspace picker test, typecheck, lint, and production build (or an explicit local build limitation).
