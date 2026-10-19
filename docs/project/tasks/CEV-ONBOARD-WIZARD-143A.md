# Task CEV-ONBOARD-WIZARD-143A — Guided client setup wizard

- Owner: Morgan (Product Manager and Orchestrator)
- Scope: Replace the long client setup page with a one-section-at-a-time wizard while preserving existing setup persistence, validation, roles, and safe automation boundaries.
- Dependencies: Existing onboarding snapshot/actions/forms, client onboarding gate, and workspace setup route.
- Allowed files: `src/app/workspaces/[tenantId]/onboarding/page.tsx`; `src/app/workspaces/[tenantId]/onboarding/onboarding-wizard.tsx`; `src/app/globals.css`; `tests/onboarding-ui.test.ts`; this task record; its handoff; `docs/project/PROJECT_STATUS.md`.
- Acceptance criteria:
  - Only one setup section is visible at a time.
  - Client can move Back/Next and the wizard returns to its heading after a transition.
  - Existing section save actions and validation remain unchanged.
  - A compact progress summary and an expandable information panel remain available.
  - Role-safe projections remain unchanged.
- Required evidence: onboarding UI/route tests, typecheck, lint, and production build or an explicit build limitation.
