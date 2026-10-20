begin;

-- The integration_private schema is intentionally not exposed through the
-- Supabase Data API. These tightly-scoped service-role RPCs let the server
-- action manage mappings without exposing the private table to app users.
create or replace function public.retell_mapping_register(
  p_tenant_id uuid,
  p_connection_id uuid,
  p_provider_account_id text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, integration_private
as $$
declare
  existing integration_private.retell_connections%rowtype;
begin
  if p_tenant_id is null or p_connection_id is null or p_provider_account_id is null
     or p_provider_account_id !~ '^agent_[A-Za-z0-9_-]{1,128}$' then
    return jsonb_build_object('status', 'invalid_agent');
  end if;

  select * into existing
  from integration_private.retell_connections
  where connection_id = p_connection_id
    and provider_account_id = p_provider_account_id;

  if existing.id is not null and existing.tenant_id <> p_tenant_id then
    return jsonb_build_object('status', 'conflict');
  end if;
  if existing.id is not null and existing.enabled then
    return jsonb_build_object('status', 'already_mapped', 'agent_id', p_provider_account_id);
  end if;

  insert into integration_private.retell_connections (tenant_id, connection_id, provider_account_id, enabled)
  values (p_tenant_id, p_connection_id, p_provider_account_id, true)
  on conflict (connection_id, provider_account_id)
  do update set tenant_id = excluded.tenant_id, enabled = true, updated_at = now();

  return jsonb_build_object('status', 'mapped', 'agent_id', p_provider_account_id);
end;
$$;

create or replace function public.retell_mapping_health(
  p_tenant_id uuid,
  p_connection_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, integration_private
as $$
begin
  if exists (
    select 1 from integration_private.retell_connections
    where tenant_id = p_tenant_id and connection_id = p_connection_id and enabled
  ) then
    return jsonb_build_object('status', 'active');
  end if;
  if exists (
    select 1 from integration_private.retell_connections
    where tenant_id = p_tenant_id and connection_id = p_connection_id
  ) then
    return jsonb_build_object('status', 'paused');
  end if;
  return jsonb_build_object('status', 'not_mapped');
end;
$$;

create or replace function public.retell_mapping_pause(
  p_tenant_id uuid,
  p_connection_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, integration_private
as $$
declare
  changed integer;
begin
  update integration_private.retell_connections
  set enabled = false, updated_at = now()
  where tenant_id = p_tenant_id and connection_id = p_connection_id and enabled;
  get diagnostics changed = row_count;
  return jsonb_build_object('status', case when changed > 0 then 'paused' else 'not_mapped' end);
end;
$$;

alter function public.retell_mapping_register(uuid, uuid, text) owner to postgres;
alter function public.retell_mapping_health(uuid, uuid) owner to postgres;
alter function public.retell_mapping_pause(uuid, uuid) owner to postgres;
revoke all on function public.retell_mapping_register(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.retell_mapping_health(uuid, uuid) from public, anon, authenticated;
revoke all on function public.retell_mapping_pause(uuid, uuid) from public, anon, authenticated;
grant execute on function public.retell_mapping_register(uuid, uuid, text) to service_role;
grant execute on function public.retell_mapping_health(uuid, uuid) to service_role;
grant execute on function public.retell_mapping_pause(uuid, uuid) to service_role;

commit;
