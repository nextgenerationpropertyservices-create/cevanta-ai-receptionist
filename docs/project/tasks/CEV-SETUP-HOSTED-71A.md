# CEV-SETUP-HOSTED-71A — Hosted Setup repair

Status: accepted with limitations as hosted development repair
Owner: Morgan — Product Manager and Orchestrator
Date: 2026-10-05

## Scope

Repair the hosted development Supabase Setup path so the local app can load, save and reload owner/admin business setup information against the hosted development project.

## Dependencies

- Hosted Supabase project `rafiksklbrfgefkypvkn`.
- Existing reviewed local migrations `202610020005_onboarding_setup.sql` and `202610020006_onboarding_commands.sql`.
- Existing owner membership for tenant `10000000-0000-4000-8000-000000000001`.
- Atlas and Quinn read-only reviews for the repair path.

## Allowed files

- `docs/project/tasks/CEV-SETUP-HOSTED-71A.md`
- `docs/project/handoffs/CEV-SETUP-HOSTED-71A-morgan.md`
- `docs/project/PROJECT_STATUS.md`
- `docs/project/FIRST_CLIENT_EVIDENCE_TRACKER.md`

## Acceptance criteria

- Hosted catalog shows onboarding storage tables and guarded public RPCs.
- Public onboarding RPCs are executable by `authenticated` and not by `anon`.
- Private onboarding helpers are not executable by `authenticated` or `anon`.
- Onboarding tables have RLS enabled.
- Owner Setup page loads instead of the safe unavailable state.
- Owner can save and reload fictional business setup details.
- Settings can save through the accepted onboarding-safe path.
- Wrong-workspace Setup access still fails safely.
- Full local checks pass after documentation updates.

## Evidence

- Pre-repair hosted catalog contained `public.tenants` and `public.memberships`, but none of the onboarding storage tables or six public onboarding RPCs.
- Applied the complete existing reviewed migration `202610020005_onboarding_setup.sql` in the hosted Supabase SQL editor. Supabase returned success.
- Applied the complete existing reviewed migration `202610020006_onboarding_commands.sql` in the hosted Supabase SQL editor. Supabase returned success.
- Hosted catalog verified all six public onboarding RPCs exist as `security definer`, owned by `postgres`, with `search_path=""`, `authenticated` execute permission and no `anon` execute permission.
- Hosted catalog verified onboarding private helpers are not executable by `authenticated` or `anon`.
- Hosted catalog verified RLS is enabled on onboarding storage tables.
- Owner browser Setup page loaded and rendered the business setup editors.
- Saved fictional business contact details: `Fictional Office Manager`, `office@example.invalid`, `+15550000002`.
- Fresh Setup tab reloaded those saved values from hosted Supabase.
- Settings page rendered the editable form and saved successfully.
- Direct wrong-workspace Setup navigation failed safely with the generic error page.
- Focused local tests passed, and the full check is recorded in the handoff after this task file update.
- `pnpm check` passed after documentation updates: typecheck, lint, 16 Vitest files with 711 passing tests, embedded PostgreSQL suites, onboarding command checks and production build.

## Limitations

- This repairs the hosted development project only.
- This does not deploy production, connect Retell, Make, Twilio, SMS, email or external calendar writes.
- This does not turn readiness, provider connection, live booking or production release flags to ready.
- Hosted direct JWT/PostgREST multi-role testing is still limited to catalog checks and owner browser evidence; full lower-role browser accounts remain a later task.

## Acceptance decision

Accepted with limitations. Setup and Settings are no longer blocked in the hosted development browser path, and the core self-service setup foundation is now usable for owner/admin configuration in development.
