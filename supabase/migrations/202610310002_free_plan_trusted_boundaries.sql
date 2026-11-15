begin;

-- Preserve the already-reviewed commands behind private-to-call legacy names,
-- then expose plan-aware wrappers under the existing RPC signatures.
alter function public.create_reactivation_campaign(jsonb)
  rename to create_reactivation_campaign_without_plan_guard;
alter function public.review_reactivation_candidate(jsonb)
  rename to review_reactivation_candidate_without_plan_guard;
alter function public.schedule_reactivation_visit(uuid,uuid,date,timestamptz,timestamptz)
  rename to schedule_reactivation_visit_without_plan_guard;

alter function public.create_reactivation_campaign_without_plan_guard(jsonb)
  set schema reactivation_private;
alter function public.review_reactivation_candidate_without_plan_guard(jsonb)
  set schema reactivation_private;
alter function public.schedule_reactivation_visit_without_plan_guard(uuid,uuid,date,timestamptz,timestamptz)
  set schema reactivation_private;

revoke all on function reactivation_private.create_reactivation_campaign_without_plan_guard(jsonb)
  from public, anon, authenticated, service_role;
revoke all on function reactivation_private.review_reactivation_candidate_without_plan_guard(jsonb)
  from public, anon, authenticated, service_role;
revoke all on function reactivation_private.schedule_reactivation_visit_without_plan_guard(uuid,uuid,date,timestamptz,timestamptz)
  from public, anon, authenticated, service_role;

