# CEV-PROJECT-AUDIT-167E — Truthful workspace readiness

Owner: Morgan (Product Manager and Orchestrator)

## Scope

Replace global or stale launch claims with workspace-specific status derived from existing Retell mapping health and saved onboarding milestones. Make the Launch and Integrations pages tell an operator what is actually known for the selected client without implying that another workspace's test proves this client is live.

## Dependencies

- Existing `client_onboarding_milestones` projection.
- Existing Retell mapping health action.
- CEV-PROJECT-AUDIT-167D integration review.
- No schema, migration, provider setting, or shared contract change.

## Allowed files

- `src/app/workspaces/[tenantId]/launch/page.tsx`
- `src/app/workspaces/[tenantId]/integrations/page.tsx`
- `tests/launch-ui.test.ts`
- `tests/integrations-ui.test.ts`
- `docs/project/handoffs/CEV-PROJECT-AUDIT-167E-morgan.md`

## Acceptance criteria

- Launch readiness does not claim a phone test, Make test, or launch approval unless that workspace's saved evidence supports it.
- Retell status reflects active, paused, unmapped, unconfigured, or unavailable state without exposing the agent ID.
- Make status reflects the selected workspace's saved milestone and never treats platform-level dry-run evidence as client-level proof.
- Production deployment is described accurately as separate from client activation.
- Booking, SMS, email, billing, calendar writes, and dispatch remain approval-gated and are not presented as live.
- Existing membership and role gates remain unchanged.
- Focused tests cover verified and unverified workspace states.

## Required evidence

- `pnpm test -- tests/launch-ui.test.ts tests/integrations-ui.test.ts`
- `pnpm typecheck`
- `pnpm lint`
- Echo review considered and Quinn claim/safety review requested.
- Completed handoff using `docs/templates/AGENT_HANDOFF.md`.

