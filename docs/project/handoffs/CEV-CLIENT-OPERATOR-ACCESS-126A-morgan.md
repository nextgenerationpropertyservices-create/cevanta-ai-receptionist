# CEV-CLIENT-OPERATOR-ACCESS-126A handoff

Status: implemented; preview redeploy required

## Completed

- Internal Cevanta owners/admins can review a managed client workspace while the client remains in guided Setup.
- The bypass is tenant-scoped: it requires the current user to have an internal membership and a matching `managed_client_workspaces` relation.
- Unrelated client owners/admins remain subject to the existing Setup gate.

## Verification

- `pnpm exec vitest run tests/client-onboarding-gate.test.ts tests/client-onboarding-route-audit.test.ts` — PASS, 6 tests.
- `pnpm typecheck` — PASS.
- `pnpm lint` — PASS.

## Limitations and next action

- The fix must be pushed and rebuilt before the preview browser shows the internal review access.
- The client still sees Setup until required information is complete.
- No SMS, email, booking, calendar, payment, or dispatch automation is enabled.
