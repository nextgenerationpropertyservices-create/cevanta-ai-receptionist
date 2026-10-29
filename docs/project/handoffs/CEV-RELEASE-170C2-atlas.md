# Agent handoff
- Task ID: CEV-RELEASE-170C2
- Work completed: Completed a read-only hosted preflight for migration `202610260005_invitation_continuations.sql`. The application environment and connected Supabase account both identify project `rafiksklbrfgefkypvkn`, named `Cevanta Development`, in `us-east-1`; it is `ACTIVE_HEALTHY` on PostgreSQL 17. The hosted migration ledger does not contain invitation continuations, and the continuation table/RPCs are absent. All required predecessor schemas, tables, columns, enum values, helper functions, composite invitation key, receipt foreign key, hash functions, RLS posture, and owners are present. Decision: **APPROVED TO APPLY only after the exact Vercel preview is READY and its pre-migration fail-closed invitation response passes.**
- Files changed: `docs/project/handoffs/CEV-RELEASE-170C2-atlas.md` only.
- Database changes: None. All Supabase calls in this task were read-only; no migration, DDL, DML, Auth change, or provider change occurred. The approved file SHA-256 is `E33327AB88B8F968DB974DEE7769916232F565B0EF05B954FB2517D81317BE53`.
- API or contract changes: None. Preflight confirms the hosted predecessor supports the accepted owner-only continuation contract. `onboarding_private.invitations` has the required tenant-scoped unique key and binding fields; `onboarding_private.receipts` has the invitation receipt fields and tenant/invitation foreign key; the `public.app_role` enum includes `owner`; and the three private helpers have empty `search_path`, `postgres` ownership, and no client-role execution grants.
- Verification commands and results: Supabase project listing and `get_project` confirmed the exact active project. Local environment URL comparison returned `env_project_match=True` without printing a value. `list_migrations` showed no `invitation_continuations` entry. Read-only catalog SQL confirmed the new relation and two new RPCs are absent, while every required predecessor relation/function is present. It also confirmed `invitations` and `receipts` are `postgres` owned, RLS enabled, and unreadable by `anon`, `authenticated`, and `service_role`; `onboarding_private` has no USAGE for those roles; `memberships`, `tenants`, and `audit_events` are `postgres` owned with RLS enabled. `pg_catalog.sha256(bytea)` and `hashtextextended(text,bigint)` are present. `node scripts/test-invitation-continuations-embedded.mjs` passed the digest, binding, grant, replay, lock-order, role, and atomicity assertions. Security and performance advisors were read before approval.
- Known limitations: The hosted migration ledger contains dashboard-managed names rather than the repository's earlier numeric filenames, so predecessor readiness is based on direct catalog evidence rather than filename continuity. The read-only preflight does not prove hosted JWT/PostgREST execution, real continuation cookies, wrong-account behavior, or true multi-connection exchange-versus-accept concurrency. Those remain mandatory post-apply checks with fictional identities. The Data API schema setting was not exposed through `current_setting`, but direct ACL checks confirm the private schema and tables are inaccessible to client roles.
- Risks: The current raw-token `public.onboarding_accept_invitation(jsonb)` is still executable by `authenticated` and `service_role`; migration 005 intentionally revokes both and must not be partially applied. The current security advisor baseline reports 18 RLS-without-policy informational findings, 15 authenticated `SECURITY DEFINER` warnings, and leaked-password protection disabled. The no-policy findings on private tables are expected only where all client access is revoked; every function warning still needs contract-specific review. Migration 005 should remove the old raw-accept warning but may add warnings for the two intentionally exposed, input-validating continuation commands. The leaked-password setting and unrelated existing advisor findings are not caused by migration 005, but remain production hardening work. Remediation references: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy, https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable, and https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection.
- Rollback notes: Do not restore query-string invitation tokens or re-grant the old raw-token RPC. If post-apply evidence fails, disable invitation issuance/exchange in the application and repair forward. Do not drop the continuation table after any live continuation has been issued; retained consumed/revoked history and audits must be preserved.
- Exact next action: After Phoenix proves the exact preview is READY and `/api/invitations/continuations` fails closed with the approved privacy/CSP headers before migration, Morgan may apply the exact SHA-256-reviewed SQL with migration name `invitation_continuations` to project `rafiksklbrfgefkypvkn`. Then run the catalog/advisor query below and hand the hosted environment to Quinn for fictional JWT/PostgREST, wrong-account, cross-tenant, cookie-lifecycle, replay, and true-concurrency verification.

