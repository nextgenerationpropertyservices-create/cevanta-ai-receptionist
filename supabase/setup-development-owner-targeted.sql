-- Cevanta DEVELOPMENT SQL Editor only. Never save your filled email in this repository.
-- Replace the placeholder below privately with the EMAIL used to sign in to Cevanta.
-- If an email contains an apostrophe, double it inside this SQL string.
begin;
do $$
declare
  target_email constant text := 'jennherrick7@gmail.com';
  account_id uuid;
  confirmed_at timestamptz;
  demo_tenant constant uuid := '10000000-0000-4000-8000-000000000001';
begin
  if target_email = 'jennherrick7@gmail.com' or btrim(target_email) = '' then
    raise exception 'Replace the email placeholder privately in the SQL Editor before running.';
  end if;
  begin
    select id, email_confirmed_at into strict account_id, confirmed_at
      from auth.users where lower(email) = lower(btrim(target_email));
  exception
    when no_data_found or too_many_rows then
      raise exception 'Expected one matching Auth account. Check the sign-in email and Supabase project. No changes made.';
  end;
  if confirmed_at is null then
    raise exception 'Confirm this Auth account first. No changes made.';
  end if;
  -- Serialize this provisioning flow for the demo workspace.
  perform 1 from public.tenants where id=demo_tenant and name='Cevanta Demo HVAC' for update;
  if not found then
    raise exception 'Expected the fictional Cevanta demo workspace. No changes made.';
  end if;
  if exists(select 1 from public.memberships where tenant_id=demo_tenant and user_id=account_id and role<>'owner') then
    raise exception 'Existing non-owner membership found. Automatic role promotion is not allowed.';
  end if;
  if exists(select 1 from public.memberships where tenant_id=demo_tenant and role='owner' and user_id<>account_id) then
    raise exception 'A different workspace owner already exists. No changes made.';
  end if;
  insert into public.memberships(tenant_id,user_id,role)
    values(demo_tenant,account_id,'owner') on conflict(tenant_id,user_id) do nothing;
  if not exists(select 1 from public.memberships where tenant_id=demo_tenant and user_id=account_id and role='owner') then
    raise exception 'Owner membership was not created. No changes made.';
  end if;
end $$;
commit;

