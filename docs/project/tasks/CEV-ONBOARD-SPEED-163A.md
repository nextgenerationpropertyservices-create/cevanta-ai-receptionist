# CEV-ONBOARD-SPEED-163A

- Owner: Morgan (coordinator)
- Scope: Make the client setup Services and Weekly hours steps faster to complete without changing the saved onboarding contract.
- Dependencies: Existing onboarding wizard, `replace_services`, and `replace_weekly_hours` actions.
- Allowed files: `src/app/workspaces/[tenantId]/onboarding/onboarding-form.tsx`, `src/app/globals.css`, `tests/onboarding-ui.test.ts`, task and handoff docs, and project status.
- Acceptance criteria:
  1. Services offer a short common-service picker that adds an editable, enabled service without removing existing services.
  2. Weekly hours offer common schedule presets and a copy-from-day control for repeating hours across selected days.
  3. Existing manual editing, validation, save, and approval boundaries remain unchanged.
  4. Controls are labelled and usable on narrow screens.
- Required evidence: onboarding UI tests, full test suite, typecheck, lint, and production build.
- State: implemented; awaiting owner release approval.
