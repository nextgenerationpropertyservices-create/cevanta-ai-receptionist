begin;

insert into auth.users(id,email,email_confirmed_at) values ('48000000-0000-4000-8001-000000000001','retell-owner@example.invalid',now());
insert into public.tenants(id,name,trade,timezone) values ('48000000-0000-4000-8000-000000000001','Fictional Retell HVAC','HVAC','America/New_York');
insert into public.tenants(id,name,trade,timezone) values ('48000000-0000-4000-8000-000000000002','Fictional Neighbor HVAC','HVAC','America/New_York');
insert into public.memberships(tenant_id,user_id,role) values ('48000000-0000-4000-8000-000000000001','48000000-0000-4000-8001-000000000001','owner');
insert into public.leads(id,tenant_id,submission_id,name,description) values ('48000000-0000-4000-8003-000000000002','48000000-0000-4000-8000-000000000002',gen_random_uuid(),'Fictional Neighbor Lead','Other tenant fixture lead.');
insert into integration_private.retell_connections(tenant_id,connection_id,provider_account_id,enabled) values ('48000000-0000-4000-8000-000000000001','48000000-0000-4000-8002-000000000001','agent_fictional_retell',true);
insert into integration_private.retell_connections(tenant_id,connection_id,provider_account_id,enabled) values ('48000000-0000-4000-8000-000000000001','48000000-0000-4000-8002-000000000002','agent_disabled_retell',false);

do $$
declare
 result jsonb;
 first_lead uuid;
 no_evidence_lead uuid;
 testing_lead uuid;
 second_lead uuid;
 before_leads bigint;
 before_receipts bigint;
 before_outbox bigint;
 failure_leads bigint;
 failure_receipts bigint;
 failure_outbox bigint;
