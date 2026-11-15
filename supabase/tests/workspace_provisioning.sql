-- CEV-SELF-SERVE-73A. Fictional embedded provisioning checks, not live JWT proof.
begin;
alter table auth.users add column if not exists email_confirmed_at timestamptz;
alter table auth.users add column if not exists deleted_at timestamptz;

insert into auth.users(id,email,email_confirmed_at) values
 ('47000000-0000-4000-8001-000000000001','provision-1@example.invalid',now()),
 ('47000000-0000-4000-8001-000000000002','provision-2@example.invalid',now()),
 ('47000000-0000-4000-8001-000000000003','provision-3@example.invalid',null),
 ('47000000-0000-4000-8001-000000000004','provision-4@example.invalid',now()),
 ('47000000-0000-4000-8001-000000000005','provision-5@example.invalid',now());
update auth.users set deleted_at=now() where id='47000000-0000-4000-8001-000000000004';
insert into public.tenants(id,name,trade,timezone) values('47000000-0000-4000-8000-000000000099','Existing workspace','HVAC','America/New_York');
insert into public.memberships(tenant_id,user_id,role) values('47000000-0000-4000-8000-000000000099','47000000-0000-4000-8001-000000000005','owner');

do $$
declare request uuid:='47000000-0000-4000-8002-000000000001'; input jsonb; result jsonb; created_tenant_id uuid; before_tenants bigint; before_memberships bigint; before_audits bigint;
begin
 if (select count(*) from pg_proc p join pg_namespace s on s.oid=p.pronamespace join pg_roles r on r.oid=p.proowner where s.nspname='public' and p.proname='provision_owner_workspace' and p.prosecdef and r.rolname='postgres' and 'search_path=""'=any(p.proconfig) and has_function_privilege('authenticated',p.oid,'EXECUTE') and not has_function_privilege('anon',p.oid,'EXECUTE'))<>1 then raise exception 'Provision RPC ownership/search path/grants'; end if;
 if has_function_privilege('authenticated','onboarding_private.normalize_workspace_provision(jsonb)'::regprocedure,'EXECUTE') or has_function_privilege('anon','onboarding_private.normalize_workspace_provision(jsonb)'::regprocedure,'EXECUTE') then raise exception 'Private provision helper exposed'; end if;
 input:=jsonb_build_object('request_id',request,'name','Fictional HVAC Launch','trade','HVAC','timezone','America/New_York');
 perform set_config('request.jwt.claim.sub','47000000-0000-4000-8001-000000000001',true);
 set local role authenticated;
 result:=public.provision_owner_workspace(input);
 if result->>'status'<>'saved' then raise exception 'Provision failed: %',result; end if;
 created_tenant_id:=(result->'workspace'->>'id')::uuid;
 if result->'workspace'->>'name'<>'Fictional HVAC Launch' or created_tenant_id is null then raise exception 'Provision result shape'; end if;
 if not exists(select 1 from public.memberships where public.memberships.tenant_id=created_tenant_id and user_id='47000000-0000-4000-8001-000000000001' and role='owner') then raise exception 'Owner membership missing'; end if;
 if (select count(*) from public.audit_events where public.audit_events.tenant_id=created_tenant_id and entity_type='tenants')<>1 or (select count(*) from public.audit_events where public.audit_events.tenant_id=created_tenant_id and entity_type='memberships')<>1 then raise exception 'Provision audits missing'; end if;
 result:=public.provision_owner_workspace(input);
 if result->>'status'<>'replayed' or (result->'workspace'->>'id')::uuid<>created_tenant_id then raise exception 'Provision replay failed'; end if;
 result:=public.provision_owner_workspace(jsonb_set(input,'{name}','"Changed HVAC"'));
 if result->>'reason'<>'request_reuse' then raise exception 'Changed reuse not rejected: %',result; end if;
 result:=public.provision_owner_workspace(input||'{"role":"owner"}');
 if result->>'status'<>'validation_error' then raise exception 'Forged role not rejected'; end if;
 result:=public.provision_owner_workspace(jsonb_build_object('request_id',gen_random_uuid(),'name','Second Workspace','trade','HVAC','timezone','America/New_York'));
 if result->>'status'<>'unavailable' then raise exception 'Second workspace policy not enforced'; end if;
 reset role;

 perform set_config('request.jwt.claim.sub','47000000-0000-4000-8001-000000000002',true);
 set local role authenticated;
 result:=public.provision_owner_workspace(jsonb_build_object('request_id',gen_random_uuid(),'name','Bad timezone','trade','HVAC','timezone','Mars/Base'));
 if result->>'status'<>'validation_error' then raise exception 'Bad timezone accepted'; end if;
 reset role;

 before_tenants:=(select count(*) from public.tenants); before_memberships:=(select count(*) from public.memberships); before_audits:=(select count(*) from public.audit_events);
 perform set_config('request.jwt.claim.sub','47000000-0000-4000-8001-000000000003',true);
 set local role authenticated;
 result:=public.provision_owner_workspace(jsonb_build_object('request_id',gen_random_uuid(),'name','Unconfirmed','trade','HVAC','timezone','America/New_York'));
 if result->>'status'<>'unavailable' then raise exception 'Unconfirmed user provisioned'; end if;
 reset role;
 perform set_config('request.jwt.claim.sub','47000000-0000-4000-8001-000000000004',true);
 set local role authenticated;
 result:=public.provision_owner_workspace(jsonb_build_object('request_id',gen_random_uuid(),'name','Deleted','trade','HVAC','timezone','America/New_York'));
 if result->>'status'<>'unavailable' then raise exception 'Deleted user provisioned'; end if;
 reset role;
 perform set_config('request.jwt.claim.sub','',true);
 set local role anon;
 begin perform public.provision_owner_workspace(jsonb_build_object('request_id',gen_random_uuid(),'name','Anon','trade','HVAC','timezone','America/New_York')); raise exception 'Anon execute granted'; exception when insufficient_privilege then null; end;
 reset role;
 if (select count(*) from public.tenants)<>before_tenants or (select count(*) from public.memberships)<>before_memberships or (select count(*) from public.audit_events)<>before_audits then raise exception 'Denied provisioning changed data'; end if;

 perform set_config('request.jwt.claim.sub','47000000-0000-4000-8001-000000000005',true);
 set local role authenticated;
 result:=public.provision_owner_workspace(jsonb_build_object('request_id',gen_random_uuid(),'name','Existing member','trade','HVAC','timezone','America/New_York'));
 if result->>'status'<>'unavailable' then raise exception 'Existing member created workspace'; end if;
 reset role;
