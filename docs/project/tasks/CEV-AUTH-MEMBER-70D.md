# CEV-AUTH-MEMBER-70D — Existing Auth user demo owner membership

Status: accepted with limitations as hosted development access setup
Owner: Morgan — Product Manager and Orchestrator
Date: 2026-10-05

## Scope

Give an existing hosted Supabase Auth user owner access to the fictional Cevanta Demo HVAC workspace so the owner can sign in and test backend flows while Supabase email invitations are rate-limited.

## Change made

A Supabase test invitation failed with `email rate limit exceeded`. To continue testing without waiting for email delivery, Morgan provisioned an already-existing confirmed Auth account as owner of the demo tenant. Exact account identifiers remain only in the private provider console.

Inserted or confirmed this membership:

- tenant_id: `10000000-0000-4000-8000-000000000001`
- user_id: private provider-console record
- role: `owner`

## Evidence

Supabase SQL Editor returned one row with the expected tenant ID, user ID and role `owner`.

## Limitations

- This does not create the separately requested test account; the provider email rate limit blocked that invite.
- The owner still needs to sign in with the confirmed development account or use the provider dashboard reset flow once the rate limit clears.
- Authenticated browser/backend journey testing remains pending until sign-in succeeds.

## Rollback

A trusted administrator can remove only the exact development membership identified in the private provider console. Do not copy a real Auth user ID back into source control.

## Acceptance decision

Accepted with limitations as development access setup. The existing Auth user now has demo owner membership; sign-in and backend flow testing are the next step.
