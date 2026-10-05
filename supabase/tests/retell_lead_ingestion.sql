begin;

insert into auth.users(id,email,email_confirmed_at) values ('48000000-0000-4000-8001-000000000001','retell-owner@example.invalid',now());
insert into public.tenants(id,name,trade,timezone) values ('48000000-0000-4000-8000-000000000001','Fictional Retell HVAC','HVAC','America/New_York');
insert into public.memberships(tenant_id,user_id,role) values ('48000000-0000-4000-8000-000000000001','48000000-0000-4000-8001-000000000001','owner');
insert into integration_private.retell_connections(tenant_id,connection_id,provider_account_id,enabled) values ('48000000-0000-4000-8000-000000000001','48000000-0000-4000-8002-000000000001','agent_fictional_retell',true);
insert into integration_private.retell_connections(tenant_id,connection_id,provider_account_id,enabled) values ('48000000-0000-4000-8000-000000000001','48000000-0000-4000-8002-000000000002','agent_disabled_retell',false);

do $$
declare result jsonb; first_lead uuid; before_leads bigint; before_receipts bigint;
begin
 if (select count(*) from pg_proc p join pg_namespace s on s.oid=p.pronamespace join pg_roles r on r.oid=p.proowner where s.nspname='public' and p.proname='ingest_retell_call_lead' and p.prosecdef and r.rolname='postgres' and 'search_path=""'=any(p.proconfig) and has_function_privilege('service_role',p.oid,'EXECUTE') and not has_function_privilege('authenticated',p.oid,'EXECUTE') and not has_function_privilege('anon',p.oid,'EXECUTE'))<>1 then raise exception 'Retell ingest RPC grants/search path'; end if;
 if has_function_privilege('authenticated','integration_private.text_field(jsonb,text,integer,integer,boolean)'::regprocedure,'EXECUTE') or has_function_privilege('anon','integration_private.text_field(jsonb,text,integer,integer,boolean)'::regprocedure,'EXECUTE') then raise exception 'Private helper exposed'; end if;
 if has_table_privilege('authenticated','integration_private.retell_connections','select,insert,update,delete') or has_table_privilege('authenticated','integration_private.retell_event_receipts','select,insert,update,delete') then raise exception 'Private Retell tables exposed'; end if;
 before_leads:=(select count(*) from public.leads); before_receipts:=(select count(*) from integration_private.retell_event_receipts);
 set local role service_role;
 result:=public.ingest_retell_call_lead(jsonb_build_object(
  'connection_id','48000000-0000-4000-8002-000000000001',
  'provider_account_id','agent_fictional_retell',
  'provider_event_id','call_analyzed:call_fictional_retell_001',
  'provider_call_id','call_fictional_retell_001',
  'lead_name','Fictional Retell Caller',
  'lead_phone','+15550000001',
  'lead_email','retell-caller@example.invalid',
  'lead_description','AI receptionist call for office review. Service: no heat. Requested time: tomorrow morning.',
  'lead_priority','high'
 ));
 if result->>'status'<>'applied' or result->>'tenant_id'<>'48000000-0000-4000-8000-000000000001' then raise exception 'Retell lead ingest failed: %',result; end if;
 first_lead:=(result->>'lead_id')::uuid;
 reset role;
 if not exists(select 1 from public.leads where id=first_lead and tenant_id='48000000-0000-4000-8000-000000000001' and name='Fictional Retell Caller' and phone='+15550000001' and email='retell-caller@example.invalid' and priority='high' and status='new' and description not like '%recording_url%') then raise exception 'Lead content missing or unsafe'; end if;
 if (select count(*) from integration_private.retell_event_receipts where lead_id=first_lead and provider_call_id='call_fictional_retell_001')<>1 then raise exception 'Receipt missing'; end if;
 set local role service_role;
 result:=public.ingest_retell_call_lead(jsonb_build_object(
  'connection_id','48000000-0000-4000-8002-000000000001',
  'provider_account_id','agent_fictional_retell',
  'provider_event_id','call_analyzed:call_fictional_retell_001',
  'provider_call_id','call_fictional_retell_001',
  'lead_name','Changed Name',
  'lead_description','Changed text',
  'lead_priority','urgent'
 ));
 if result->>'status'<>'duplicate' or (result->>'lead_id')::uuid<>first_lead then raise exception 'Duplicate event not replayed'; end if;
 result:=public.ingest_retell_call_lead(jsonb_build_object(
  'connection_id','48000000-0000-4000-8002-000000000001',
  'provider_account_id','agent_fictional_retell',
  'provider_event_id','call_analyzed:call_fictional_retell_002',
  'provider_call_id','call_fictional_retell_001',
  'lead_name','Same call changed event',
  'lead_description','Same call duplicate',
  'lead_priority','normal'
 ));
 if result->>'status'<>'duplicate' or (result->>'lead_id')::uuid<>first_lead then raise exception 'Duplicate call not replayed'; end if;
 result:=public.ingest_retell_call_lead(jsonb_build_object(
  'connection_id','48000000-0000-4000-8002-000000000099',
  'provider_account_id','agent_fictional_retell',
  'provider_event_id','call_analyzed:call_unmapped',
  'provider_call_id','call_unmapped',
  'lead_name','Unmapped',
  'lead_description','Should not save'
 ));
 if result->>'status'<>'unmapped_tenant' then raise exception 'Unmapped connection accepted'; end if;
 result:=public.ingest_retell_call_lead(jsonb_build_object(
  'connection_id','48000000-0000-4000-8002-000000000002',
  'provider_account_id','agent_disabled_retell',
  'provider_event_id','call_analyzed:call_disabled',
  'provider_call_id','call_disabled',
  'lead_name','Disabled',
  'lead_description','Should not save'
 ));
 if result->>'status'<>'unmapped_tenant' then raise exception 'Disabled connection accepted'; end if;
 result:=public.ingest_retell_call_lead(jsonb_build_object(
  'connection_id','48000000-0000-4000-8002-000000000001',
  'provider_account_id','agent_fictional_retell',
  'provider_event_id','call_analyzed:call_bad',
  'provider_call_id','call_bad',
  'lead_name','Bad',
  'lead_description','Bad',
  'lead_priority','low'
 ));
 if result->>'status'<>'validation_error' then raise exception 'Invalid priority accepted'; end if;
 result:=public.ingest_retell_call_lead(jsonb_build_object(
  'connection_id','48000000-0000-4000-8002-000000000001',
  'provider_account_id','agent_fictional_retell',
  'provider_event_id','call_analyzed:call_forged',
  'provider_call_id','call_forged',
  'tenant_id','48000000-0000-4000-8000-000000000099',
  'lead_name','Forged tenant',
  'lead_description','Should reject extra key'
 ));
 if result->>'status'<>'validation_error' then raise exception 'Forged tenant key accepted'; end if;
 reset role;
 set local role authenticated;
 begin perform public.ingest_retell_call_lead('{}'::jsonb); raise exception 'Authenticated execute granted'; exception when insufficient_privilege then null; end;
 reset role;
 if (select count(*) from public.leads)<>before_leads+1 or (select count(*) from integration_private.retell_event_receipts)<>before_receipts+1 then raise exception 'Rejected/duplicate events changed data'; end if;
end $$;

rollback;
