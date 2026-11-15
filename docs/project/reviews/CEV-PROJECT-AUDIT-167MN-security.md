# CEV-PROJECT-AUDIT-167M + 167N — Independent security review

Date: 2026-10-26  
Reviewer: Quinn (Quality and Security)

## Decision

**PASS WITH LIMITATIONS.** The paired database command and app adapter repair the previously impossible job-delete flow without adding a direct authenticated table DELETE grant. No unresolved Critical, High, or Medium defect was confirmed in the reviewed final pair.

This approval is local evidence only. It does not authorize production deployment or prove hosted Supabase JWT/PostgREST behavior. The application adapter, reviewed migration, and hosted role/tenant checks must be released and verified in the order below.

## Authorization and tenant-isolation findings

- `public.delete_job(uuid,uuid)` derives the actor only through `onboarding_private.current_identity()`, which requires `auth.uid()` to match a confirmed, non-deleted Auth record. It does not accept an actor or role from the client.
- The command reads the actor's membership for the exact `target_tenant` and permits only `owner`, `admin`, or `dispatcher`. Anonymous, unconfirmed/deleted, viewer, technician, non-member, unrelated, and cross-tenant identities fail with the same `unavailable` status.
- The delete predicate uses both `tenant_id` and job `id`. Wrong-tenant, missing, null, unauthorized, and already-removed records are indistinguishable to the caller.
- The command is PostgreSQL-owned `SECURITY DEFINER` with an empty search path and fully qualified trusted references. Execute is granted only to `authenticated`; `PUBLIC`, `anon`, and `service_role` are revoked.
- Direct DELETE privilege and DELETE RLS policy remain absent for authenticated and anonymous clients. The app no longer issues a direct table delete.

## Atomicity, linked records, and audit findings

- Existing foreign keys protect appointment-linked and Reactivation-candidate-linked jobs. A foreign-key violation is converted to status `protected`; both the job and linked record remain unchanged.
- Existing job audit triggers write actor-attributed DELETE audit rows for successful owner/admin/dispatcher deletes.
- The SQL suite forces a DELETE-audit write failure and proves the function returns `unavailable`, the job remains, and no partial audit row is left. PostgreSQL exception subtransaction behavior therefore preserves delete/audit atomicity in the tested contract.
- Denied, missing, cross-tenant, and protected attempts create no DELETE audit event.

## Application adapter findings

- `deleteJob` validates tenant and job UUIDs, then uses the existing verified-user office-role membership guard before invoking the command.
- The RPC response parser accepts only a one-key object whose status is exactly `deleted`, `protected`, or `unavailable`. Arrays, null, unknown states, provider errors, and responses containing an identifier or any extra field fail closed.
- Only `deleted` triggers Jobs, Calendar, and Notifications revalidation and the Jobs redirect. `protected` receives a generic linked-record message; all other failures receive a generic permission/retry message. Database/provider details and record identifiers are not returned.
- No service client, service-role key, console logging, webhook value, credential, or real customer information appears in the reviewed runtime/tests. Test identities use synthetic UUIDs and `.invalid` email addresses.

## Independent verification

- `node node_modules/vitest/vitest.mjs run --configLoader native tests/jobs.test.ts` — **PASS**, 1 file / 82 tests.
- `node scripts/test-jobs-embedded.mjs` — **PASS**, including ownership/grants/search path, confirmed identity, allowed and denied roles, cross-tenant privacy, direct DELETE denial, linked records, successful audit attribution, denied-audit absence, and audit-failure rollback.
- `node node_modules/typescript/bin/tsc --noEmit` — **PASS**.
- `node node_modules/eslint/bin/eslint.js .` — **PASS**.
- Source scan for direct `.from("jobs").delete()` app calls — **PASS by absence**.
- Source scan for service-client/key imports, console logging, webhook material, common key prefixes, and routable personal email addresses in the reviewed files — **PASS by absence**. The only `service_role` references are explicit database grant-denial assertions.

## Limitations and risks

- PGlite uses a synthetic Auth compatibility fixture. It does not prove hosted JWT claims, session revocation timing, PostgREST function exposure, or concurrent membership removal.
- The reviewed migration has not been applied to hosted Supabase in this work. The app and database may remain version-skewed until an authorized release.
- A final clean production build is tracked separately by Release. It was not rerun as part of this independent security review.
- The database deliberately collapses unexpected errors to `unavailable`. This is safe for the caller but requires private operational monitoring outside this command if hosted failures need diagnosis.

## Required release order and hosted proof

1. Deploy the fail-closed 167N application adapter first. Without the command it returns a generic error and does not delete.
2. Apply reviewed migration `202610260003_job_deletion_command.sql` second. Do not add a direct jobs DELETE policy/grant during recovery.
3. With fictional hosted identities, prove owner/admin/dispatcher success; viewer/technician/unconfirmed/deleted/non-member/cross-tenant denial; linked appointment protection; status-only results; direct table DELETE denial; and actor-attributed audit creation.
4. Confirm the UI refreshes Jobs, Calendar, and Notifications only after a successful delete.
5. Keep production release blocked until the fresh build and hosted checks are recorded. No deployment or hosted migration occurred in this review.

