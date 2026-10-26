# CEV-ONBOARD-EASE-157A
- Owner: Morgan (coordinator)
- Scope: Make client onboarding faster by clearly separating required setup from optional sections and allowing optional sections to be skipped.
- Dependencies: Existing onboarding wizard and readiness rules.
- Allowed files: `src/app/workspaces/[tenantId]/onboarding/onboarding-wizard.tsx`, `src/app/workspaces/[tenantId]/onboarding/page.tsx`, `tests/onboarding-ui.test.ts`, task and handoff docs.
- Acceptance criteria:
  1. Required sections remain explicit and unchanged.
  2. Optional date-specific hours and sheet review can be skipped without pretending they are complete.
  3. Wizard remains one section at a time with keyboard-accessible controls.
  4. Readiness still uses server-side required checks.
- Required evidence: focused onboarding tests, full test suite, typecheck, lint, and build result.
- State: assigned.
