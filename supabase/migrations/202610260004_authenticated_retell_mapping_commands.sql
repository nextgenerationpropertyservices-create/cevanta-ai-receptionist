-- CEV-PROJECT-AUDIT-167T: authenticated, relationship-scoped Retell mapping commands.
-- These commands store an operator-verified mapping. They do not prove provider
-- ownership, publish an agent, configure a phone number, or observe live delivery.
begin;

create or replace function integration_private.retell_mapping_operator_authorized(
  p_actor_id uuid,
  p_client_tenant_id uuid
)
returns boolean
language sql
stable
set search_path = ''
as $$
  select p_actor_id is not null
    and p_client_tenant_id is not null
    and exists (
      select 1
      from public.managed_client_workspaces m
      join public.tenants operator_tenant
        on operator_tenant.id = m.operator_tenant_id
       and operator_tenant.account_type = 'internal'
      join public.tenants client_tenant
        on client_tenant.id = m.client_tenant_id
       and client_tenant.account_type = 'client'
      join public.memberships operator_membership
        on operator_membership.tenant_id = m.operator_tenant_id
       and operator_membership.user_id = p_actor_id
       and operator_membership.role in ('owner', 'admin')
      where m.client_tenant_id = p_client_tenant_id
        and m.status in ('onboarding', 'pilot', 'active')
    );
$$;

create or replace function integration_private.retell_mapping_health_authorized(
  p_actor_id uuid,
  p_client_tenant_id uuid
)
returns boolean
language sql
stable
set search_path = ''
as $$
  select case
    when p_actor_id is null or p_client_tenant_id is null then false
    -- Any Cevanta internal member is treated as an operator identity. That
    -- identity must use the active managed-client relationship and cannot
    -- bypass an archived relationship through a stale client membership.
    when exists (
      select 1
      from public.memberships internal_membership
      join public.tenants internal_tenant
        on internal_tenant.id = internal_membership.tenant_id
       and internal_tenant.account_type = 'internal'
      where internal_membership.user_id = p_actor_id
    ) then integration_private.retell_mapping_operator_authorized(p_actor_id, p_client_tenant_id)
    else exists (
      select 1
      from public.memberships client_membership
      join public.tenants client_tenant
        on client_tenant.id = client_membership.tenant_id
       and client_tenant.account_type = 'client'
      where client_membership.tenant_id = p_client_tenant_id
        and client_membership.user_id = p_actor_id
        and client_membership.role in ('owner', 'admin')
    )
  end;
$$;

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
  existing integration_private.retell_connections%rowtype;
begin
  select actor into actor_id from onboarding_private.current_identity();
  if actor_id is null then
    return '{"status":"unavailable"}'::jsonb;
  end if;

  -- Lock the authority rows so an archive or role removal cannot race the
  -- mapping mutation after authorization has been checked.
  perform 1
  from public.managed_client_workspaces m
  join public.tenants operator_tenant
    on operator_tenant.id = m.operator_tenant_id
   and operator_tenant.account_type = 'internal'
  join public.tenants client_tenant
    on client_tenant.id = m.client_tenant_id
   and client_tenant.account_type = 'client'
  join public.memberships operator_membership
    on operator_membership.tenant_id = m.operator_tenant_id
   and operator_membership.user_id = actor_id
   and operator_membership.role in ('owner', 'admin')
  where m.client_tenant_id = p_tenant_id
    and m.status in ('onboarding', 'pilot', 'active')
  for share of m, operator_tenant, client_tenant, operator_membership;
  if not found then
    return '{"status":"unavailable"}'::jsonb;
  end if;

  if p_connection_id is null or p_provider_account_id is null
     or p_provider_account_id !~ '^agent_[A-Za-z0-9_-]{1,128}$' then
    return '{"status":"invalid_agent"}'::jsonb;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(
    'retell-route-v2:' || p_tenant_id::text || ':' || p_connection_id::text,
    0
  ));
  perform pg_advisory_xact_lock(hashtextextended(
    'retell-agent-v2:' || p_connection_id::text || ':' || p_provider_account_id,
    0
  ));

  select * into existing
  from integration_private.retell_connections
  where connection_id = p_connection_id
    and provider_account_id = p_provider_account_id
  for update;

  if found and existing.tenant_id <> p_tenant_id then
    return '{"status":"conflict"}'::jsonb;
  end if;
  if found and existing.enabled then
    return '{"status":"already_mapped"}'::jsonb;
  end if;
  if found then
    update integration_private.retell_connections
    set enabled = true, updated_at = now()
    where id = existing.id;
  else
    insert into integration_private.retell_connections(
      tenant_id, connection_id, provider_account_id, enabled
    ) values (
      p_tenant_id, p_connection_id, p_provider_account_id, true
    );
  end if;

  return '{"status":"mapped"}'::jsonb;
