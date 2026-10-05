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
rollback;