begin
 if (select count(*) from pg_proc p join pg_namespace s on s.oid=p.pronamespace join pg_roles r on r.oid=p.proowner where s.nspname='public' and p.proname='ingest_retell_call_lead' and p.prosecdef and r.rolname='postgres' and 'search_path=""'=any(p.proconfig) and has_function_privilege('service_role',p.oid,'EXECUTE') and not has_function_privilege('authenticated',p.oid,'EXECUTE') and not has_function_privilege('anon',p.oid,'EXECUTE'))<>1 then raise exception 'Retell ingest RPC grants/search path'; end if;
 if has_function_privilege('authenticated','integration_private.text_field(jsonb,text,integer,integer,boolean)'::regprocedure,'EXECUTE') or has_function_privilege('anon','integration_private.text_field(jsonb,text,integer,integer,boolean)'::regprocedure,'EXECUTE') then raise exception 'Private helper exposed'; end if;
 if has_table_privilege('authenticated','integration_private.retell_connections','select,insert,update,delete') or has_table_privilege('authenticated','integration_private.retell_event_receipts','select,insert,update,delete') then raise exception 'Private Retell tables exposed'; end if;
 if has_table_privilege('authenticated','integration_private.office_notification_outbox','select,insert,update,delete') or has_table_privilege('anon','integration_private.office_notification_outbox','select,insert,update,delete') then raise exception 'Private office email outbox exposed'; end if;
 begin
  insert into integration_private.office_notification_outbox(tenant_id,lead_id,channel,reason,subject)
  values('48000000-0000-4000-8000-000000000001','48000000-0000-4000-8003-000000000002','email','new_ai_lead_office_review','New AI receptionist lead needs office review');
  raise exception 'Cross-tenant office email outbox accepted';
 exception when foreign_key_violation then
  null;
 end;
 before_leads:=(select count(*) from public.leads); before_receipts:=(select count(*) from integration_private.retell_event_receipts); before_outbox:=(select count(*) from integration_private.office_notification_outbox);
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
 if (select count(*) from integration_private.office_notification_outbox where lead_id=first_lead)<>0 then raise exception 'Email outbox created while email control off'; end if;
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
 reset role;
 insert into public.workspace_automation_controls(tenant_id,capability,requested,client_visible,owner_approved,activation_state,test_evidence,rollback_plan,provider_notes,updated_by)
 values('48000000-0000-4000-8000-000000000001','email',true,true,true,'ready',null,null,'Office-only notification preparation; no customer email.', '48000000-0000-4000-8001-000000000001');
 set local role service_role;
 result:=public.ingest_retell_call_lead(jsonb_build_object(
  'connection_id','48000000-0000-4000-8002-000000000001',
  'provider_account_id','agent_fictional_retell',
  'provider_event_id','call_analyzed:call_fictional_retell_missing_evidence',
  'provider_call_id','call_fictional_retell_missing_evidence',
  'lead_name','Fictional Missing Evidence Caller',
  'lead_description','AI receptionist call while email setup lacks evidence.',
  'lead_priority','normal'
 ));
 if result->>'status'<>'applied' then raise exception 'Missing-evidence lead ingest failed: %',result; end if;
 no_evidence_lead:=(result->>'lead_id')::uuid;
 reset role;
 if (select count(*) from integration_private.office_notification_outbox where lead_id=no_evidence_lead)<>0 then raise exception 'Email outbox created without evidence and rollback plan'; end if;
 update public.workspace_automation_controls
 set activation_state='testing', test_evidence='Fictional office email dry-run passed.', rollback_plan='Disable email provider key and return to in-app only.', updated_by='48000000-0000-4000-8001-000000000001'
 where tenant_id='48000000-0000-4000-8000-000000000001' and capability='email';
 set local role service_role;
 result:=public.ingest_retell_call_lead(jsonb_build_object(
  'connection_id','48000000-0000-4000-8002-000000000001',
  'provider_account_id','agent_fictional_retell',
  'provider_event_id','call_analyzed:call_fictional_retell_testing_state',
  'provider_call_id','call_fictional_retell_testing_state',
  'lead_name','Fictional Testing State Caller',
  'lead_description','AI receptionist call while email setup is still testing.',
  'lead_priority','normal'
 ));
 if result->>'status'<>'applied' then raise exception 'Testing-state lead ingest failed: %',result; end if;
 testing_lead:=(result->>'lead_id')::uuid;
 reset role;
 if (select count(*) from integration_private.office_notification_outbox where lead_id=testing_lead)<>0 then raise exception 'Email outbox created while activation state is testing'; end if;
 update public.workspace_automation_controls
 set activation_state='ready', updated_by='48000000-0000-4000-8001-000000000001'
 where tenant_id='48000000-0000-4000-8000-000000000001' and capability='email';
 set local role service_role;
 result:=public.ingest_retell_call_lead(jsonb_build_object(
  'connection_id','48000000-0000-4000-8002-000000000001',
  'provider_account_id','agent_fictional_retell',
  'provider_event_id','call_analyzed:call_fictional_retell_003',
  'provider_call_id','call_fictional_retell_003',
  'lead_name','Fictional Email Notice Caller',
  'lead_description','AI receptionist call for office review. Service: thermostat issue.',
  'lead_priority','normal'
 ));
 if result->>'status'<>'applied' then raise exception 'Email-ready lead ingest failed: %',result; end if;
 second_lead:=(result->>'lead_id')::uuid;
 reset role;
 if (select count(*) from integration_private.office_notification_outbox where tenant_id='48000000-0000-4000-8000-000000000001' and lead_id=second_lead and channel='email' and reason='new_ai_lead_office_review' and status='prepared_not_sent' and subject='New AI receptionist lead needs office review')<>1 then raise exception 'Office email outbox missing'; end if;
 if exists(select 1 from integration_private.office_notification_outbox where lead_id=second_lead and subject ~* '(recording|transcript|webhook|api key|secret)') then raise exception 'Unsafe email outbox content'; end if;
 set local role service_role;
 result:=public.ingest_retell_call_lead(jsonb_build_object(
  'connection_id','48000000-0000-4000-8002-000000000001',
  'provider_account_id','agent_fictional_retell',
  'provider_event_id','call_analyzed:call_fictional_retell_003',
  'provider_call_id','call_fictional_retell_003',
  'lead_name','Duplicate Email Notice Caller',
  'lead_description','Should not duplicate notification'
 ));
 if result->>'status'<>'duplicate' or (result->>'lead_id')::uuid<>second_lead then raise exception 'Email-ready duplicate event not replayed'; end if;
 result:=public.ingest_retell_call_lead(jsonb_build_object(
  'connection_id','48000000-0000-4000-8002-000000000001',
  'provider_account_id','agent_fictional_retell',
  'provider_event_id','call_analyzed:call_fictional_retell_004',
  'provider_call_id','call_fictional_retell_003',
  'lead_name','Duplicate Email Notice Caller With New Event',
  'lead_description','Same call should not duplicate notification'
 ));
 if result->>'status'<>'duplicate' or (result->>'lead_id')::uuid<>second_lead then raise exception 'Email-ready duplicate call with new event not replayed'; end if;
 reset role;
 if (select count(*) from integration_private.office_notification_outbox where lead_id=second_lead)<>1 then raise exception 'Duplicate email outbox created'; end if;
 failure_leads:=(select count(*) from public.leads); failure_receipts:=(select count(*) from integration_private.retell_event_receipts); failure_outbox:=(select count(*) from integration_private.office_notification_outbox);
 alter table integration_private.office_notification_outbox add constraint retell_test_reject_outbox check(false) not valid;
 set local role service_role;
 result:=public.ingest_retell_call_lead(jsonb_build_object(
  'connection_id','48000000-0000-4000-8002-000000000001',
  'provider_account_id','agent_fictional_retell',
  'provider_event_id','call_analyzed:call_fictional_retell_outbox_failure',
  'provider_call_id','call_fictional_retell_outbox_failure',
  'lead_name','Fictional Outbox Failure Caller',
  'lead_description','AI receptionist call that should roll back when outbox insert fails.',
  'lead_priority','normal'
 ));
 if result->>'status'<>'retryable_failure' then raise exception 'Outbox failure did not return retryable failure: %',result; end if;
 reset role;
 alter table integration_private.office_notification_outbox drop constraint retell_test_reject_outbox;
 if (select count(*) from public.leads)<>failure_leads or (select count(*) from integration_private.retell_event_receipts)<>failure_receipts or (select count(*) from integration_private.office_notification_outbox)<>failure_outbox then raise exception 'Outbox failure was not atomic'; end if;
 set local role service_role;
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
 if (select count(*) from public.leads)<>before_leads+4 or (select count(*) from integration_private.retell_event_receipts)<>before_receipts+4 or (select count(*) from integration_private.office_notification_outbox)<>before_outbox+1 then raise exception 'Rejected/duplicate events changed data'; end if;
end $$;

rollback;