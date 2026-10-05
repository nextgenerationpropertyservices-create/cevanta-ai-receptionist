# CEV-AUTH-PROXY-70B — Public auth pages avoid hosted Auth proxy stall

Status: accepted with limitations
Owner: Morgan — Product Manager and Orchestrator
Date: 2026-10-05

## Scope

Fix the local password-recovery page hanging while rendering when hosted Supabase Auth requests fail or time out from the proxy. Public auth entry pages should render without waiting on a hosted Auth session refresh. Protected pages and server actions must still perform authoritative verified-user checks before data access.

## Files changed

- `src/proxy.ts`
- `tests/retell-proxy-path.test.ts`
- `docs/project/tasks/CEV-AUTH-PROXY-70B.md`
- `docs/project/handoffs/CEV-AUTH-PROXY-70B-morgan.md`
- `docs/project/PROJECT_STATUS.md`
- `docs/project/FIRST_CLIENT_EVIDENCE_TRACKER.md`
- `docs/project/BACKLOG.md`
- `context/NEXT_TASK.md`

## Change made

Added a narrow public-route bypass in `src/proxy.ts` for:

- `/`
- `/sign-in`
- `/forgot-password`
- `/auth/callback`
- `/auth/recovery`

These pages now render without calling `client.auth.getUser()` in the proxy. Protected routes such as `/workspaces` still run the Supabase session refresh behavior in the proxy, and backend/server actions still run verified-user checks before protected operations.

## Evidence

- Before fix: dev-server logs showed `/forgot-password` taking about 25.5 seconds in `proxy.ts` with `AuthRetryableFetchError: fetch failed`.
- After fix: direct request to `http://127.0.0.1:3000/forgot-password` returned status 200 in about 266 ms.
- Dev-server log after hot reload showed `GET /forgot-password 200 in 79ms`.
- `pnpm test -- tests/retell-proxy-path.test.ts` passed; due the repository's test invocation behavior, all Vitest files ran and passed with 706 tests.
- `pnpm check` passed with typecheck, lint, 16 Vitest files/706 tests, embedded database suites, onboarding command embedded checks and production build.

## Acceptance decision

Accepted with limitations. The local forgot-password page no longer stalls on hosted Auth proxy lookup. Actual email delivery, reset-link opening, password update and sign-in remain owner-performed and not yet verified.