## Required post-apply catalog check

Run this read-only query against the same project immediately after the migration:

```sql
select jsonb_build_object(
  'table_present', to_regclass('onboarding_private.invitation_continuations') is not null,
  'exchange_present', to_regprocedure('public.exchange_invitation_continuation(jsonb)') is not null,
  'accept_present', to_regprocedure('public.onboarding_accept_invitation_continuation(jsonb)') is not null,
  'rls_enabled', (
    select relrowsecurity
    from pg_class
    where oid = 'onboarding_private.invitation_continuations'::regclass
  ),
  'client_table_access', jsonb_build_object(
    'public', has_table_privilege('public', 'onboarding_private.invitation_continuations', 'SELECT,INSERT,UPDATE,DELETE'),
    'anon', has_table_privilege('anon', 'onboarding_private.invitation_continuations', 'SELECT,INSERT,UPDATE,DELETE'),
    'authenticated', has_table_privilege('authenticated', 'onboarding_private.invitation_continuations', 'SELECT,INSERT,UPDATE,DELETE'),
    'service_role', has_table_privilege('service_role', 'onboarding_private.invitation_continuations', 'SELECT,INSERT,UPDATE,DELETE')
  ),
  'exchange_acl', jsonb_build_object(
    'public', has_function_privilege('public', 'public.exchange_invitation_continuation(jsonb)', 'EXECUTE'),
    'anon', has_function_privilege('anon', 'public.exchange_invitation_continuation(jsonb)', 'EXECUTE'),
    'authenticated', has_function_privilege('authenticated', 'public.exchange_invitation_continuation(jsonb)', 'EXECUTE'),
    'service_role', has_function_privilege('service_role', 'public.exchange_invitation_continuation(jsonb)', 'EXECUTE')
  ),
  'accept_acl', jsonb_build_object(
    'public', has_function_privilege('public', 'public.onboarding_accept_invitation_continuation(jsonb)', 'EXECUTE'),
    'anon', has_function_privilege('anon', 'public.onboarding_accept_invitation_continuation(jsonb)', 'EXECUTE'),
    'authenticated', has_function_privilege('authenticated', 'public.onboarding_accept_invitation_continuation(jsonb)', 'EXECUTE'),
    'service_role', has_function_privilege('service_role', 'public.onboarding_accept_invitation_continuation(jsonb)', 'EXECUTE')
  ),
  'raw_accept_acl', jsonb_build_object(
    'public', has_function_privilege('public', 'public.onboarding_accept_invitation(jsonb)', 'EXECUTE'),
    'anon', has_function_privilege('anon', 'public.onboarding_accept_invitation(jsonb)', 'EXECUTE'),
    'authenticated', has_function_privilege('authenticated', 'public.onboarding_accept_invitation(jsonb)', 'EXECUTE'),
    'service_role', has_function_privilege('service_role', 'public.onboarding_accept_invitation(jsonb)', 'EXECUTE')
  ),
  'function_posture', (
    select jsonb_agg(jsonb_build_object(
      'signature', p.oid::regprocedure::text,
      'owner', pg_get_userbyid(p.proowner),
      'security_definer', p.prosecdef,
      'config', p.proconfig
    ) order by p.oid::regprocedure::text)
    from pg_proc p
    where p.oid in (
      'public.exchange_invitation_continuation(jsonb)'::regprocedure,
      'public.onboarding_accept_invitation_continuation(jsonb)'::regprocedure
    )
  )
) as verification;
```

Expected: all three objects present; RLS true; every table-access value false; exchange execution false/true/true/false for public/anon/authenticated/service-role; acceptance false/false/true/false; every raw-accept value false; both new functions owned by `postgres`, `SECURITY DEFINER`, and configured with an empty search path. Re-run both security and performance advisors after this query and preserve the exact findings for Quinn.
