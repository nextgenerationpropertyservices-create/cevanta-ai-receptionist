# CEV-AUTH-MEMBER-70D — Existing Auth user demo owner membership

Status: accepted with limitations as hosted development access setup
Owner: Morgan — Product Manager and Orchestrator
Date: 2026-10-05

## Scope

Give an existing hosted Supabase Auth user owner access to the fictional Cevanta Demo HVAC workspace so the owner can sign in and test backend flows while Supabase email invitations are rate-limited.

## Change made

Supabase email invitation for `jhherrick80@gmail.com` failed with `email rate limit exceeded`. To continue testing without waiting for email delivery, Morgan provisioned the already-existing Auth user `nextgenerationpropertyservices@gmail.com` as owner of the demo tenant.

Inserted or confirmed this membership:

- tenant_id: `10000000-0000-4000-8000-000000000001`
- user_id: `dea739e1-2fb9-44a3-8605-b5b7565effb5`
- role: `owner`

## Evidence

Supabase SQL Editor returned one row with the expected tenant ID, user ID and role `owner`.

## Limitations

- This does not create or invite `jhherrick80@gmail.com`; Supabase email rate limit blocked that invite.
- The owner still needs to sign in with `nextgenerationpropertyservices@gmail.com` and its password or use Supabase dashboard reset once rate limit clears.
- Authenticated browser/backend journey testing remains pending until sign-in succeeds.

## Rollback

A trusted administrator can remove only this exact membership row if needed:

```sql
delete from public.memberships
where tenant_id = '10000000-0000-4000-8000-000000000001'::uuid
  and user_id = 'dea739e1-2fb9-44a3-8605-b5b7565effb5'::uuid;
```

## Acceptance decision

Accepted with limitations as development access setup. The existing Auth user now has demo owner membership; sign-in and backend flow testing are the next step.