create or replace function public.create_reactivation_campaign(input jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid;
  target_tenant_id uuid;
  tenant_plan public.workspace_plan;
begin
  select actor into actor_id from onboarding_private.current_identity();
  if actor_id is null or input is null then
    raise exception 'Reactivation command is unavailable.' using errcode = '42501';
  end if;
  target_tenant_id := onboarding_private.input_uuid(input->'tenant_id', 'tenant_id');
  if not public.has_reactivation_office_access(target_tenant_id) then
    raise exception 'Reactivation command is unavailable.' using errcode = '42501';
  end if;
  select plan into tenant_plan from public.tenants where id = target_tenant_id;
  if tenant_plan is null or tenant_plan = 'free' then
    raise exception 'Reactivation command is unavailable.' using errcode = '42501';
  end if;
  return reactivation_private.create_reactivation_campaign_without_plan_guard(input);
end;
$$;

create or replace function public.review_reactivation_candidate(input jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid;
  target_tenant_id uuid;
  tenant_plan public.workspace_plan;
begin
  select actor into actor_id from onboarding_private.current_identity();
  if actor_id is null or input is null then
    raise exception 'Reactivation command is unavailable.' using errcode = '42501';
  end if;
  target_tenant_id := onboarding_private.input_uuid(input->'tenant_id', 'tenant_id');
  if not public.has_reactivation_office_access(target_tenant_id) then
    raise exception 'Reactivation command is unavailable.' using errcode = '42501';
  end if;
  select plan into tenant_plan from public.tenants where id = target_tenant_id;
  if tenant_plan is null or tenant_plan = 'free' then
    raise exception 'Reactivation command is unavailable.' using errcode = '42501';
  end if;
  return reactivation_private.review_reactivation_candidate_without_plan_guard(input);
end;
$$;

create or replace function public.schedule_reactivation_visit(
  target_tenant uuid,
  target_candidate uuid,
  target_date date,
  target_starts_at timestamptz,
  target_ends_at timestamptz
) returns table(job_id uuid, appointment_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid;
  tenant_plan public.workspace_plan;
begin
  select actor into actor_id from onboarding_private.current_identity();
  if actor_id is null or not public.has_reactivation_office_access(target_tenant) then
    raise exception 'Reactivation scheduling is unavailable.' using errcode = '42501';
  end if;
  select plan into tenant_plan from public.tenants where id = target_tenant;
  if tenant_plan is null or tenant_plan = 'free' then
    raise exception 'Reactivation scheduling is unavailable.' using errcode = '42501';
  end if;
  return query
    select * from reactivation_private.schedule_reactivation_visit_without_plan_guard(
      target_tenant, target_candidate, target_date, target_starts_at, target_ends_at
    );
end;
$$;

-- Direct PostgREST table writes must obey the entitlement boundary too.
create function public.enforce_free_plan_automation_control()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  tenant_plan public.workspace_plan;
begin
  select plan into tenant_plan
  from public.tenants
  where id = new.tenant_id
  for update;
  if tenant_plan is null or tenant_plan = 'free' then
    raise exception using errcode = 'P0001', message = 'free_plan_automation_restricted';
  end if;
  return new;
end;
$$;

create trigger enforce_workspace_automation_controls_free_plan
before insert or update on public.workspace_automation_controls
for each row execute function public.enforce_free_plan_automation_control();

alter function public.retell_mapping_register(uuid,uuid,text)
  rename to retell_mapping_register_without_plan_guard;
alter function public.retell_mapping_pause(uuid,uuid)
  rename to retell_mapping_pause_without_plan_guard;

alter function public.retell_mapping_register_without_plan_guard(uuid,uuid,text)
  set schema integration_private;
alter function public.retell_mapping_pause_without_plan_guard(uuid,uuid)
  set schema integration_private;

revoke all on function integration_private.retell_mapping_register_without_plan_guard(uuid,uuid,text)
  from public, anon, authenticated, service_role;
revoke all on function integration_private.retell_mapping_pause_without_plan_guard(uuid,uuid)
  from public, anon, authenticated, service_role;

create or replace function public.retell_mapping_register(
  p_tenant_id uuid,
  p_connection_id uuid,
  p_provider_account_id text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid;
  tenant_plan public.workspace_plan;
begin
  select actor into actor_id from onboarding_private.current_identity();
  if actor_id is null
     or not integration_private.retell_mapping_operator_authorized(actor_id, p_tenant_id) then
    return '{"status":"unavailable"}'::jsonb;
  end if;
  select plan into tenant_plan from public.tenants where id = p_tenant_id;
  if tenant_plan is null or tenant_plan = 'free' then
    return '{"status":"unavailable"}'::jsonb;
  end if;
  return integration_private.retell_mapping_register_without_plan_guard(
    p_tenant_id, p_connection_id, p_provider_account_id
  );
end;
$$;

create or replace function public.retell_mapping_pause(
  p_tenant_id uuid,
  p_connection_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid;
  tenant_plan public.workspace_plan;
begin
  select actor into actor_id from onboarding_private.current_identity();
  if actor_id is null
     or not integration_private.retell_mapping_operator_authorized(actor_id, p_tenant_id) then
    return '{"status":"unavailable"}'::jsonb;
  end if;
  select plan into tenant_plan from public.tenants where id = p_tenant_id;
  if tenant_plan is null or tenant_plan = 'free' then
    return '{"status":"unavailable"}'::jsonb;
  end if;
  return integration_private.retell_mapping_pause_without_plan_guard(p_tenant_id, p_connection_id);
end;
$$;

alter function public.create_reactivation_campaign(jsonb) owner to postgres;
alter function public.review_reactivation_candidate(jsonb) owner to postgres;
alter function public.schedule_reactivation_visit(uuid,uuid,date,timestamptz,timestamptz) owner to postgres;
alter function public.enforce_free_plan_automation_control() owner to postgres;
alter function public.retell_mapping_register(uuid,uuid,text) owner to postgres;
alter function public.retell_mapping_pause(uuid,uuid) owner to postgres;

revoke all on function public.create_reactivation_campaign(jsonb) from public, anon, authenticated, service_role;
revoke all on function public.review_reactivation_candidate(jsonb) from public, anon, authenticated, service_role;
revoke all on function public.schedule_reactivation_visit(uuid,uuid,date,timestamptz,timestamptz) from public, anon, authenticated, service_role;
revoke all on function public.enforce_free_plan_automation_control() from public, anon, authenticated, service_role;
revoke all on function public.retell_mapping_register(uuid,uuid,text) from public, anon, authenticated, service_role;
revoke all on function public.retell_mapping_pause(uuid,uuid) from public, anon, authenticated, service_role;

grant execute on function public.create_reactivation_campaign(jsonb) to authenticated;
grant execute on function public.review_reactivation_candidate(jsonb) to authenticated;
grant execute on function public.schedule_reactivation_visit(uuid,uuid,date,timestamptz,timestamptz) to authenticated;
grant execute on function public.retell_mapping_register(uuid,uuid,text) to authenticated;
grant execute on function public.retell_mapping_pause(uuid,uuid) to authenticated;

commit;
