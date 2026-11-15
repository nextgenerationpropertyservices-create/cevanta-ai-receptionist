-- CEV-PROJECT-AUDIT-167T. Fictional mapping authority, privacy, and scoping checks.
begin;

insert into auth.users(id,email,email_confirmed_at,deleted_at) values
 ('99000000-0000-4000-8001-000000000001','mapping-operator-owner@example.invalid',now(),null),
 ('99000000-0000-4000-8001-000000000002','mapping-operator-admin@example.invalid',now(),null),
 ('99000000-0000-4000-8001-000000000003','mapping-operator-viewer@example.invalid',now(),null),
 ('99000000-0000-4000-8001-000000000004','mapping-operator-dispatcher@example.invalid',now(),null),
 ('99000000-0000-4000-8001-000000000005','mapping-operator-technician@example.invalid',now(),null),
 ('99000000-0000-4000-8001-000000000006','mapping-client-owner@example.invalid',now(),null),
 ('99000000-0000-4000-8001-000000000007','mapping-client-admin@example.invalid',now(),null),
 ('99000000-0000-4000-8001-000000000008','mapping-client-viewer@example.invalid',now(),null),
 ('99000000-0000-4000-8001-000000000009','mapping-unrelated-operator@example.invalid',now(),null),
 ('99000000-0000-4000-8001-000000000010','mapping-unconfirmed@example.invalid',null,null),
 ('99000000-0000-4000-8001-000000000011','mapping-deleted@example.invalid',now(),now()),
 ('99000000-0000-4000-8001-000000000012','mapping-archived-client-owner@example.invalid',now(),null),
 ('99000000-0000-4000-8001-000000000013','mapping-empty-client-owner@example.invalid',now(),null);

insert into public.tenants(id,name,trade,timezone,account_type) values
 ('99000000-0000-4000-8000-000000000001','Fictional Cevanta Operator','Software','America/New_York','internal'),
 ('99000000-0000-4000-8000-000000000002','Fictional Active Client','HVAC','America/New_York','client'),
 ('99000000-0000-4000-8000-000000000003','Fictional Empty Client','Plumbing','America/New_York','client'),
 ('99000000-0000-4000-8000-000000000004','Fictional Archived Client','Electrical','America/New_York','client'),
 ('99000000-0000-4000-8000-000000000005','Fictional Paused Client','Roofing','America/New_York','client'),
 ('99000000-0000-4000-8000-000000000006','Fictional Other Operator','Software','America/New_York','internal'),
 ('99000000-0000-4000-8000-000000000007','Fictional Other Client','HVAC','America/New_York','client');

insert into public.memberships(tenant_id,user_id,role) values
 ('99000000-0000-4000-8000-000000000001','99000000-0000-4000-8001-000000000001','owner'),
 ('99000000-0000-4000-8000-000000000001','99000000-0000-4000-8001-000000000002','admin'),
 ('99000000-0000-4000-8000-000000000001','99000000-0000-4000-8001-000000000003','viewer'),
 ('99000000-0000-4000-8000-000000000001','99000000-0000-4000-8001-000000000004','dispatcher'),
 ('99000000-0000-4000-8000-000000000001','99000000-0000-4000-8001-000000000005','technician'),
 ('99000000-0000-4000-8000-000000000001','99000000-0000-4000-8001-000000000010','owner'),
 ('99000000-0000-4000-8000-000000000001','99000000-0000-4000-8001-000000000011','admin'),
 ('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8001-000000000001','owner'),
 ('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8001-000000000006','owner'),
 ('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8001-000000000007','admin'),
 ('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8001-000000000008','viewer'),
 ('99000000-0000-4000-8000-000000000003','99000000-0000-4000-8001-000000000013','owner'),
 ('99000000-0000-4000-8000-000000000004','99000000-0000-4000-8001-000000000001','owner'),
 ('99000000-0000-4000-8000-000000000004','99000000-0000-4000-8001-000000000012','owner'),
 ('99000000-0000-4000-8000-000000000006','99000000-0000-4000-8001-000000000009','owner'),
 ('99000000-0000-4000-8000-000000000007','99000000-0000-4000-8001-000000000009','owner');

insert into public.managed_client_workspaces(
 operator_tenant_id,client_tenant_id,created_by,status
) values
 ('99000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000002','99000000-0000-4000-8001-000000000001','active'),
 ('99000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000003','99000000-0000-4000-8001-000000000001','onboarding'),
 ('99000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000004','99000000-0000-4000-8001-000000000001','archived'),
 ('99000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000005','99000000-0000-4000-8001-000000000001','paused'),
 ('99000000-0000-4000-8000-000000000006','99000000-0000-4000-8000-000000000007','99000000-0000-4000-8001-000000000009','active');

