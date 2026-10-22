# CEV-INTEGRATIONS-160A
- Owner: Morgan (coordinator)
- Scope: Make email, SMS, and live booking preparation easier to find and understand without enabling provider side effects.
- Dependencies: Existing automation controls and approval gates.
- Allowed files: `src/app/workspaces/[tenantId]/integrations/page.tsx`, `src/app/workspaces/[tenantId]/integrations/automation-control-form.tsx`, `tests/integrations-ui.test.ts`, task and handoff docs, `docs/project/PROJECT_STATUS.md`.
- Acceptance criteria:
  1. Integrations shows three quick setup cards for email, SMS, and live booking.
  2. Each card jumps to the correct gated control.
  3. Controls remain off by default and still require approval, testing, and rollback evidence before active status.
  4. No provider credentials or external side effects are added.
- Required evidence: focused integration test, full test suite, typecheck, lint, and production build.
- State: implemented.
