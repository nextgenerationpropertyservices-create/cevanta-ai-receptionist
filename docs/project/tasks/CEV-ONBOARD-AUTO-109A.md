# CEV-ONBOARD-AUTO-109A — Provisioning readiness gate

Date: 2026-10-12 (America/New_York)
Owner: Morgan (`product_manager`)
Status: implemented

## Scope

Add a server-side readiness summary for per-client provisioning that turns saved onboarding setup and automation-control settings into a safe Launch dashboard checklist. This is the second preparation slice after the standard onboarding blueprint.

The checklist must show which client setup items are ready, which provider steps still need manual/operator work, and which activation gates remain blocked. It must not create Retell agents, Make scenarios, phone routing, SMS, email, external calendar writes, automatic booking, payment collection, subscription billing, dispatch automation, provider account authorizations, or external side effects.

## Dependencies

- CEV-ONBOARD-AUTO-108A shared onboarding blueprint.
- Existing onboarding snapshot RPC.
- Existing automation-control read model.
- Existing Launch page.

## Allowed files

- `src/lib/provisioning-readiness.ts`
- `src/app/workspaces/[tenantId]/launch/page.tsx`
- `tests/provisioning-readiness.test.ts`
- `tests/launch-ui.test.ts`
- `docs/project/tasks/CEV-ONBOARD-AUTO-109A.md`
- `docs/project/handoffs/CEV-ONBOARD-AUTO-109A-morgan.md`
- `docs/project/PROJECT_STATUS.md`
- `MEMORY.md`

## Acceptance criteria

- Launch shows a provisioning readiness checklist derived from saved setup and automation-control data.
- The checklist distinguishes ready setup data from manual provider work and blocked activation gates.
- The checklist keeps office review first and clearly states that provider/live actions remain inactive until separately approved and tested.
- The logic does not expose secrets, provider identifiers, webhook URLs, API keys, real customer data, or private failure details.
- Tests cover ready and missing setup states, blocked activation, and Launch rendering.

## Required evidence

- Focused provisioning and Launch tests pass.
- Typecheck and lint pass, or skipped checks are recorded with the reason.

