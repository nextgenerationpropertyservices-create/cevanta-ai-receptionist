begin;

create table onboarding_private.self_service_operator (
  singleton bool primary key default true check (singleton),
  operator_tenant_id uuid not null references public.tenants(id) on delete cascade
);

create table onboarding_private.self_service_clients (
  client_tenant_id uuid primary key references public.tenants(id) on delete cascade,
  operator_tenant_id uuid not null references public.tenants(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (client_tenant_id <> operator_tenant_id)
);
create index self_service_clients_operator_idx
  on onboarding_private.self_service_clients(operator_tenant_id, created_at desc);

alter table onboarding_private.self_service_operator enable row level security;
alter table onboarding_private.self_service_clients enable row level security;
revoke all on onboarding_private.self_service_operator, onboarding_private.self_service_clients
  from public, anon, authenticated, service_role;

create function onboarding_private.enroll_self_service_client()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into onboarding_private.self_service_clients(client_tenant_id, operator_tenant_id)
  select new.tenant_id, operator.id
  from onboarding_private.self_service_operator config
  join public.tenants operator on operator.id = config.operator_tenant_id
  join public.tenants client on client.id = new.tenant_id
  where operator.account_type = 'internal' and client.account_type = 'client'
    and client.plan = 'free'
  on conflict (client_tenant_id) do nothing;
  return new;
end;
$$;
revoke all on function onboarding_private.enroll_self_service_client() from public, anon, authenticated, service_role;

-- Only the verified self-provision command inserts this receipt, in the same transaction.
create trigger enroll_self_service_client after insert on onboarding_private.workspace_provision_receipts
for each row execute function onboarding_private.enroll_self_service_client();

create function onboarding_private.require_self_service_operator(target uuid)
returns uuid language plpgsql stable security definer set search_path = '' as $$
declare actor_id uuid;
begin
  select actor into actor_id from onboarding_private.current_identity();
  if actor_id is null or not exists (
    select 1 from public.memberships m join public.tenants t on t.id = m.tenant_id
    where m.tenant_id = target and m.user_id = actor_id
      and m.role in ('owner', 'admin') and t.account_type = 'internal'
  ) then raise insufficient_privilege; end if;
  return actor_id;
end;
$$;
revoke all on function onboarding_private.require_self_service_operator(uuid) from public, anon, authenticated, service_role;

create function public.list_self_service_clients(operator_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  perform onboarding_private.require_self_service_operator(operator_id);
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', t.id, 'name', t.name, 'trade', t.trade, 'timezone', t.timezone,
      'dashboard_enabled', not t.permitdesk_only,
      'permitdesk_enabled', coalesce(a.enabled and (a.expires_at is null or a.expires_at > now()), false),
      'expires_at', a.expires_at, 'created_at', q.created_at
    ) order by q.created_at desc, t.id)
    from onboarding_private.self_service_clients q
    join public.tenants t on t.id = q.client_tenant_id and t.account_type = 'client'
    left join public.permit_workspace_access a on a.tenant_id = t.id
    where q.operator_tenant_id = operator_id
  ), '[]'::jsonb);
end;
$$;

create function public.set_self_service_client_access(
  operator_id uuid, client_id uuid, dashboard_enabled bool, permitdesk_enabled bool, end_at timestamptz
)
returns void language plpgsql security definer set search_path = '' as $$
declare actor_id uuid;
begin
  actor_id := onboarding_private.require_self_service_operator(operator_id);
  perform 1 from onboarding_private.self_service_clients q
  join public.tenants t on t.id = q.client_tenant_id and t.account_type = 'client'
  where q.operator_tenant_id = operator_id and q.client_tenant_id = client_id
  for update of q, t;
  if not found then raise insufficient_privilege; end if;

  if dashboard_enabled is null or permitdesk_enabled is null or (
    permitdesk_enabled and (end_at is null or not isfinite(end_at) or end_at <= now())
  ) then raise invalid_parameter_value; end if;

  insert into public.permit_workspace_access(tenant_id, enabled, expires_at)
  values (client_id, permitdesk_enabled, case when permitdesk_enabled then end_at end)
  on conflict (tenant_id) do update
  set enabled = excluded.enabled, expires_at = excluded.expires_at
  where (permit_workspace_access.enabled, permit_workspace_access.expires_at)
    is distinct from (excluded.enabled, excluded.expires_at);

  if found then
    insert into public.audit_events(tenant_id, actor_user_id, entity_type, entity_id, action)
    values (client_id, actor_id, 'permit_workspace_access', client_id, 'UPDATE');
  end if;

  update public.tenants set permitdesk_only = not dashboard_enabled
  where id = client_id and permitdesk_only = dashboard_enabled;
end;
$$;

revoke all on function public.list_self_service_clients(uuid),
  public.set_self_service_client_access(uuid, uuid, bool, bool, timestamptz)
  from public, anon, authenticated, service_role;
grant execute on function public.list_self_service_clients(uuid),
  public.set_self_service_client_access(uuid, uuid, bool, bool, timestamptz)
  to authenticated;

commit;
