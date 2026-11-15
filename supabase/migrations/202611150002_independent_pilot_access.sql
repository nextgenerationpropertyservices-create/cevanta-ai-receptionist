begin;

create or replace function public.set_permit_pilot_access(operator_id uuid, client_id uuid, enable_access boolean, end_at timestamptz, permits_only boolean)
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
 update public.tenants set permitdesk_only=permits_only where id=client_id and permitdesk_only is distinct from permits_only;
end; $$;

commit;
