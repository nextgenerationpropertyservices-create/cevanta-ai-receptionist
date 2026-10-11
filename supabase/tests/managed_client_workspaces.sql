-- CEV-FULLAPP-94A. Fictional embedded managed-client workspace checks, not live JWT proof.
begin;
alter table auth.users add column if not exists email_confirmed_at timestamptz;
alter table auth.users add column if not exists deleted_at timestamptz;

insert into auth.users(id,email,email_confirmed_at) values
 ('49000000-0000-4000-8001-000000000001','operator-owner@example.invalid',now()),
 ('49000000-0000-4000-8001-000000000002','operator-admin@example.invalid',now()),
 ('49000000-0000-4000-8001-000000000003','client-owner@example.invalid',now()),
 ('49000000-0000-4000-8001-000000000004','unconfirmed@example.invalid',null);
insert into public.tenants(id,name,trade,timezone,account_type) values
 ('49000000-0000-4000-8000-000000000001','Cevanta Internal Ops','AI Receptionist Operations','America/New_York','internal'),
 ('49000000-0000-4000-8000-000000000002','Ordinary Client','HVAC','America/New_York','client');
insert into public.memberships(tenant_id,user_id,role) values
 ('49000000-0000-4000-8000-000000000001','49000000-0000-4000-8001-000000000001','owner'),
 ('49000000-0000-4000-8000-000000000001','49000000-0000-4000-8001-000000000002','admin'),
 ('49000000-0000-4000-8000-000000000002','49000000-0000-4000-8001-000000000003','owner');

