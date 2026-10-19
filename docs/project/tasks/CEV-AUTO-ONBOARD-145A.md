# CEV-AUTO-ONBOARD-145A

- Owner: Morgan (Product Manager / Orchestrator)
- Scope: Automatically submit a completed client onboarding snapshot to the configured Make intake webhook when the final wizard step is opened.
- Dependencies: Active Make scenario 6652097; server-only `CEVANTA_CLIENT_INTAKE_WEBHOOK_URL`; existing onboarding snapshot and readiness checks.
- Allowed files: `src/app/workspaces/[tenantId]/onboarding/onboarding-wizard.tsx`, `src/app/workspaces/[tenantId]/onboarding/onboarding-form.tsx`, `src/app/workspaces/[tenantId]/onboarding/page.tsx`, `tests/onboarding-ui.test.ts`, this task file, and its handoff.
- Acceptance criteria:
  - The final onboarding step attempts one automatic sync per tenant/configuration revision in the current browser.
  - Incomplete setup never reports success; the existing server readiness gate remains authoritative.
  - The manual retry remains available when the automatic attempt is unavailable or fails.
  - No provider, booking, payment, messaging, calendar, or dispatch side effect is introduced.
- Evidence required: typecheck, lint, focused onboarding tests, and production build result.
