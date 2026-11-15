# CEV-INVITE-CONT-169B — Invitation continuation server boundary

- **Owner:** Blake (`backend_logic`)
- **Status:** Accepted with limitations after CEV-INVITE-CONT-169D review
- **Scope:** Replace query-token issuance/acceptance with fragment issuance, bounded same-origin exchange, opaque HttpOnly continuation cookie, authenticated continuation acceptance, and fixed post-sign-in routing. The database remains final authority. No service-role client and no raw token in server output/logs/errors/cookies after exchange.
- **Dependencies:** Accepted architecture task 167P; exact RPC shapes in 169A.
- **Allowed files:**
  - `src/app/api/invitations/continuations/route.ts`
  - `src/lib/server/invitation-continuations.ts`
  - `src/app/actions/invitations.ts`
  - `src/app/actions/auth.ts`
  - `tests/invitation-continuations.test.ts`
  - `tests/invitations.test.ts`
  - `tests/security.test.ts`
  - `docs/project/handoffs/CEV-INVITE-CONT-169B-blake.md`
- **Acceptance criteria:** Fragment links only; exact origin/host/fetch-site/content-type/body limits; no CORS; safe `{status}` responses; strict result parsing; `__Host-cevanta-invite` cookie flags; fixed `/invite/continue` sign-in redirect; acceptance reads/hashes/clears cookie server-side; fixed UUID workspace redirect after strict DB envelope; fail-closed app-before-migration behavior; no query token/service role/log leakage.
- **Required reviewer:** Quinn before release.
- **Required evidence:** Focused server tests, CSRF/body/header/host negatives, cookie assertions, raw-token scans, auth/open-redirect tests, typecheck/lint/full tests/build, limitations, and no-deploy statement.

