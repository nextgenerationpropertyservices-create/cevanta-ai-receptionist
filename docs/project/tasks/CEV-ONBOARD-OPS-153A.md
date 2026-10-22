# CEV-ONBOARD-OPS-153A — Persisted onboarding stage automation

## Owner

Morgan (Product Manager and Orchestrator)

## Scope

Use the persisted onboarding milestone record to classify managed client workspaces as Setup, Testing, Live, or Paused in the internal Clients view.

## Dependencies

- CEV-ONBOARD-OPS-152A milestone contract and server action.
- Existing managed-client query and owner/admin authorization.
- Hosted migration `202610210001_client_onboarding_milestones.sql` requires Architect review and authorized application before persisted data is available in production.

## Allowed files

- `src/app/workspaces/[tenantId]/clients/page.tsx`
- `tests/managed-clients.test.ts`
- this task record and its handoff

## Acceptance criteria

1. Paused workspaces remain Paused.
2. A client is Live only when payment is paid, setup is complete, the test call passed, Retell and Make are verified, and launch approval is approved, or the existing workspace status is active.
3. A client with complete setup and an active test/integration milestone is Testing.
4. Incomplete clients remain Setup.
5. Filtering and counts use the same classification as the visible intake cards.
6. No provider is enabled by stage classification.

## Required evidence

- Focused managed-client tests cover the persisted Live path and existing Setup path.
- Typecheck and lint pass.
- Hosted migration state is reported separately from local code evidence.
