-- Run in the new Cevanta DEVELOPMENT project's SQL Editor only.
-- Links its single confirmed Auth user to the fictional demo workspace.
-- Refuses ambiguous users and existing non-owner memberships; creates no public function.
begin;
do $$
declare
  account_id uuid;
  confirmed_at timestamptz;
  demo_tenant constant uuid := '10000000-0000-4000-8000-000000000001';
begin
  begin
    select id, email_confirmed_at into strict account_id, confirmed_at from auth.users;
  exception
    when no_data_found or too_many_rows then
      raise exception 'Expected exactly one Auth user. Stop and ask Codex for targeted membership instructions.';
  end;
  if confirmed_at is null then
    raise exception 'Confirm the Auth user first, then run this setup again.';
  end if;
  if not exists(select 1 from public.tenants where id=demo_tenant and name='Cevanta Demo HVAC') then
    raise exception 'Expected the fictional Cevanta demo workspace. No membership changes made.';
  end if;
  if exists(select 1 from public.memberships where tenant_id=demo_tenant and user_id=account_id and role<>'owner') then
    raise exception 'Existing non-owner membership found. Automatic role promotion is not allowed.';
  end if;
  if exists(select 1 from public.memberships where tenant_id=demo_tenant and role='owner' and user_id<>account_id) then
    raise exception 'A different workspace owner already exists. No membership changes made.';
  end if;
  insert into public.memberships(tenant_id,user_id,role)
  values(demo_tenant,account_id,'owner')
  on conflict(tenant_id,user_id) do nothing;
  if not exists(select 1 from public.memberships where tenant_id=demo_tenant and user_id=account_id and role='owner') then
    raise exception 'Owner membership was not created. No membership changes made.';
  end if;
end $$;
commit;
