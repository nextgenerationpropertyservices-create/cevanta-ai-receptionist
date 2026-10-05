-- Fictional transaction fixture. Tests storage, not Auth/JWT or command behavior.
begin;
insert into public.tenants(id,name,trade,timezone) values
 ('44000000-0000-4000-8000-000000000001','Schema demo A','HVAC','America/New_York'),
 ('44000000-0000-4000-8000-000000000002','Schema demo B','Plumbing','America/Chicago');
insert into auth.users(id,email) select ('44000000-0000-4000-8001-00000000000'||n)::uuid,'schema-'||n||'@example.invalid' from generate_series(1,6) n;
insert into public.memberships(tenant_id,user_id,role) select '44000000-0000-4000-8000-000000000001',('44000000-0000-4000-8001-00000000000'||n)::uuid, (array['owner','admin','dispatcher','technician','viewer']::public.app_role[])[n] from generate_series(1,5) n;
insert into public.memberships values('44000000-0000-4000-8000-000000000002','44000000-0000-4000-8001-000000000006','owner',now());
insert into public.tenant_business_profiles(tenant_id,business_contact_name,business_email,business_phone) values('44000000-0000-4000-8000-000000000001','',null,null);
insert into public.tenant_hours_exceptions(id,tenant_id,local_date,closed,intervals,active) values('44000000-0000-4000-8002-000000000001','44000000-0000-4000-8000-000000000001','2028-02-29',false,'[{"start_minute":540,"end_minute":600},{"start_minute":600,"end_minute":660}]',true);
insert into public.tenant_setup_resume(id,tenant_id,user_id,step_id) values('44000000-0000-4000-8003-000000000001','44000000-0000-4000-8000-000000000001','44000000-0000-4000-8001-000000000001','profile');
insert into onboarding_private.invitations(id,tenant_id,recipient_user_id,recipient_email,intended_role,token_digest,expires_at,creation_request_id) values('44000000-0000-4000-8004-000000000001','44000000-0000-4000-8000-000000000001','44000000-0000-4000-8001-000000000001','schema-1@example.invalid','owner',decode(repeat('44',32),'hex'),now()+interval '1 day','44000000-0000-4000-8005-000000000001');
create function onboarding_private.test_abort_revision() returns trigger language plpgsql set search_path='' as $$ begin raise exception 'Fictional revision fault' using errcode='XX000'; end; $$;
revoke all on function onboarding_private.test_abort_revision() from public,anon,authenticated;

