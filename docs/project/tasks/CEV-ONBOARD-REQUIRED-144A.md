# Task CEV-ONBOARD-REQUIRED-144A — Align required client setup information

- Owner: Morgan (Product Manager and Orchestrator)
- Scope: Align onboarding labels, validation, readiness, and copy around the minimum information needed for a safe office-review pilot.
- Dependencies: Existing onboarding snapshot/actions, onboarding validation, provisioning readiness, and guided wizard.
- Allowed files: `src/lib/onboarding-validation.ts`; `src/lib/provisioning-readiness.ts`; `src/app/workspaces/[tenantId]/onboarding/onboarding-form.tsx`; `src/app/workspaces/[tenantId]/onboarding/page.tsx`; `tests/onboarding-ui.test.ts`; `tests/provisioning-readiness.test.ts`; this task record; its handoff; `docs/project/PROJECT_STATUS.md`.
- Acceptance criteria:
  - Required setup is clearly identified as business identity, one office contact method, one enabled service, at least one open-hours block, request/never-promise notes with acknowledgment, and one enabled escalation contact with a contact method.
  - Optional date overrides, timing preferences, and additional contacts do not block setup readiness.
  - Profile saves continue to support partial drafts; readiness blocks until the office contact requirement is met.
  - Readiness copy matches the actual gate and does not claim optional fields are required.
  - Relevant tests, typecheck, lint, and production build or an explicit build limitation are recorded.
- Required evidence: focused onboarding and provisioning tests plus standard checks.