end $$;
-- CEV-SELF-SERVE-ALERTS: configured operator receives setup metadata for new signups only.
do $$
declare
 operator_id uuid := '47000000-0000-4000-8000-000000000098';
 operator_user uuid := '47000000-0000-4000-8001-000000000005';
 client_user uuid := '47000000-0000-4000-8001-000000000002';
 client_id uuid;
 fixture_job_id uuid := gen_random_uuid();
 input jsonb := jsonb_build_object(
   'request_id', gen_random_uuid(), 'name', 'Fictional Setup Queue Electric',
   'trade', 'Electrical', 'timezone', 'America/New_York');
 result jsonb;
 dashboard_on bool;
 permitdesk_on bool;
begin
 insert into public.tenants(id,name,account_type) values(operator_id,'Fictional Internal','internal');
 insert into public.memberships(tenant_id,user_id,role) values(operator_id,operator_user,'owner');
 insert into onboarding_private.self_service_operator(operator_tenant_id) values(operator_id);

 perform set_config('request.jwt.claim.sub',client_user::text,true);
 set local role authenticated;
 result := public.provision_owner_workspace(input);
 if result->>'status' <> 'saved' then raise exception 'Queued provision failed'; end if;
 client_id := (result->'workspace'->>'id')::uuid;
 result := public.provision_owner_workspace(input);
 if result->>'status' <> 'replayed' then raise exception 'Queued replay failed'; end if;
 begin
   perform public.list_self_service_clients(operator_id);
   raise exception 'Contractor listed setup queue';
 exception when insufficient_privilege then null; end;
 begin
   perform public.set_self_service_client_access(operator_id,client_id,false,false,null);
   raise exception 'Contractor edited product access';
 exception when insufficient_privilege then null; end;
 reset role;
 insert into public.jobs(id, tenant_id, submission_id, title, description)
 values(fixture_job_id, client_id, gen_random_uuid(), 'Fictional setup queue job', 'Product access test fixture');
 if exists(select 1 from public.managed_client_workspaces where client_tenant_id=client_id)
   or exists(select 1 from public.memberships where tenant_id=client_id and user_id=operator_user)
 then raise exception 'Self-service signup granted managed workspace access'; end if;

 perform set_config('request.jwt.claim.sub',operator_user::text,true);
 set local role authenticated;
 result := public.list_self_service_clients(operator_id);
 if jsonb_array_length(result) <> 1 or (result->0->>'id')::uuid <> client_id
   or result->0->>'dashboard_enabled' is distinct from 'true'
   or result->0->>'permitdesk_enabled' is distinct from 'false'
 then raise exception 'Unexpected queue list or defaults'; end if;
 if exists(select 1 from public.tenants where id=client_id) then
   raise exception 'Setup operator has direct tenant read access';
 end if;
 begin
   perform public.set_self_service_client_access(operator_id,gen_random_uuid(),true,false,null);
   raise exception 'Operator edited a workspace outside the setup queue';
 exception when insufficient_privilege then null; end;
 for dashboard_on in select unnest(array[true,false]) loop
   for permitdesk_on in select unnest(array[true,false]) loop
     perform public.set_self_service_client_access(operator_id,client_id,dashboard_on,permitdesk_on,now()+interval '1 day');
     result := public.list_self_service_clients(operator_id);
     if (result->0->>'dashboard_enabled')::bool is distinct from dashboard_on
       or (result->0->>'permitdesk_enabled')::bool is distinct from permitdesk_on
     then raise exception 'Setup switches failed independently'; end if;
     perform set_config('request.jwt.claim.sub',client_user::text,true);
     if public.missed_call_available(client_id) is distinct from dashboard_on
       or coalesce((
         select enabled and expires_at > now()
         from public.permit_workspace_access where tenant_id=client_id
       ),false) is distinct from permitdesk_on
     then raise exception 'Contractor permission differs from queue switch'; end if;
     if public.has_reactivation_office_access(client_id) is distinct from dashboard_on then
       raise exception 'Reactivation access differs from dashboard switch';
     end if;
     if not dashboard_on and public.delete_job(client_id,fixture_job_id)->>'status' is distinct from 'unavailable' then
       raise exception 'Disabled dashboard allowed job deletion';
     end if;
     perform set_config('request.jwt.claim.sub',operator_user::text,true);
   end loop;
 end loop;
 reset role;
end;
$$;

rollback;