do $$
declare item text; n integer; actual integer; before_audit bigint;
begin
 -- Explicit denial remains even if future default privileges grant table access.
 for item in select tablename from pg_tables where schemaname='public' and tablename in ('tenant_setup_state','tenant_business_profiles','tenant_services','tenant_hours_days','tenant_hours_exceptions','tenant_booking_preferences','tenant_escalation_contacts','tenant_setup_resume') loop
  if not (select relrowsecurity from pg_class where oid=('public.'||item)::regclass) then raise exception 'RLS missing: %',item; end if;
  if has_table_privilege('authenticated','public.'||item,'SELECT,INSERT,UPDATE,DELETE') or has_table_privilege('anon','public.'||item,'SELECT,INSERT,UPDATE,DELETE') then raise exception 'Unsafe base grant: %',item; end if;
 end loop;
 if has_schema_privilege('authenticated','onboarding_private','USAGE') or has_schema_privilege('anon','onboarding_private','USAGE') then raise exception 'Private schema exposed'; end if;
 if exists(select 1 from pg_proc p join pg_namespace s on s.oid=p.pronamespace where s.nspname='onboarding_private' and (has_function_privilege('authenticated',p.oid,'EXECUTE') or has_function_privilege('anon',p.oid,'EXECUTE'))) then raise exception 'Private helper exposed'; end if;
 if exists(select 1 from onboarding_private.timezones t where not exists(select 1 from pg_timezone_names p where p.name=t.name)) then raise exception 'Pinned timezone missing from PostgreSQL tzdata'; end if;
 if not onboarding_private.valid_text(repeat('😀',160),0,160) or onboarding_private.valid_text(repeat('😀',161),0,160) or onboarding_private.valid_text(E'\tName',0,160) then raise exception 'Unicode/normalization bounds diverged'; end if;
 if not onboarding_private.valid_email('demo+tag@example.invalid') or onboarding_private.valid_email('a..b@example.invalid') or onboarding_private.valid_email(repeat('a',65)||'@example.invalid') then raise exception 'Mailbox bounds diverged'; end if;
 if not onboarding_private.valid_phone('+12025550123') or onboarding_private.valid_phone('+0123456789') then raise exception 'Phone bounds diverged'; end if;
 if octet_length(onboarding_private.token_digest(repeat('A',43)))<>32 or onboarding_private.token_bytes(repeat('A',42)||'B') is not null or onboarding_private.token_bytes(repeat('A',43)||'=') is not null then raise exception 'Noncanonical token accepted'; end if;
 if onboarding_private.canonical_json('{"z":[true,null,1],"a":"😀"}')<>'{"a":"😀","z":[true,null,1]}' then raise exception 'Canonical serialization differs'; end if;
 if onboarding_private.valid_intervals('[{"start_minute":0.5,"end_minute":10}]',false) or onboarding_private.valid_intervals('[{"start_minute":"0","end_minute":10}]',false) or onboarding_private.valid_intervals('[{"start_minute":0,"end_minute":1441}]',false) or onboarding_private.valid_intervals('[{"start_minute":0,"end_minute":10,"secret":"x"}]',false) then raise exception 'Invalid interval representation accepted'; end if;
 for n in 1..6 loop
  perform set_config('request.jwt.claim.sub','44000000-0000-4000-8001-00000000000'||n,true);
  set local role authenticated;
  begin perform 1 from public.tenant_business_profiles; raise exception 'Profile readable'; exception when insufficient_privilege then null; end;
  begin perform 1 from public.tenant_setup_resume; raise exception 'Resume readable'; exception when insufficient_privilege then null; end;
  begin execute 'select 1 from onboarding_private.invitations'; raise exception 'Invitation readable'; exception when insufficient_privilege then null; end;
  begin execute 'select 1 from onboarding_private.receipts'; raise exception 'Receipt readable'; exception when insufficient_privilege then null; end;
  begin insert into public.tenant_services(tenant_id,name,description,enabled,position) values('44000000-0000-4000-8000-000000000001','Demo','',true,0); raise exception 'Direct write permitted'; exception when insufficient_privilege then null; end;
  -- Existing tenant RLS and settings role permissions remain effective.
  select count(*) into actual from public.tenants where id in ('44000000-0000-4000-8000-000000000001','44000000-0000-4000-8000-000000000002');
  if actual<>1 then raise exception 'Tenant isolation changed'; end if;
  update public.tenants set name='Schema demo changed '||n where id='44000000-0000-4000-8000-000000000001';
  get diagnostics actual=row_count;
  if actual<>(case when n<=2 then 1 else 0 end) then raise exception 'Existing role settings authorization changed'; end if;
  reset role;
 end loop;
 select config_revision into actual from public.tenant_setup_state where tenant_id='44000000-0000-4000-8000-000000000001';
 if actual<>2 then raise exception 'Settings revision not atomic/shared'; end if;
 select count(*) into before_audit from public.audit_events where entity_type='tenant_setup_state' and tenant_id='44000000-0000-4000-8000-000000000001';
 update public.tenants set name=name where id='44000000-0000-4000-8000-000000000001';
 if (select config_revision from public.tenant_setup_state where tenant_id='44000000-0000-4000-8000-000000000001')<>2 or (select count(*) from public.audit_events where entity_type='tenant_setup_state' and tenant_id='44000000-0000-4000-8000-000000000001')<>before_audit then raise exception 'Settings no-op changed setup'; end if;
 begin update public.tenants set timezone='not/a-zone' where id='44000000-0000-4000-8000-000000000001'; raise exception 'Invalid timezone persisted'; exception when check_violation then null; end;
 if (select timezone from public.tenants where id='44000000-0000-4000-8000-000000000001')<>'America/New_York' then raise exception 'Failed update not rolled back'; end if;
 begin update public.tenant_business_profiles set tenant_id='44000000-0000-4000-8000-000000000002'; raise exception 'Identity moved'; exception when check_violation then null; end;
 begin update public.tenant_hours_exceptions set local_date='2028-03-01'; raise exception 'Exception date changed'; exception when check_violation then null; end;
 begin delete from public.tenant_hours_exceptions; raise exception 'History deleted'; exception when check_violation then null; end;
 begin insert into public.tenant_hours_days(tenant_id,weekday,closed,intervals) values('44000000-0000-4000-8000-000000000001',0,false,'[{"start_minute":1,"end_minute":20},{"start_minute":19,"end_minute":30}]'); raise exception 'Overlap accepted'; exception when check_violation then null; end;
 begin insert into public.tenant_hours_days(tenant_id,weekday,closed,intervals) values('44000000-0000-4000-8000-000000000001',0,true,'[{"start_minute":1,"end_minute":20}]'); raise exception 'Closed intervals accepted'; exception when check_violation then null; end;
 insert into public.tenant_hours_days(tenant_id,weekday,closed,intervals) values('44000000-0000-4000-8000-000000000001',0,false,'[]');
 begin insert into public.tenant_booking_preferences(tenant_id,mode,notes,acknowledged) values('44000000-0000-4000-8000-000000000001','automatic','',false); raise exception 'Live booking mode accepted'; exception when check_violation then null; end;
 begin insert into public.tenant_business_profiles(tenant_id,business_contact_name,business_email) values('44000000-0000-4000-8000-000000000002','','bad-email'); raise exception 'Invalid email accepted'; exception when check_violation then null; end;
 begin insert into public.tenant_business_profiles(tenant_id,business_contact_name,business_phone) values('44000000-0000-4000-8000-000000000002','','555-1234'); raise exception 'Unbounded phone accepted'; exception when check_violation then null; end;
 begin insert into onboarding_private.invitations(tenant_id,recipient_user_id,recipient_email,intended_role,token_digest,expires_at,creation_request_id) values('44000000-0000-4000-8000-000000000001','44000000-0000-4000-8001-000000000001','schema-1@example.invalid','viewer',decode(repeat('45',32),'hex'),now()+interval '1 day',gen_random_uuid()); raise exception 'Conflicting pending role accepted'; exception when check_violation then null; end;
 update onboarding_private.invitations set status='accepted',accepted_by=recipient_user_id,accepted_at=clock_timestamp(),version=version+1 where id='44000000-0000-4000-8004-000000000001';
 insert into onboarding_private.receipts(tenant_id,actor_user_id,command,request_id,input_digest,invitation_id,intended_role,accepted_at) select tenant_id,recipient_user_id,'invite_accept','44000000-0000-4000-8005-000000000002',decode(repeat('46',32),'hex'),id,intended_role,accepted_at from onboarding_private.invitations where id='44000000-0000-4000-8004-000000000001';
 begin update onboarding_private.receipts set input_digest=decode(repeat('47',32),'hex'); raise exception 'Receipt mutable'; exception when check_violation then null; end;
 begin insert into onboarding_private.receipts(tenant_id,actor_user_id,command,request_id,input_digest,result_id,target_date,result_version,config_revision) values('44000000-0000-4000-8000-000000000002','44000000-0000-4000-8001-000000000006','upsert_hours_exception',gen_random_uuid(),decode(repeat('48',32),'hex'),'44000000-0000-4000-8002-000000000001','2028-02-29',1,1); raise exception 'Cross-tenant receipt accepted'; exception when check_violation or foreign_key_violation then null; end;
 begin update onboarding_private.invitations set status='pending',version=version+1 where id='44000000-0000-4000-8004-000000000001'; raise exception 'Accepted token reset'; exception when check_violation then null; end;
 begin insert into onboarding_private.readiness_policy(tenant_id,policy_state) values('44000000-0000-4000-8000-000000000001','verified'); raise exception 'Invented readiness accepted'; exception when check_violation then null; end;
 update public.tenant_setup_state set config_revision=2147483647,version=2147483647 where tenant_id='44000000-0000-4000-8000-000000000001';
 begin update public.tenants set name='Overflow rejected' where id='44000000-0000-4000-8000-000000000001'; raise exception 'Revision overflow accepted'; exception when numeric_value_out_of_range then null; end;
 if (select name from public.tenants where id='44000000-0000-4000-8000-000000000001')='Overflow rejected' then raise exception 'Overflow not rolled back'; end if;
 -- RLS defense independent of grants: deliberately grant inside this rollback fixture.
 grant select on public.tenant_business_profiles to authenticated;
 set local role authenticated;
 select count(*) into actual from public.tenant_business_profiles;
 if actual<>0 then raise exception 'RLS exposed contacts after accidental grant'; end if;
 reset role;
 set local role anon;
 begin perform 1 from public.tenant_setup_state; raise exception 'Anonymous setup read'; exception when insufficient_privilege then null; end;
 reset role;
 -- Cap counts retained dates as well as active overrides.
 insert into public.tenant_hours_exceptions(tenant_id,local_date,closed,intervals,active)
 select '44000000-0000-4000-8000-000000000002',date '2030-01-01'+dates.offset_days,true,'[]',false from generate_series(0,365) dates(offset_days);
 begin insert into public.tenant_hours_exceptions(tenant_id,local_date,closed,intervals,active) values('44000000-0000-4000-8000-000000000002','2032-01-01',true,'[]',true); raise exception 'Exception cap bypass'; exception when check_violation then null; end;
 create trigger onboarding_test_fault after insert on public.tenant_setup_state for each row execute function onboarding_private.test_abort_revision();
 select count(*) into before_audit from public.audit_events;
 begin update public.tenants set name='Faulted update' where id='44000000-0000-4000-8000-000000000002'; raise exception 'Revision fault not raised'; exception when internal_error then null; end;
 if (select name from public.tenants where id='44000000-0000-4000-8000-000000000002')<>'Schema demo B' or exists(select 1 from public.tenant_setup_state where tenant_id='44000000-0000-4000-8000-000000000002') or (select count(*) from public.audit_events)<>before_audit then raise exception 'Fault left partial tenant/revision/audit changes'; end if;
end; $$;
rollback;