insert into integration_private.retell_connections(
 tenant_id,connection_id,provider_account_id,enabled
) values
 ('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001','agent_existing_active',true),
 ('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001','agent_existing_paused',false),
 ('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000002','agent_other_connection',true),
 ('99000000-0000-4000-8000-000000000004','99000000-0000-4000-8002-000000000001','agent_archived_private',true),
 ('99000000-0000-4000-8000-000000000005','99000000-0000-4000-8002-000000000001','agent_paused_private',true),
 ('99000000-0000-4000-8000-000000000007','99000000-0000-4000-8002-000000000001','agent_taken_elsewhere',true);

do $$
begin
 if (select count(*)
     from pg_proc p
     join pg_namespace n on n.oid=p.pronamespace
     join pg_roles r on r.oid=p.proowner
     where n.nspname='public'
       and p.proname in ('retell_mapping_register','retell_mapping_pause','retell_mapping_health')
       and p.prosecdef
       and r.rolname='postgres'
       and 'search_path=""'=any(p.proconfig)
       and has_function_privilege('authenticated',p.oid,'EXECUTE')
       and not has_function_privilege('anon',p.oid,'EXECUTE')
       and not has_function_privilege('service_role',p.oid,'EXECUTE'))<>3
 then raise exception 'Retell mapping RPC ownership/search path/grants are unsafe'; end if;
 if (select count(*)
     from pg_proc p
     join pg_namespace n on n.oid=p.pronamespace
     join pg_roles r on r.oid=p.proowner
     where n.nspname='integration_private'
       and p.proname in ('retell_mapping_operator_authorized','retell_mapping_health_authorized')
       and not p.prosecdef
       and r.rolname='postgres'
       and 'search_path=""'=any(p.proconfig)
       and not has_function_privilege('authenticated',p.oid,'EXECUTE')
       and not has_function_privilege('anon',p.oid,'EXECUTE')
       and not has_function_privilege('service_role',p.oid,'EXECUTE'))<>2
 then raise exception 'Private Retell mapping helper ownership/search path/grants are unsafe'; end if;
 if has_table_privilege('authenticated','integration_private.retell_connections','SELECT,INSERT,UPDATE,DELETE')
    or has_table_privilege('anon','integration_private.retell_connections','SELECT,INSERT,UPDATE,DELETE')
    or has_table_privilege('service_role','integration_private.retell_connections','SELECT,INSERT,UPDATE,DELETE')
 then raise exception 'Private Retell connection table is exposed'; end if;
 if position('manually verified' in obj_description('public.retell_mapping_register(uuid,uuid,text)'::regprocedure,'pg_proc'))=0
 then raise exception 'Manual provider verification contract is undocumented'; end if;
end $$;

set local role anon;
do $$ begin
 begin perform public.retell_mapping_health('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001'); raise exception 'Anonymous health call accepted'; exception when insufficient_privilege then null; end;
 begin perform public.retell_mapping_register('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001','agent_anon'); raise exception 'Anonymous mapping call accepted'; exception when insufficient_privilege then null; end;
end $$;
reset role;

set local role service_role;
do $$ begin
 begin perform public.retell_mapping_health('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001'); raise exception 'Service-role ordinary health call accepted'; exception when insufficient_privilege then null; end;
 begin perform public.retell_mapping_pause('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001'); raise exception 'Service-role ordinary pause call accepted'; exception when insufficient_privilege then null; end;
end $$;
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub','99000000-0000-4000-8001-000000000003',true);
do $$ declare result jsonb; begin
 result:=public.retell_mapping_health('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001');
 if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Internal viewer read route health'; end if;
 result:=public.retell_mapping_register('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001','agent_viewer');
 if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Internal viewer registered a route'; end if;
 result:=public.retell_mapping_pause('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001');
 if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Internal viewer paused a route'; end if;
 begin perform count(*) from integration_private.retell_connections; raise exception 'Authenticated private route read accepted'; exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub','99000000-0000-4000-8001-000000000004',true);
do $$ declare result jsonb; begin
 result:=public.retell_mapping_register('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001','agent_dispatcher');
 if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Internal dispatcher registered a route'; end if;
 result:=public.retell_mapping_health('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001');
 if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Internal dispatcher read route health'; end if;
