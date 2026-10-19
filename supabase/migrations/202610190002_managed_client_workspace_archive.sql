-- CEV-MANAGED-CLIENT-133A: owner-controlled client workspace removal.
-- Removal is an auditable archive so onboarding, call, and payment history is retained.
begin;

create or replace function public.archive_managed_client_workspace(input jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 actor_id uuid;
 operator_id uuid;
 target uuid;
 confirmation text;
begin
 select actor into actor_id from onboarding_private.current_identity();
 if actor_id is null then return '{"status":"unavailable"}'; end if;
 if input is null or jsonb_typeof(input)<>'object' then return '{"status":"validation_error"}'; end if;
 begin
  operator_id:=onboarding_private.input_uuid(input->'operator_tenant_id','operator_tenant_id');
  target:=onboarding_private.input_uuid(input->'client_tenant_id','client_tenant_id');
  confirmation:=onboarding_private.input_text(input->'confirmation',1,32,'confirmation');
 exception when others then return '{"status":"validation_error"}'; end;
 if confirmation <> 'DELETE WORKSPACE' then return '{"status":"validation_error"}'; end if;
 perform pg_advisory_xact_lock(hashtextextended('managed-client-archive-v1:'||operator_id||':'||target,0));
 if not exists(select 1 from public.tenants where id=operator_id and account_type='internal' for share) then return '{"status":"unavailable"}'; end if;
 if not exists(select 1 from public.memberships where tenant_id=operator_id and user_id=actor_id and role in ('owner','admin') for share) then return '{"status":"unavailable"}'; end if;
 if not exists(select 1 from public.managed_client_workspaces where operator_tenant_id=operator_id and client_tenant_id=target and status<>'archived' for update) then return '{"status":"unavailable"}'; end if;
 update public.managed_client_workspaces set status='archived' where operator_tenant_id=operator_id and client_tenant_id=target;
 -- The internal operator's owner membership was created for support access. Remove it
 -- so archived workspaces cannot be reopened by a stale internal URL.
 delete from public.memberships where tenant_id=target and user_id=actor_id;
 insert into public.audit_events(tenant_id,actor_user_id,entity_type,entity_id,action)
 values(operator_id,actor_id,'managed_client_workspaces',target,'UPDATE');
 return '{"status":"archived"}';
exception when others then return '{"status":"retryable_failure"}';
end; $$;

alter function public.archive_managed_client_workspace(jsonb) owner to postgres;
revoke all on function public.archive_managed_client_workspace(jsonb) from public,anon,authenticated;
grant execute on function public.archive_managed_client_workspace(jsonb) to authenticated;

commit;
