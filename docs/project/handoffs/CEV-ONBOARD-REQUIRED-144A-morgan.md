
## CEV-ONBOARD-REQUIRED-144A handoff

Date: 2026-10-19 (America/New_York)
Coordinator: Morgan — Product Manager and Orchestrator

Aligned the client onboarding UI and provisioning readiness gate around the minimum safe office-review setup: business identity, a contact name plus one office email or phone, one enabled named service, at least one open-hours block across the saved weekly schedule, acknowledged office-review/never-promise notes, and one enabled escalation contact with a name and email or phone. Holidays, timing preferences, and extra contacts remain optional. Profile saves still allow partial drafts; the readiness gate is what blocks activation.

Changed files: `src/app/workspaces/[tenantId]/onboarding/onboarding-form.tsx`, `src/app/workspaces/[tenantId]/onboarding/page.tsx`, `src/lib/provisioning-readiness.ts`, `tests/onboarding-ui.test.ts`, `tests/provisioning-readiness.test.ts`.

Database changes: None. API/provider changes: None.

Verification: `pnpm test -- tests/onboarding-ui.test.ts tests/provisioning-readiness.test.ts` passed (47 files / 875 tests because the configured runner executes the full suite); `pnpm typecheck` passed; `pnpm lint` passed; `git diff --check` passed. `pnpm build` remains blocked by the known local OneDrive/Turbopack worker panic while processing `src/app/globals.css`.

Risks: The requirement is a readiness gate, not a provider activation gate. No booking, messaging, calendar, payment, dispatch, Retell, or Make side effects were added.

Rollback: Revert the five implementation/test files and this task documentation.

Next action: Owner review and approval before production deployment.
