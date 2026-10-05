# CEV-AUTH-RESET-70A — Supabase local password recovery redirect configuration

Status: accepted with limitations as hosted configuration evidence
Owner: Morgan — Product Manager and Orchestrator
Date: 2026-10-05

## Scope

Fix the hosted Supabase Auth URL configuration so the local Cevanta password recovery flow can redirect to the app's recovery callback while testing locally.

## Change made

Added this Redirect URL in Supabase Auth URL Configuration for project `rafiksklbrfgefkypvkn`:

```text
http://127.0.0.1:3000/auth/recovery
```

The Site URL remained:

```text
http://localhost:3000
```

## Dependencies

- User reported password reset email link would not open locally.
- App recovery action sends Supabase password recovery redirects to `http://127.0.0.1:3000/auth/recovery` in development.
- Supabase Auth requires `redirectTo` URLs to be listed in allowed Redirect URLs.

## Allowed files

- `docs/project/tasks/CEV-AUTH-RESET-70A.md`
- `docs/project/handoffs/CEV-AUTH-RESET-70A-morgan.md`
- `docs/project/PROJECT_STATUS.md`
- `docs/project/FIRST_CLIENT_EVIDENCE_TRACKER.md`
- `docs/project/BACKLOG.md`
- `context/NEXT_TASK.md`
- `docs/project/supabase-auth-redirect-url-2026-10-05.png`

## Out of scope

- Changing passwords for the owner
- Reading emails or reset tokens
- Sending test reset emails from the agent
- Changing production deployment settings
- Changing database data, RLS, memberships, providers, SMS, email provider configuration, calendar, Retell, Make or Twilio settings

## Evidence

- Supabase URL Configuration page reloaded after save and still showed `http://127.0.0.1:3000/auth/recovery` under Redirect URLs with total URLs 1.
- Screenshot saved at `docs/project/supabase-auth-redirect-url-2026-10-05.png`.

## Acceptance decision

Accepted with limitations. The hosted Auth redirect allow-list now contains the local recovery callback URL. Actual password reset email delivery and successful password update remain owner-performed and not independently verified by Morgan.
