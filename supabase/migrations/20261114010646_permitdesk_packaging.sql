begin;
alter table public.tenants add column permitdesk_only boolean not null default false;
alter table public.tenants add constraint permitdesk_only_client check (not permitdesk_only or account_type = 'client');

create function public.missed_call_available(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.tenants t
    join public.memberships m on m.tenant_id = t.id
    where t.id = target and m.user_id = (select auth.uid()) and not t.permitdesk_only
  );
$$;
revoke all on function public.missed_call_available(uuid) from public, anon;
grant execute on function public.missed_call_available(uuid) to authenticated;

do $$
declare relation text;
begin
  foreach relation in array array['customers','contacts','service_locations','equipment','leads','jobs','appointments','technician_profiles','technician_roster','workspace_automation_controls','tenant_setup_state','tenant_business_profiles','tenant_services','tenant_hours_days','tenant_hours_exceptions','tenant_booking_preferences','tenant_escalation_contacts','tenant_setup_resume'] loop
    execute format('create policy missed_call_product_access on public.%I as restrictive for all to authenticated using (public.missed_call_available(tenant_id)) with check (public.missed_call_available(tenant_id))', relation);
  end loop;
end $$;

create policy permit_job_requires_bundle on public.job_permits as restrictive for insert to authenticated
with check (job_id is null or public.missed_call_available(tenant_id));
-- Preserve the existing RPC contracts and apply the product check to their tenant-specific authorization.
do $$
declare
  signature text;
  original text;
  guarded text;
begin
  foreach signature in array array[
    'onboarding_configure(text,jsonb)', 'onboarding_save_resume(jsonb)',
    'onboarding_snapshot(uuid)', 'onboarding_history_list(jsonb)',
    'onboarding_history_reenable(jsonb)', 'manage_tenant_member(jsonb)',
    'get_tenant_team(uuid)', 'get_tenant_technicians(uuid)', 'link_technician_roster(jsonb)'
  ] loop
    original := pg_get_functiondef(('public.' || signature)::regprocedure);
    guarded := replace(original,'where tenant_id=target and user_id=actor_id',
      'where tenant_id=target and public.missed_call_available(target) and user_id=actor_id');
    guarded := replace(guarded,'if not public.has_tenant_role(target,',
      'if not public.missed_call_available(target) or not public.has_tenant_role(target,');
    if guarded = original then raise exception 'Missing product guard anchor: %', signature; end if;
    execute guarded;
  end loop;
end $$;
-- Ingress runs as a provider service, so membership-based RLS cannot guard it.
do $$
declare
  original text := pg_get_functiondef('public.ingest_retell_call_lead(jsonb)'::regprocedure);
  guarded text;
begin
  guarded := replace(original,
    'where connection_id=connection and provider_account_id=account and enabled;',
    'where connection_id=connection and provider_account_id=account and enabled and exists (select 1 from public.tenants t where t.id=retell_connections.tenant_id and not t.permitdesk_only);');
  if guarded = original then raise exception 'Missing Retell product guard anchor'; end if;
  execute guarded;
end $$;
commit;
