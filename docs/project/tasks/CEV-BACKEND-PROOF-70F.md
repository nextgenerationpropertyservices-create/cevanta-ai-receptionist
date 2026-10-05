# CEV-BACKEND-PROOF-70F — Owner browser proof pass

Status: accepted with limitations as browser proof
Owner: Morgan — Product Manager and Orchestrator
Date: 2026-10-05

## Scope

Prove the currently working local Cevanta app against the hosted development Supabase project using the signed-in owner browser session. Verify the first-client demo foundation: authenticated workspace access, persisted jobs/leads/calendar records, lead-to-job conversion, appointment creation, safe cross-tenant denial and setup/settings readiness limitations.

## Dependencies

- Existing owner Auth user membership from CEV-AUTH-MEMBER-70D.
- Local dev server running at `http://127.0.0.1:3000`.
- Hosted development Supabase project available.
- Fictional development data only.

## Allowed files

- `docs/project/tasks/CEV-BACKEND-PROOF-70F.md`
- `docs/project/handoffs/CEV-BACKEND-PROOF-70F-morgan.md`
- `docs/project/PROJECT_STATUS.md`
- `docs/project/FIRST_CLIENT_EVIDENCE_TRACKER.md`

## Acceptance criteria

- The owner workspace loads locally after sign-in.
- A saved job, a saved lead, lead detail, lead-to-job conversion and converted job can be observed.
- A calendar appointment can be created for the converted job and appears after reload.
- Direct navigation to a workspace without membership fails safely.
- Setup/settings readiness limitations are recorded honestly.
- Live provider, external send and production claims remain out of scope.

## Evidence

- Owner was signed in as Owner for `Cevanta Demo HVAC`.
- Jobs, leads, lead detail, conversion to job and calendar job selection were verified in CEV-BACKEND-BROWSER-70E.
- Calendar appointment `Fictional missed-call appointment test` was saved for Oct 6, 2026, 2:00 PM to 3:00 PM UTC and appeared after reload linked to job `0f167b9c-ff95-41a2-b3fd-059e45478e8d`.
- Direct navigation to `/workspaces/10000000-0000-4000-8000-000000000002` showed the generic safe error `We couldn’t open this page`; no second-tenant data was exposed.
- Workspace switcher showed only `Cevanta Demo HVAC`.
- Setup/Onboarding did not load the setup snapshot and showed `Setup is unavailable` with `We could not load setup information. Try again in a moment. Your saved information has not been changed.`
- Settings showed the saved business profile but blocked safe saving with `Settings cannot safely save right now...` because the workspace setup snapshot was unavailable.
- `pnpm check` passed after the proof record update: typecheck, lint, 16 Vitest files with 711 passing tests, embedded PostgreSQL suites, onboarding command checks and production build.

## Limitations

- This is owner-browser evidence, not independent Quinn review.
- Setup/onboarding and settings editing are blocked in the hosted development path until the onboarding snapshot/RPC path is repaired or refreshed.
- Retell, Make, Twilio, SMS, email, external calendar writes, hosted production, role-matrix browser testing and direct PostgREST/JWT bypass tests were not executed.
- Records used are fictional development data.

## Acceptance decision

Accepted with limitations. The core authenticated CRM/work/calendar foundation is proven enough for a managed-pilot sales demo with honest limitations. Setup/settings editing and live AI/provider behavior are not proven and remain blockers before a full sellable self-serve version or live pilot.
