# CEV-ONBOARD-AUTO-108A — Standard client onboarding blueprint

Date: 2026-10-12 (America/New_York)
Owner: Morgan (`product_manager`)
Status: implemented

## Scope

Create the first implementation slice for simplified per-client onboarding by standardizing the dashboard-facing onboarding blueprint used for every trade client. This slice gives Setup and Launch a shared source of truth for industry template guidance, AI receptionist intake fields, provider workflow boundaries, readiness gates, and activation rules.

This task does not create or configure live Retell agents, Make scenarios, phone routing, SMS, email, external calendar writes, automatic booking, payment collection, subscription billing, dispatch automation, or provider account authorizations.

## Dependencies

- Existing guided Setup snapshot and onboarding pages.
- Existing Launch and Integrations pages.
- Existing Retell/Make lead ingestion and automation-control gates.
- PROJECT_COMPLETION_GOAL.md self-service client journey direction.

## Allowed files

- `src/lib/client-onboarding-blueprint.ts`
- `src/app/workspaces/[tenantId]/onboarding/page.tsx`
- `src/app/workspaces/[tenantId]/launch/page.tsx`
- `tests/onboarding-ui.test.ts`
- `tests/launch-ui.test.ts`
- `docs/project/tasks/CEV-ONBOARD-AUTO-108A.md`
- `docs/project/handoffs/CEV-ONBOARD-AUTO-108A-morgan.md`
- `docs/project/PROJECT_STATUS.md`
- `MEMORY.md`

## Acceptance criteria

- Setup shows the selected trade template and the information Cevanta will use to draft the receptionist configuration.
- Setup and Launch share one reusable blueprint rather than separate hard-coded checklist copy.
- The blueprint lists required intake fields for Retell/Make/Cevanta lead routing without exposing private webhook URLs, API keys, provider secrets, or real customer data.
- The blueprint keeps current pilot boundaries clear: office review first, no automatic booking, no customer messages, no payments, no dispatch automation without later approvals.
- Launch shows the controlled self-service path from account/workspace setup through readiness review, test call, and eligible activation.
- Tests cover the new Setup and Launch copy and confirm unsafe claims or secret language are not rendered.

## Required evidence

- Focused UI tests pass for onboarding and launch.
- Typecheck and lint pass, or skipped checks are recorded with the reason.
- Handoff and project status record what was built and what remains for server-side provisioning.
