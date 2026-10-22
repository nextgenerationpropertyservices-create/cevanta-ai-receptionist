# CEV-OWNER-161A
- Owner: Morgan (coordinator)
- Scope: Add a simple owner-side setup order to the client Integrations page.
- Dependencies: Existing client monitor, invitation, Retell mapping, and automation controls.
- Allowed files: `src/app/workspaces/[tenantId]/integrations/page.tsx`, `tests/integrations-ui.test.ts`, task and handoff docs, `docs/project/PROJECT_STATUS.md`.
- Acceptance criteria:
  1. Owner sees a four-step setup order with plain-language actions.
  2. Each step links to the relevant existing page or section.
  3. The sequence preserves client setup ownership and keeps optional features gated.
  4. No provider credentials or external side effects are added.
- Required evidence: focused integration test, full test suite, typecheck, lint, and production build.
- State: implemented.
