begin;

create schema if not exists free_tool_private;
revoke all on schema free_tool_private from public, anon, authenticated;

-- Current free workspaces are safe to classify because the plan migration placed all
-- older tenants on managed_receptionist and there is no supported downgrade path.
-- A receipt already upgraded before this migration remains null because its original
-- plan cannot be reconstructed safely from current state.
alter table onboarding_private.workspace_provision_receipts
  add column origin_plan public.workspace_plan;

update onboarding_private.workspace_provision_receipts receipt
set origin_plan = 'free'
from public.tenants tenant
where tenant.id = receipt.tenant_id
  and tenant.plan = 'free';

create function onboarding_private.capture_workspace_provision_origin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  tenant_plan public.workspace_plan;
begin
  select t.plan into tenant_plan
  from public.tenants t
  where t.id = new.tenant_id;

  if tenant_plan is null then
    raise exception using errcode = '23503', message = 'workspace_origin_unavailable';
  end if;
  if new.origin_plan is not null and new.origin_plan <> tenant_plan then
    raise exception using errcode = '23514', message = 'workspace_origin_mismatch';
  end if;

  new.origin_plan := tenant_plan;
  return new;
end;
$$;

create trigger capture_workspace_provision_origin
before insert on onboarding_private.workspace_provision_receipts
for each row execute function onboarding_private.capture_workspace_provision_origin();

create function onboarding_private.protect_workspace_provision_origin()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.origin_plan is not null and new.origin_plan is distinct from old.origin_plan then
    raise exception using errcode = '55000', message = 'workspace_origin_immutable';
  end if;
  return new;
end;
$$;

create trigger protect_workspace_provision_origin
before update of origin_plan on onboarding_private.workspace_provision_receipts
for each row execute function onboarding_private.protect_workspace_provision_origin();

alter function onboarding_private.capture_workspace_provision_origin() owner to postgres;
alter function onboarding_private.protect_workspace_provision_origin() owner to postgres;
revoke all on function onboarding_private.capture_workspace_provision_origin(),
  onboarding_private.protect_workspace_provision_origin() from public, anon, authenticated;

