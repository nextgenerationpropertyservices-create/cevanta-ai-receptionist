# CEV-INVITE-CONT-169D independent security review

Date: 2026-10-27 (America/New_York)  
Reviewer: Quinn (`quality_security`)  
Decision: **PASS WITH LIMITATIONS**

This final decision supersedes the initial rejection. CEV-INVITE-CONT-169E and CEV-INVITE-CONT-169F resolved all three reported findings; each heading records the independently verified resolution.

## Final re-review summary

- **INV-1 resolved:** the maintained onboarding SQL suite now treats `onboarding_accept_invitation(jsonb)` as retired and proves `public`, `anon`, `authenticated`, and `service_role` cannot execute it. The suite no longer invokes or positively grants the raw-token command.
- **INV-2 resolved structurally:** exchange and acceptance now use the same lock sequence: membership advisory lock, onboarding advisory lock, invitation row lock, then continuation row mutation/lock. Acceptance performs only a non-locking immutable-binding lookup before that sequence and revalidates mutable state after all locks. Structural SQL assertions guard both definitions.
- **INV-3 resolved:** both exchange and acceptance reject any `intended_role <> 'owner'` before mutating continuation, membership, audit, receipt, or invitation state. A seeded historical non-owner continuation remains active and unchanged after refusal.
- All maintained embedded onboarding, continuation, and aggregate database suites pass. Focused invitation/security application tests pass. No new source, migration, deployment, or hosted database change was made by Quinn.

## Initial findings and verified repairs

### INV-1 — Medium — RESOLVED by CEV-INVITE-CONT-169E

`supabase/tests/onboarding_commands.sql` now has explicit negative privilege assertions for `public`, `anon`, `authenticated`, and `service_role` on the retired raw-token function. It no longer invokes that function or treats its grant as required. `node scripts/test-onboarding-commands-embedded.mjs` passes without restoring the ACL.

### INV-2 — Medium — RESOLVED by CEV-INVITE-CONT-169F

The repaired SQL definitions use the same sequence: membership advisory lock, onboarding advisory lock, invitation row lock, then continuation row mutation/lock. Acceptance's preliminary continuation lookup does not lock and reads only immutable binding fields; mutable state is rechecked after the ordered locks. `pg_get_functiondef` assertions protect both definitions. True simultaneous multi-connection behavior remains a hosted release check because PGlite is sequential.

### INV-3 — Medium — RESOLVED by CEV-INVITE-CONT-169F

The database now enforces the approved owner-only contract before mutation at both exchange and acceptance, matching the server decoder. Tests seed a historical non-owner continuation and prove refusal creates no membership, audit, or receipt; does not alter the invitation; and leaves the continuation active.

## Positive evidence

- The fragment is removed before parsing/fetching, exact `v/r/t` keys and canonical token form are validated, and no browser storage or third-party URL is used.
- Same-origin exchange checks exact Origin, Host, forwarded host/protocol when present, `Sec-Fetch-Site`, JSON media type, declared size, and streamed size. It emits no CORS allow-origin header.
- Cookie evidence confirms `__Host-cevanta-invite`, `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/`, `Max-Age=900`, High priority, and no Domain.
- Sign-in and acceptance use fixed paths. Browser-supplied token, tenant, role, and redirect fields are ignored. The acceptance cookie is cleared before the database call.
- The database table is private with RLS, no API-role table grants, fixed empty search paths, PostgreSQL function ownership, narrow anon/authenticated grants, service-role denial, and old raw-token command revocation.
- Embedded SQL covers confirmed identity, wrong account, expiry, revocation, substitution, malformed input, one active handle, replay, accepted state, membership removal, conflicting membership, direct table/RPC denial, audit/receipt atomic rollback, and retained history.
- Runtime paths use ordinary anonymous/authenticated Supabase sessions; no service client or service-role key is imported by this flow.
- Invitation source/test scan found no common private-key/token prefix or routable personal email. Fixtures use synthetic UUIDs and `.invalid`/`.test` addresses.
- Application errors and responses are generic; no token, digest, provider payload, account email, tenant, or role is logged by the invitation flow.

## Independent commands

- `node scripts/test-onboarding-commands-embedded.mjs` — **PASS**.
- `node scripts/test-invitation-continuations-embedded.mjs` — **PASS**.
- `node scripts/test-db-embedded.mjs` — **PASS**, all migrations, fictional seed, and maintained aggregate assertions.
- `node node_modules/vitest/vitest.mjs run --configLoader native tests/invitation-continuations.test.ts tests/invitations.test.ts tests/invitation-ui.test.ts tests/security.test.ts` — **PASS**, 4 files / 210 tests.
- `node node_modules/typescript/bin/tsc --noEmit` — **PASS**.
- Focused ESLint for repaired/runtime files — **PASS**; the SQL path is intentionally ignored by the JavaScript ESLint configuration.
- Targeted raw-token, service-role, query-token, secret, and personal-data scans — **PASS**. Reviewed fixtures use synthetic UUIDs and `.invalid`/`.test` addresses; no raw invitation secret or routable customer data was found.
- `git diff --check` for the repaired migration/tests and review records — **PASS**.
- Independent browser execution remains **BLOCKED** by the Windows Edge temporary-profile restriction. Nova's earlier 2/2 browser result is supporting specialist evidence, not independently reproduced evidence.

## Unverified external evidence

Hosted Supabase migration/JWT/PostgREST grants, true simultaneous database connections, production proxy Origin/Host behavior, real cookie persistence/deletion, hosted CSP/referrer/access logs, production browser history, and an end-to-end fictional acceptance are not proven locally. The operating system/browser chrome may briefly display the pasted fragment before page JavaScript executes; the Cevanta-controlled DOM/history/storage/request boundary is the intended guarantee.

## Release decision and order

Quality decision is **PASS WITH LIMITATIONS** for local integration. Phoenix should release the fail-closed application/UI first, apply Architect-reviewed migration 005 second, then verify hosted multi-role JWT/PostgREST grants, true simultaneous exchange-versus-accept behavior, production proxy headers, cookie persistence/deletion, CSP/referrer/access-log privacy, and a fictional end-to-end acceptance. Revoke any still-pending legacy query-token invitations before client use. Rollback must disable invitation issuance and repair forward; it must never restore query-string tokens or the old raw-token RPC grant.