end $$;

select set_config('request.jwt.claim.sub','99000000-0000-4000-8001-000000000005',true);
do $$ declare result jsonb; begin
 result:=public.retell_mapping_pause('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001');
 if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Internal technician paused a route'; end if;
 result:=public.retell_mapping_health('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001');
 if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Internal technician read route health'; end if;
end $$;

select set_config('request.jwt.claim.sub','99000000-0000-4000-8001-000000000010',true);
do $$ declare result jsonb; begin
 result:=public.retell_mapping_register('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001','agent_unconfirmed');
 if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Unconfirmed operator registered a route'; end if;
 result:=public.retell_mapping_health('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001');
 if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Unconfirmed operator read route health'; end if;
end $$;

select set_config('request.jwt.claim.sub','99000000-0000-4000-8001-000000000011',true);
do $$ declare result jsonb; begin
 result:=public.retell_mapping_pause('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001');
 if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Deleted operator paused a route'; end if;
 result:=public.retell_mapping_health('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001');
 if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Deleted operator read route health'; end if;
end $$;

select set_config('request.jwt.claim.sub','99000000-0000-4000-8001-000000000009',true);
do $$ declare result jsonb; begin
 result:=public.retell_mapping_register('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001','agent_unrelated');
 if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Unrelated operator registered a route'; end if;
 result:=public.retell_mapping_health('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001');
 if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Unrelated operator read another client route'; end if;
end $$;

select set_config('request.jwt.claim.sub','99000000-0000-4000-8001-000000000008',true);
do $$ declare result jsonb; begin
 result:=public.retell_mapping_health('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001');
 if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Client viewer read route health'; end if;
 result:=public.retell_mapping_register('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001','agent_client_viewer');
 if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Client viewer registered a route'; end if;
end $$;

select set_config('request.jwt.claim.sub','99000000-0000-4000-8001-000000000013',true);
do $$ declare result jsonb; begin
 result:=public.retell_mapping_health('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001');
 if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Cross-tenant client owner read another route'; end if;
 result:=public.retell_mapping_health('99000000-0000-4000-8000-000000000003','99000000-0000-4000-8002-000000000001');
 if result<>'{"status":"not_mapped"}'::jsonb then raise exception 'Client owner did not receive own non-sensitive empty health'; end if;
 result:=public.retell_mapping_register('99000000-0000-4000-8000-000000000003','99000000-0000-4000-8002-000000000001','agent_client_owner');
 if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Client owner registered a route'; end if;
end $$;

select set_config('request.jwt.claim.sub','99000000-0000-4000-8001-000000000006',true);
do $$ declare result jsonb; begin
 result:=public.retell_mapping_health('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001');
 if result<>'{"status":"active"}'::jsonb then raise exception 'Client owner did not receive active health'; end if;
 result:=public.retell_mapping_register('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001','agent_client_owner');
 if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Client owner registered a route'; end if;
 result:=public.retell_mapping_pause('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001');
 if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Client owner paused a route'; end if;
end $$;

select set_config('request.jwt.claim.sub','99000000-0000-4000-8001-000000000007',true);
do $$ declare result jsonb; begin
 result:=public.retell_mapping_health('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001');
 if result<>'{"status":"active"}'::jsonb then raise exception 'Client admin did not receive active health'; end if;
 result:=public.retell_mapping_pause('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001');
 if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Client admin paused a route'; end if;
end $$;

