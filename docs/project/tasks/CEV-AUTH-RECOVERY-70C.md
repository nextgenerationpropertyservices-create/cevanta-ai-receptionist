# CEV-AUTH-RECOVERY-70C — Recovery callback accepts Supabase token and PKCE code formats

Status: accepted with limitations
Owner: Morgan — Product Manager and Orchestrator
Date: 2026-10-05

## Scope

Fix the local password reset callback so it can accept both supported Supabase recovery callback formats seen in SSR flows: `token_hash` and safe PKCE `code` query values.

## Files changed

- `src/app/auth/recovery/route.ts`
- `tests/password-recovery.test.ts`
- `docs/project/tasks/CEV-AUTH-RECOVERY-70C.md`
- `docs/project/handoffs/CEV-AUTH-RECOVERY-70C-morgan.md`
- `docs/project/PROJECT_STATUS.md`
- `docs/project/FIRST_CLIENT_EVIDENCE_TRACKER.md`
- `docs/project/BACKLOG.md`
- `context/NEXT_TASK.md`

## Change made

The recovery route now accepts exactly one of:

- a safe `token_hash`, verified with `verifyOtp({ type: "recovery" })`
- a safe PKCE `code`, exchanged with `exchangeCodeForSession(code)`

Ambiguous, missing, duplicated, oversized or unsafe query values fail closed to `/reset-password?error=recovery`. Provider errors remain hidden.

## Evidence

- `pnpm test -- tests/password-recovery.test.ts` passed; due the repository test invocation behavior, all Vitest files ran and passed with 711 tests.
- `pnpm check` passed with typecheck, lint, 16 Vitest files/711 tests, embedded database suites, onboarding command embedded checks and production build.

## Acceptance decision

Accepted with limitations. The app can now handle both safe callback formats locally. Actual email delivery, owner link opening, password update and sign-in remain owner-performed and not independently verified.
