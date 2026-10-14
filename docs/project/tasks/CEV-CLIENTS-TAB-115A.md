# CEV-CLIENTS-TAB-115A — Make internal Clients dashboard discoverable

Owner: Morgan — Product Manager and Orchestrator

Scope: Make the internal owner/client operations dashboard easier to find from the workspace picker and workspace top navigation.

Dependencies: Existing internal workspace support and managed-client dashboard route.

Allowed files:
- src/components/workspace-shell.tsx
- src/app/workspaces/page.tsx
- tests/workspace-shell-ui.test.ts
- tests/workspaces-page-ui.test.tsx
- docs/project/tasks/CEV-CLIENTS-TAB-115A.md
- docs/project/handoffs/CEV-CLIENTS-TAB-115A-morgan.md

Acceptance criteria:
- Internal workspaces show a clear Clients tab instead of ambiguous Back office wording.
- Workspace picker identifies internal owner dashboards and offers clear copy for client management.
- Client workspaces remain normal customer/service dashboards.
- No provider actions, billing, messaging, booking, calendar writes, payment collection, or dispatch automation are enabled.

Evidence required:
- Focused UI tests for the workspace shell and workspace picker.
- Typecheck, lint, and production build, or explicit blockers.