select set_config('request.jwt.claim.sub','99000000-0000-4000-8001-000000000001',true);
do $$ declare result jsonb; begin
 result:=public.retell_mapping_health('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001');
 if result<>'{"status":"active"}'::jsonb then raise exception 'Internal owner did not receive active health'; end if;
 result:=public.retell_mapping_health('99000000-0000-4000-8000-000000000003','99000000-0000-4000-8002-000000000001');
 if result<>'{"status":"not_mapped"}'::jsonb then raise exception 'Internal owner did not receive empty client health'; end if;
 result:=public.retell_mapping_health('99000000-0000-4000-8000-000000000004','99000000-0000-4000-8002-000000000001');
 if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Archived operator relationship exposed route health'; end if;
 result:=public.retell_mapping_health('99000000-0000-4000-8000-000000000005','99000000-0000-4000-8002-000000000001');
 if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Paused operator relationship exposed route health'; end if;
 result:=public.retell_mapping_register('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001','not_an_agent');
 if result<>'{"status":"invalid_agent"}'::jsonb then raise exception 'Invalid agent format accepted'; end if;
 result:=public.retell_mapping_register('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001','agent_new_mapping');
 if result<>'{"status":"mapped"}'::jsonb then raise exception 'Internal owner could not register mapping'; end if;
 result:=public.retell_mapping_register('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001','agent_new_mapping');
 if result<>'{"status":"already_mapped"}'::jsonb then raise exception 'Mapping replay was not idempotent'; end if;
 result:=public.retell_mapping_register('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001','agent_existing_paused');
 if result<>'{"status":"mapped"}'::jsonb then raise exception 'Paused mapping could not be re-enabled'; end if;
 result:=public.retell_mapping_register('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001','agent_taken_elsewhere');
 if result<>'{"status":"conflict"}'::jsonb then raise exception 'Cross-tenant agent conflict was not rejected'; end if;
 result:=public.retell_mapping_register('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000002','agent_existing_active');
 if result<>'{"status":"mapped"}'::jsonb then raise exception 'Connection-scoped mapping was rejected'; end if;
 result:=public.retell_mapping_register('99000000-0000-4000-8000-000000000004','99000000-0000-4000-8002-000000000001','agent_archived_attempt');
 if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Archived relationship registered a route'; end if;
 result:=public.retell_mapping_pause('99000000-0000-4000-8000-000000000004','99000000-0000-4000-8002-000000000001');
 if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Archived relationship paused a route'; end if;
end $$;

select set_config('request.jwt.claim.sub','99000000-0000-4000-8001-000000000002',true);
do $$ declare result jsonb; begin
 result:=public.retell_mapping_health('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001');
 if result<>'{"status":"active"}'::jsonb then raise exception 'Internal admin did not receive active health'; end if;
 result:=public.retell_mapping_pause('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001');
 if result<>'{"status":"paused"}'::jsonb then raise exception 'Internal admin could not pause mapping'; end if;
 result:=public.retell_mapping_health('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001');
 if result<>'{"status":"paused"}'::jsonb then raise exception 'Paused route health was not reported'; end if;
 result:=public.retell_mapping_health('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000002');
 if result<>'{"status":"active"}'::jsonb then raise exception 'Pause crossed the configured connection boundary'; end if;
 result:=public.retell_mapping_pause('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8002-000000000001');
 if result<>'{"status":"not_mapped"}'::jsonb then raise exception 'Repeated pause did not fail closed'; end if;
end $$;

select set_config('request.jwt.claim.sub','99000000-0000-4000-8001-000000000012',true);
do $$ declare result jsonb; begin
 result:=public.retell_mapping_health('99000000-0000-4000-8000-000000000004','99000000-0000-4000-8002-000000000001');
 if result<>'{"status":"active"}'::jsonb then raise exception 'Archived client owner could not read own non-sensitive health'; end if;
 result:=public.retell_mapping_pause('99000000-0000-4000-8000-000000000004','99000000-0000-4000-8002-000000000001');
 if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Archived client owner paused a route'; end if;
end $$;
reset role;

do $$
begin
 if not exists(
   select 1 from integration_private.retell_connections
   where tenant_id='99000000-0000-4000-8000-000000000002'
     and connection_id='99000000-0000-4000-8002-000000000001'
     and provider_account_id='agent_new_mapping'
     and not enabled
 ) then raise exception 'Expected mapped route state was not persisted and paused'; end if;
 if not exists(
   select 1 from integration_private.retell_connections
   where tenant_id='99000000-0000-4000-8000-000000000007'
     and connection_id='99000000-0000-4000-8002-000000000001'
     and provider_account_id='agent_taken_elsewhere'
     and enabled
 ) then raise exception 'Conflict changed another tenant mapping'; end if;
 if not exists(
   select 1 from integration_private.retell_connections
   where tenant_id='99000000-0000-4000-8000-000000000002'
     and connection_id='99000000-0000-4000-8002-000000000002'
     and provider_account_id='agent_existing_active'
     and enabled
 ) then raise exception 'Connection-scoped mapping was not preserved'; end if;
 if exists(
   select 1 from integration_private.retell_connections
   where provider_account_id in ('agent_viewer','agent_dispatcher','agent_unconfirmed','agent_unrelated','agent_client_viewer','agent_client_owner','agent_archived_attempt')
 ) then raise exception 'Rejected mapping attempt changed private state'; end if;
end $$;

rollback;
