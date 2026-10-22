# CEV-MAKE-162A
- Owner: Morgan (coordinator)
- Scope: Add a reusable Make handoff pattern to the client Integrations page for email, calendar, and booking preparation.
- Dependencies: Existing server-owned tenant mapping, automation controls, operating manual, and provider gates.
- Allowed files: `src/app/workspaces/[tenantId]/integrations/page.tsx`, `tests/integrations-ui.test.ts`, task and handoff docs, `docs/project/PROJECT_STATUS.md`.
- Acceptance criteria:
  1. Owner sees one reusable Make pattern: receive, map, act, prove.
  2. Copy explains that provider actions are client-scoped and approval-gated.
  3. Copy includes duplicate prevention and failure return to office review.
  4. No provider credentials, scenario activation, or external side effects are added.
- Required evidence: focused integration test, full test suite, typecheck, lint, and production build.
- State: implemented.