create table free_tool_private.owner_activity (
  provision_receipt_id uuid primary key references onboarding_private.workspace_provision_receipts(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  last_opened_at timestamptz not null,
  check (isfinite(last_opened_at))
);

create unique index free_tool_owner_activity_tenant_owner_idx
  on free_tool_private.owner_activity(tenant_id, owner_user_id);

alter table free_tool_private.owner_activity enable row level security;
revoke all on free_tool_private.owner_activity from public, anon, authenticated;

create function public.record_free_tool_open(p_tenant_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid;
  receipt_id uuid;
  affected integer;
begin
  select identity.actor into actor_id
  from onboarding_private.current_identity() identity;

  if actor_id is null or p_tenant_id is null then return false; end if;

  select r.id into receipt_id
  from onboarding_private.workspace_provision_receipts r
  join public.tenants t
    on t.id = r.tenant_id
   and t.plan = 'free'
  join public.memberships m
    on m.tenant_id = r.tenant_id
   and m.user_id = r.actor_user_id
   and m.role = 'owner'
  where r.tenant_id = p_tenant_id
    and r.actor_user_id = actor_id
    and r.origin_plan = 'free';

  if receipt_id is null then return false; end if;

  insert into free_tool_private.owner_activity(
    provision_receipt_id, tenant_id, owner_user_id, last_opened_at
  ) values (
    receipt_id, p_tenant_id, actor_id, clock_timestamp()
  )
  on conflict (provision_receipt_id) do update
    set last_opened_at = excluded.last_opened_at
    where free_tool_private.owner_activity.last_opened_at
      <= clock_timestamp() - interval '15 minutes';

  get diagnostics affected = row_count;
  return affected = 1;
end;
$$;

create function public.list_free_tool_users(
  p_operator_tenant_id uuid,
  p_offset integer default 0
)
returns table (
  workspace_id uuid,
  workspace_name text,
  email text,
  signed_up_at timestamptz,
  last_opened_at timestamptz,
  last_tool_activity_at timestamptz,
  tools_used text[],
  plan public.workspace_plan
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid;
begin
  select identity.actor into actor_id
  from onboarding_private.current_identity() identity;

  if actor_id is null
    or p_operator_tenant_id is null
    or p_offset is null
    or p_offset < 0
    or p_offset > 1000000
    or not exists (
      select 1
      from public.tenants operator_tenant
      join public.memberships operator_membership
        on operator_membership.tenant_id = operator_tenant.id
       and operator_membership.user_id = actor_id
       and operator_membership.role in ('owner', 'admin')
      where operator_tenant.id = p_operator_tenant_id
        and operator_tenant.account_type = 'internal'
    )
  then
    raise exception using errcode = '42501', message = 'free_tool_users_unavailable';
  end if;

  return query
  select
    tenant.id,
    tenant.name,
    lower(btrim(owner_user.email)),
    receipt.created_at,
    activity.last_opened_at,
    tool_activity.last_tool_activity_at,
    coalesce(tool_activity.tools_used, array[]::text[]),
    tenant.plan
  from onboarding_private.workspace_provision_receipts receipt
  join public.tenants tenant on tenant.id = receipt.tenant_id
  join public.memberships owner_membership
    on owner_membership.tenant_id = receipt.tenant_id
   and owner_membership.user_id = receipt.actor_user_id
   and owner_membership.role = 'owner'
  join auth.users owner_user
    on owner_user.id = receipt.actor_user_id
   and owner_user.email_confirmed_at is not null
   and owner_user.deleted_at is null
   and owner_user.email is not null
  left join free_tool_private.owner_activity activity
    on activity.provision_receipt_id = receipt.id
  left join lateral (
    select
      max(event.created_at) as last_tool_activity_at,
      array_agg(distinct case
        when event.entity_type in ('customers', 'contacts', 'service_locations', 'equipment') then 'crm'
        when event.entity_type = 'leads' then 'leads'
        when event.entity_type = 'jobs' then 'jobs'
        when event.entity_type = 'appointments' then 'calendar'
        when event.entity_type in ('technician_roster', 'technician_profiles') then 'technicians'
        when event.entity_type in (
          'tenant_business_profiles', 'tenant_services', 'tenant_hours_days',
          'tenant_hours_exceptions', 'tenant_booking_preferences',
          'tenant_escalation_contacts'
        ) then 'setup'
      end order by case
        when event.entity_type in ('customers', 'contacts', 'service_locations', 'equipment') then 'crm'
        when event.entity_type = 'leads' then 'leads'
        when event.entity_type = 'jobs' then 'jobs'
        when event.entity_type = 'appointments' then 'calendar'
        when event.entity_type in ('technician_roster', 'technician_profiles') then 'technicians'
        when event.entity_type in (
          'tenant_business_profiles', 'tenant_services', 'tenant_hours_days',
          'tenant_hours_exceptions', 'tenant_booking_preferences',
          'tenant_escalation_contacts'
        ) then 'setup'
      end) filter (where event.entity_type in (
        'customers', 'contacts', 'service_locations', 'equipment', 'leads', 'jobs',
        'appointments', 'technician_roster', 'technician_profiles',
        'tenant_business_profiles', 'tenant_services', 'tenant_hours_days',
        'tenant_hours_exceptions', 'tenant_booking_preferences',
        'tenant_escalation_contacts'
      )) as tools_used
    from public.audit_events event
    where event.tenant_id = receipt.tenant_id
      and event.actor_user_id = receipt.actor_user_id
      and event.created_at >= receipt.created_at
      and event.entity_type in (
        'customers', 'contacts', 'service_locations', 'equipment', 'leads', 'jobs',
        'appointments', 'technician_roster', 'technician_profiles',
        'tenant_business_profiles', 'tenant_services', 'tenant_hours_days',
        'tenant_hours_exceptions', 'tenant_booking_preferences',
        'tenant_escalation_contacts'
      )
  ) tool_activity on true
  where receipt.origin_plan = 'free'
  order by receipt.created_at desc, tenant.id desc
  limit 51 offset p_offset;
end;
$$;

alter function public.record_free_tool_open(uuid) owner to postgres;
alter function public.list_free_tool_users(uuid, integer) owner to postgres;
revoke all on function public.record_free_tool_open(uuid),
  public.list_free_tool_users(uuid, integer) from public, anon, authenticated;
grant execute on function public.record_free_tool_open(uuid) to authenticated;
grant execute on function public.list_free_tool_users(uuid, integer) to authenticated;

commit;
