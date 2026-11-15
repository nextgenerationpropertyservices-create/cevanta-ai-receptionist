# Handoff — CEV-ONBOARD-OPS-153A

## Completed work

The internal Clients page now derives Setup, Testing, Live, and Paused filters from persisted onboarding milestones. A workspace is Live only after all required launch gates are complete; an existing active workspace remains Live for backward compatibility. Setup and Testing remain read-only classifications and do not enable provider automation.

## Changed files

- `src/app/workspaces/[tenantId]/clients/page.tsx`
- `tests/managed-clients.test.ts`
- `docs/project/tasks/CEV-ONBOARD-OPS-153A.md`

## Database and contract changes

None in this task. It consumes the milestone contract prepared under CEV-ONBOARD-OPS-152A. That migration is now installed and verified in hosted Supabase.

## Verification

- `pnpm test -- tests/managed-clients.test.ts tests/launch-ui.test.ts` — PASS; configured runner executed 49 files and 885 tests.
- `pnpm typecheck` — PASS.
- `pnpm lint` — PASS.
- `pnpm build` — BLOCKED by the existing Windows/OneDrive Turbopack CSS worker panic (`src/app/globals.css`, child Node process exits before connection). This is an environment/build-tool failure; typecheck and lint remain clean.

## Limitations and risks

The classifier still falls back to readiness-derived defaults if a future environment is missing the milestone table. It does not itself prove provider connectivity, a successful real call, or a safe production release. External payment, Retell, Make, messaging, calendar, booking, and dispatch actions remain gated.

## Rollback

Revert the stage classifier and its test; milestone records remain untouched.

## Exact next action

Run the application release checks, then deploy only after the separate production approval gate is satisfied.