do $$
declare request uuid:='49000000-0000-4000-8002-000000000001'; input jsonb; result jsonb; created_tenant_id uuid; second_tenant_id uuid; before_tenants bigint; before_memberships bigint; before_links bigint;
begin
 if (select count(*) from pg_attribute where attrelid='public.tenants'::regclass and attname='account_type')<>1 then raise exception 'account_type missing'; end if;
 if (select count(*) from pg_proc p join pg_namespace s on s.oid=p.pronamespace join pg_roles r on r.oid=p.proowner where s.nspname='public' and p.proname='provision_managed_client_workspace' and p.prosecdef and r.rolname='postgres' and 'search_path=""'=any(p.proconfig) and has_function_privilege('authenticated',p.oid,'EXECUTE') and not has_function_privilege('anon',p.oid,'EXECUTE'))<>1 then raise exception 'Managed provision RPC ownership/search path/grants'; end if;
 if has_function_privilege('authenticated','onboarding_private.normalize_managed_client_workspace(jsonb)'::regprocedure,'EXECUTE') or has_function_privilege('anon','onboarding_private.normalize_managed_client_workspace(jsonb)'::regprocedure,'EXECUTE') then raise exception 'Private managed provision helper exposed'; end if;
 input:=jsonb_build_object('request_id',request,'operator_tenant_id','49000000-0000-4000-8000-000000000001','name','Fictional Client HVAC','trade','HVAC','timezone','America/New_York');
 perform set_config('request.jwt.claim.sub','49000000-0000-4000-8001-000000000001',true);
 set local role authenticated;
 result:=public.provision_managed_client_workspace(input);
 if result->>'status'<>'saved' then raise exception 'Managed provision failed: %',result; end if;
 created_tenant_id:=(result->'workspace'->>'id')::uuid;
 if result->'workspace'->>'name'<>'Fictional Client HVAC' or result->'workspace'->>'account_type'<>'client' then raise exception 'Managed result shape'; end if;
 if not exists(select 1 from public.managed_client_workspaces where operator_tenant_id='49000000-0000-4000-8000-000000000001' and client_tenant_id=created_tenant_id and created_by='49000000-0000-4000-8001-000000000001' and status='onboarding') then raise exception 'Managed link missing'; end if;
 if not exists(select 1 from public.memberships where tenant_id=created_tenant_id and user_id='49000000-0000-4000-8001-000000000001' and role='owner') then raise exception 'Cevanta operator client owner membership missing'; end if;
 if (select count(*) from public.audit_events where tenant_id='49000000-0000-4000-8000-000000000001' and entity_type='managed_client_workspaces' and entity_id=created_tenant_id)<>1 then raise exception 'Operator audit missing'; end if;
 result:=public.provision_managed_client_workspace(input);
 if result->>'status'<>'replayed' or (result->'workspace'->>'id')::uuid<>created_tenant_id then raise exception 'Managed replay failed'; end if;
 result:=public.provision_managed_client_workspace(jsonb_set(input,'{name}','"Changed Client"'));
 if result->>'reason'<>'request_reuse' then raise exception 'Changed managed request not rejected: %',result; end if;
 result:=public.provision_managed_client_workspace(input||'{"status":"active"}');
 if result->>'status'<>'validation_error' then raise exception 'Forged managed field not rejected'; end if;
 result:=public.provision_managed_client_workspace(jsonb_build_object('request_id',gen_random_uuid(),'operator_tenant_id','49000000-0000-4000-8000-000000000001','name','Second Fictional Client','trade','HVAC','timezone','America/New_York'));
 if result->>'status'<>'saved' then raise exception 'Second managed client should be allowed'; end if;
 second_tenant_id:=(result->'workspace'->>'id')::uuid;
 if second_tenant_id=created_tenant_id then raise exception 'Second managed client reused first id'; end if;
 reset role;

 perform set_config('request.jwt.claim.sub','49000000-0000-4000-8001-000000000002',true);
 set local role authenticated;
 result:=public.provision_managed_client_workspace(jsonb_build_object('request_id',gen_random_uuid(),'operator_tenant_id','49000000-0000-4000-8000-000000000001','name','Admin Created Client','trade','HVAC','timezone','America/New_York'));
 if result->>'status'<>'saved' then raise exception 'Operator admin should create managed client'; end if;
 reset role;

 before_tenants:=(select count(*) from public.tenants); before_memberships:=(select count(*) from public.memberships); before_links:=(select count(*) from public.managed_client_workspaces);
 perform set_config('request.jwt.claim.sub','49000000-0000-4000-8001-000000000003',true);
 set local role authenticated;
 result:=public.provision_managed_client_workspace(jsonb_build_object('request_id',gen_random_uuid(),'operator_tenant_id','49000000-0000-4000-8000-000000000002','name','Bad Client','trade','HVAC','timezone','America/New_York'));
 if result->>'status'<>'unavailable' then raise exception 'Client workspace owner created managed client'; end if;
 reset role;
 perform set_config('request.jwt.claim.sub','49000000-0000-4000-8001-000000000004',true);
 set local role authenticated;
 result:=public.provision_managed_client_workspace(jsonb_build_object('request_id',gen_random_uuid(),'operator_tenant_id','49000000-0000-4000-8000-000000000001','name','Unconfirmed Client','trade','HVAC','timezone','America/New_York'));
 if result->>'status'<>'unavailable' then raise exception 'Unconfirmed operator created managed client'; end if;
 reset role;
 perform set_config('request.jwt.claim.sub','',true);
 set local role anon;
 begin perform public.provision_managed_client_workspace(jsonb_build_object('request_id',gen_random_uuid(),'operator_tenant_id','49000000-0000-4000-8000-000000000001','name','Anon Client','trade','HVAC','timezone','America/New_York')); raise exception 'Anon managed execute granted'; exception when insufficient_privilege then null; end;
 reset role;
 if (select count(*) from public.tenants)<>before_tenants or (select count(*) from public.memberships)<>before_memberships or (select count(*) from public.managed_client_workspaces)<>before_links then raise exception 'Denied managed provisioning changed data'; end if;

 perform set_config('request.jwt.claim.sub','49000000-0000-4000-8001-000000000001',true);
 set local role authenticated;
 result:=public.provision_managed_client_workspace(jsonb_build_object('request_id',gen_random_uuid(),'operator_tenant_id','49000000-0000-4000-8000-000000000001','name','Bad Timezone','trade','HVAC','timezone','Mars/Base'));
 if result->>'status'<>'validation_error' then raise exception 'Bad managed timezone accepted'; end if;
 reset role;
end $$;
rollback;
