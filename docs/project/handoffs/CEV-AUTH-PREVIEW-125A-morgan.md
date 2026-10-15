# CEV-AUTH-PREVIEW-125A handoff

Status: implemented; preview redeploy required

## Completed

- Preview deployments now derive the auth callback origin from Vercel's `VERCEL_URL` when `APP_ORIGIN` is absent and `VERCEL_ENV` is not `production`.
- Production deployments still require an explicit `APP_ORIGIN`.
- Added regression coverage for preview fallback and production fail-closed behavior.

## Changed files

- `src/lib/server/password-recovery-origin.ts`
- `tests/password-recovery.test.ts`

## Verification

- `pnpm exec vitest run tests/password-recovery.test.ts tests/security.test.ts` — PASS, 210 tests.
- `pnpm typecheck` — PASS.
- `pnpm lint` — PASS.

## Limitations and next action

- The existing preview deployment must rebuild from this change before the browser can exercise it.
- Live Supabase email delivery remains dependent on the project's Auth email provider and redirect URL configuration.
- Production deployment was not performed.