exception when others then
  return '{"status":"unavailable"}'::jsonb;
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
  changed integer;
begin
  select actor into actor_id from onboarding_private.current_identity();
  if actor_id is null or p_connection_id is null then
    return '{"status":"unavailable"}'::jsonb;
  end if;

  perform 1
  from public.managed_client_workspaces m
  join public.tenants operator_tenant
    on operator_tenant.id = m.operator_tenant_id
   and operator_tenant.account_type = 'internal'
  join public.tenants client_tenant
    on client_tenant.id = m.client_tenant_id
   and client_tenant.account_type = 'client'
  join public.memberships operator_membership
    on operator_membership.tenant_id = m.operator_tenant_id
   and operator_membership.user_id = actor_id
   and operator_membership.role in ('owner', 'admin')
  where m.client_tenant_id = p_tenant_id
    and m.status in ('onboarding', 'pilot', 'active')
  for share of m, operator_tenant, client_tenant, operator_membership;
  if not found then
    return '{"status":"unavailable"}'::jsonb;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(
    'retell-route-v2:' || p_tenant_id::text || ':' || p_connection_id::text,
    0
  ));
  update integration_private.retell_connections
  set enabled = false, updated_at = now()
  where tenant_id = p_tenant_id
    and connection_id = p_connection_id
    and enabled;
  get diagnostics changed = row_count;
  return jsonb_build_object('status', case when changed > 0 then 'paused' else 'not_mapped' end);
exception when others then
  return '{"status":"unavailable"}'::jsonb;
end;
$$;

create or replace function public.retell_mapping_health(
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
  state text;
begin
  select actor into actor_id from onboarding_private.current_identity();
  if actor_id is null or p_connection_id is null
     or not integration_private.retell_mapping_health_authorized(actor_id, p_tenant_id) then
    return '{"status":"unavailable"}'::jsonb;
  end if;

  select case
    when count(*) filter (where enabled) > 0 then 'active'
    when count(*) > 0 then 'paused'
    else 'not_mapped'
  end into state
  from integration_private.retell_connections
  where tenant_id = p_tenant_id
    and connection_id = p_connection_id;

  return jsonb_build_object('status', state);
exception when others then
  return '{"status":"unavailable"}'::jsonb;
end;
$$;

alter function integration_private.retell_mapping_operator_authorized(uuid, uuid) owner to postgres;
alter function integration_private.retell_mapping_health_authorized(uuid, uuid) owner to postgres;
alter function public.retell_mapping_register(uuid, uuid, text) owner to postgres;
alter function public.retell_mapping_pause(uuid, uuid) owner to postgres;
alter function public.retell_mapping_health(uuid, uuid) owner to postgres;

revoke all on function integration_private.retell_mapping_operator_authorized(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function integration_private.retell_mapping_health_authorized(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.retell_mapping_register(uuid, uuid, text)
  from public, anon, authenticated, service_role;
revoke all on function public.retell_mapping_pause(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.retell_mapping_health(uuid, uuid)
  from public, anon, authenticated, service_role;

grant execute on function public.retell_mapping_register(uuid, uuid, text) to authenticated;
grant execute on function public.retell_mapping_pause(uuid, uuid) to authenticated;
grant execute on function public.retell_mapping_health(uuid, uuid) to authenticated;

comment on function public.retell_mapping_register(uuid, uuid, text) is
  'Stores a manually verified Retell agent-to-client route for an authorized Cevanta internal operator. It does not verify provider ownership, publish an agent, configure telephony, or prove live delivery.';
comment on function public.retell_mapping_pause(uuid, uuid) is
  'Pauses Cevanta ingestion for a manually verified route. It does not change Retell or phone-provider configuration.';
comment on function public.retell_mapping_health(uuid, uuid) is
  'Returns only active, paused, not_mapped, or unavailable for an authorized caller; no provider identifier or telemetry is exposed.';

commit;
