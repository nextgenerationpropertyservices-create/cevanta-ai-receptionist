# CEV-INTAKE-133A — Reliable lead deletion and calendar tab contrast

## Owner

Morgan — Product Manager and Orchestrator

## Scope

Restore the intended tenant-scoped delete capability for office roles and improve dark-theme contrast for calendar view tabs.

## Dependencies

- Existing leads RLS and membership role contract.
- Existing job and protected call-record foreign keys remain authoritative.
- Hosted Supabase migration application is a release dependency.

## Allowed files

- `src/app/actions/intake.ts`
- `src/app/globals.css`
- `supabase/migrations/202610170001_lead_delete_permissions.sql`
- `supabase/tests/intake_isolation.sql`
- `tests/intake.test.ts`
- `docs/project/tasks/CEV-INTAKE-133A.md`
- `docs/project/handoffs/CEV-INTAKE-133A-morgan.md`

## Acceptance criteria

1. Owner, admin, and dispatcher can delete a lead within their tenant after the migration is applied.
2. Cross-tenant and read-only users remain denied by membership and RLS.
3. Leads linked to protected records return a clear safe message and are not partially removed.
4. Calendar year/month/week/day/hour tabs have readable inactive, hover, and active states on the dark theme.
5. Typecheck, lint, focused tests, and production build are run and recorded.

## Release gate

This change is not deployed until the hosted migration is applied and the owner explicitly approves the resulting release.
