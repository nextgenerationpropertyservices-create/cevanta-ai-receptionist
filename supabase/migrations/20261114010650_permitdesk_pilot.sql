begin;

create function public.permit_workspace_operational(target uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select public.has_tenant_role(target,array['owner','admin','dispatcher']::public.app_role[])
 and not exists(select 1 from public.managed_client_workspaces where client_tenant_id=target and status in ('paused','archived'));
$$;
revoke all on function public.permit_workspace_operational(uuid) from public,anon,authenticated;
grant execute on function public.permit_workspace_operational(uuid) to authenticated;
create policy permit_managed_workspace_operational on public.permit_workspace_access
 as restrictive for select to authenticated using (public.permit_workspace_operational(tenant_id));

create table public.permit_pilot_feedback (
 id uuid not null,
 tenant_id uuid not null references public.tenants(id) on delete cascade,
 category text not null check (category in ('What worked','Issue or friction','Suggestion','End-of-pilot review')),
 rating smallint check (rating between 1 and 5),
 message text not null check (length(btrim(message)) between 1 and 3000),
 review text not null default '' check (length(review)<=1500),
 allow_quote boolean not null default false check (not allow_quote or btrim(review)<>''),
 created_at timestamptz not null default now(),
 primary key (tenant_id,id)
);
create index permit_pilot_feedback_recent on public.permit_pilot_feedback(tenant_id,created_at desc);
alter table public.permit_pilot_feedback enable row level security;
revoke all on public.permit_pilot_feedback from public,anon,authenticated;
create trigger audit_change after insert on public.permit_pilot_feedback for each row execute function public.record_audit_event();

create function public.permit_pilot_overview(operator_id uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not public.has_tenant_role(operator_id,array['owner','admin']::public.app_role[])
 or not exists(select 1 from public.tenants where id=operator_id and account_type='internal') then
   raise insufficient_privilege;
 end if;
 return jsonb_build_object(
  'workspaces', coalesce((
    select jsonb_agg(row_data order by row_data->>'name', row_data->>'id')
    from (
      select jsonb_build_object('id',t.id,'name',t.name,'enabled',coalesce(a.enabled,false),
        'expires_at',a.expires_at,'expired',coalesce(a.expires_at<=now(),false),
        'status',m.status,'permitdesk_only',t.permitdesk_only) row_data
      from public.managed_client_workspaces m
      join public.tenants t on t.id=m.client_tenant_id and t.account_type='client'
      left join public.permit_workspace_access a on a.tenant_id=t.id
      where m.operator_tenant_id=operator_id
    ) workspaces
  ),'[]'::jsonb),
  'feedback', coalesce((
    select jsonb_agg(to_jsonb(feedback) order by feedback.created_at desc, feedback.id desc)
    from (
      select f.id,t.name,f.category,f.rating,f.message,f.review,f.allow_quote,f.created_at
      from public.permit_pilot_feedback f
      join public.managed_client_workspaces m on m.client_tenant_id=f.tenant_id
      join public.tenants t on t.id=f.tenant_id and t.account_type='client'
      where m.operator_tenant_id=operator_id
      order by f.created_at desc, f.id desc limit 100
    ) feedback
  ),'[]'::jsonb)
 );
end; $$;

create function public.set_permit_pilot_access(operator_id uuid, client_id uuid, enable_access boolean, end_at timestamptz, permits_only boolean)
returns void language plpgsql security definer set search_path='' as $$
declare client_status text;
begin
 if not public.has_tenant_role(operator_id,array['owner','admin']::public.app_role[])
 or not exists(select 1 from public.tenants where id=operator_id and account_type='internal') then
   raise insufficient_privilege;
 end if;
 select m.status into client_status from public.managed_client_workspaces m
 join public.tenants t on t.id=m.client_tenant_id and t.account_type='client'
 where m.operator_tenant_id=operator_id and m.client_tenant_id=client_id
 for update of m,t;
 if not found then raise insufficient_privilege; end if;
 if enable_access is null or permits_only is null or
    (enable_access and (client_status in ('archived','paused') or end_at is null or not isfinite(end_at) or end_at<=now()))
 then raise invalid_parameter_value; end if;
 insert into public.permit_workspace_access (tenant_id,enabled,expires_at)
 values (client_id,enable_access,end_at)
 on conflict (tenant_id) do update set enabled=excluded.enabled,
  expires_at=case when excluded.enabled then excluded.expires_at else public.permit_workspace_access.expires_at end
 where (public.permit_workspace_access.enabled,public.permit_workspace_access.expires_at) is distinct from
  (excluded.enabled,case when excluded.enabled then excluded.expires_at else public.permit_workspace_access.expires_at end);
 if found then
  insert into public.audit_events(tenant_id,actor_user_id,entity_type,entity_id,action)
  values(client_id,auth.uid(),'permit_workspace_access',client_id,'UPDATE');
 end if;
 if enable_access then
  update public.tenants set permitdesk_only=permits_only where id=client_id and permitdesk_only is distinct from permits_only;
 end if;
end; $$;

create function public.submit_permit_pilot_feedback(target uuid, feedback_id uuid, feedback_category text, feedback_rating smallint, feedback_message text, feedback_review text, quote_permission boolean)
returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.permit_workspace_operational(target)
 or not exists(
  select 1 from public.permit_workspace_access a join public.tenants t on t.id=a.tenant_id
  where a.tenant_id=target and t.account_type='client' and a.enabled and (a.expires_at is null or a.expires_at>now())
  for share of a
 ) then raise insufficient_privilege; end if;
 insert into public.permit_pilot_feedback(id,tenant_id,category,rating,message,review,allow_quote)
 values(feedback_id,target,feedback_category,feedback_rating,btrim(feedback_message),btrim(feedback_review),quote_permission)
 on conflict (tenant_id,id) do nothing;
end; $$;

revoke all on function public.permit_pilot_overview(uuid), public.set_permit_pilot_access(uuid,uuid,boolean,timestamptz,boolean),
 public.submit_permit_pilot_feedback(uuid,uuid,text,smallint,text,text,boolean) from public,anon,authenticated;
grant execute on function public.permit_pilot_overview(uuid), public.set_permit_pilot_access(uuid,uuid,boolean,timestamptz,boolean),
 public.submit_permit_pilot_feedback(uuid,uuid,text,smallint,text,text,boolean) to authenticated;

commit;
