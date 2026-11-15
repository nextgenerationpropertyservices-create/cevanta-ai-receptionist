-- CEV-PROJECT-AUDIT-167K. Fictional embedded Reactivation authorization and atomicity checks.
begin;

insert into auth.users(id,email,email_confirmed_at,deleted_at) values
 ('97000000-0000-4000-8001-000000000001','reactivation-owner@example.invalid',now(),null),
 ('97000000-0000-4000-8001-000000000002','reactivation-admin@example.invalid',now(),null),
 ('97000000-0000-4000-8001-000000000003','reactivation-dispatcher@example.invalid',now(),null),
 ('97000000-0000-4000-8001-000000000004','reactivation-viewer@example.invalid',now(),null),
 ('97000000-0000-4000-8001-000000000005','reactivation-technician@example.invalid',now(),null),
 ('97000000-0000-4000-8001-000000000006','reactivation-other-owner@example.invalid',now(),null),
 ('97000000-0000-4000-8001-000000000007','reactivation-unconfirmed@example.invalid',null,null),
 ('97000000-0000-4000-8001-000000000008','reactivation-deleted@example.invalid',now(),now());
insert into public.memberships(tenant_id,user_id,role) values
 ('10000000-0000-4000-8000-000000000001','97000000-0000-4000-8001-000000000001','owner'),
 ('10000000-0000-4000-8000-000000000001','97000000-0000-4000-8001-000000000002','admin'),
 ('10000000-0000-4000-8000-000000000001','97000000-0000-4000-8001-000000000003','dispatcher'),
 ('10000000-0000-4000-8000-000000000001','97000000-0000-4000-8001-000000000004','viewer'),
 ('10000000-0000-4000-8000-000000000001','97000000-0000-4000-8001-000000000005','technician'),
 ('10000000-0000-4000-8000-000000000002','97000000-0000-4000-8001-000000000006','owner'),
 ('10000000-0000-4000-8000-000000000001','97000000-0000-4000-8001-000000000007','owner'),
 ('10000000-0000-4000-8000-000000000001','97000000-0000-4000-8001-000000000008','owner');
insert into public.customers(id,tenant_id,name,email,notes) values
 ('27000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','Fictional Reactivation Customer Three','reactivation-three@example.invalid','Fictional security fixture.'),
 ('27000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000001','Fictional Reactivation Customer Four','reactivation-four@example.invalid','Fictional atomicity fixture.');

do $$
begin
 if (select count(*) from pg_class where oid in ('public.reactivation_campaigns'::regclass,'public.reactivation_candidates'::regclass) and relrowsecurity)<>2 then raise exception 'Reactivation RLS disabled'; end if;
 if not has_table_privilege('authenticated','public.reactivation_campaigns','SELECT') or not has_table_privilege('authenticated','public.reactivation_candidates','SELECT') then raise exception 'Office read grants missing'; end if;
 if has_table_privilege('authenticated','public.reactivation_campaigns','INSERT,UPDATE,DELETE') or has_table_privilege('authenticated','public.reactivation_candidates','INSERT,UPDATE,DELETE') then raise exception 'Direct Reactivation write grant remains'; end if;
 if (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace join pg_roles r on r.oid=p.proowner where n.nspname='public' and p.proname in ('create_reactivation_campaign','review_reactivation_candidate','schedule_reactivation_visit') and p.prosecdef and r.rolname='postgres' and 'search_path=""'=any(p.proconfig) and has_function_privilege('authenticated',p.oid,'EXECUTE') and not has_function_privilege('anon',p.oid,'EXECUTE'))<>3 then raise exception 'Reactivation RPC ownership/search path/grants'; end if;
 if (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace join pg_roles r on r.oid=p.proowner where n.nspname='public' and p.proname='has_reactivation_office_access' and p.prosecdef and r.rolname='postgres' and 'search_path=""'=any(p.proconfig) and has_function_privilege('authenticated',p.oid,'EXECUTE') and not has_function_privilege('anon',p.oid,'EXECUTE'))<>1 then raise exception 'Reactivation access helper ownership/search path/grants'; end if;
 if has_table_privilege('authenticated','reactivation_private.campaign_command_receipts','SELECT,INSERT,UPDATE,DELETE') or has_table_privilege('anon','reactivation_private.campaign_command_receipts','SELECT,INSERT,UPDATE,DELETE') then raise exception 'Private Reactivation receipt exposed'; end if;
end $$;

set local role anon;
do $$
begin
 begin perform count(*) from public.reactivation_campaigns; raise exception 'Anonymous campaign read accepted'; exception when insufficient_privilege then null; end;
 begin perform public.create_reactivation_campaign('{}'::jsonb); raise exception 'Anonymous Reactivation RPC accepted'; exception when insufficient_privilege then null; end;
end $$;
reset role;

create function reactivation_private.test_candidate_insert_fault()
returns trigger language plpgsql set search_path='' as $$
begin
 if new.subject='FORCE_ATOMIC_FAILURE' then raise exception 'Fictional candidate insert fault' using errcode='XX000'; end if;
 return new;
end; $$;
create trigger test_candidate_insert_fault before insert on public.reactivation_candidates
for each row execute function reactivation_private.test_candidate_insert_fault();

set local role authenticated;
select set_config('request.jwt.claim.sub','97000000-0000-4000-8001-000000000001',true);
do $$
declare payload jsonb;
begin
 payload:=jsonb_build_object(
  'tenant_id','10000000-0000-4000-8000-000000000001','request_id','98000000-0000-4000-8001-000000000001',
  'name','Fictional atomic failure','season','fall','channel','email','trigger_type','seasonal','weather_trigger',null,
  'candidates',jsonb_build_array(jsonb_build_object(
   'customer_id','20000000-0000-4000-8000-000000000001','lead_id',null,'last_service_at','2024-09-15',
   'reason','Fictional overdue service.','subject','FORCE_ATOMIC_FAILURE','message','Fictional draft; no message is sent.'
  ))
 );
 begin perform public.create_reactivation_campaign(payload); raise exception 'Candidate fault did not abort campaign'; exception when sqlstate 'XX000' then null; end;
 if exists(select 1 from public.reactivation_campaigns where name='Fictional atomic failure') then raise exception 'Failed campaign partially persisted'; end if;
end $$;
reset role;

drop trigger test_candidate_insert_fault on public.reactivation_candidates;
drop function reactivation_private.test_candidate_insert_fault();
do $$ begin
 if exists(select 1 from reactivation_private.campaign_command_receipts where request_id='98000000-0000-4000-8001-000000000001') then raise exception 'Failed campaign receipt persisted'; end if;
end $$;

set local role authenticated;
select set_config('request.jwt.claim.sub','97000000-0000-4000-8001-000000000001',true);
do $$
declare payload jsonb; result jsonb;
begin
 payload:=jsonb_build_object(
  'tenant_id','10000000-0000-4000-8000-000000000001','request_id','98000000-0000-4000-8001-000000000002',
  'name','Fictional fall maintenance review','season','fall','channel','email','trigger_type','seasonal','weather_trigger',null,
  'candidates',jsonb_build_array(
   jsonb_build_object('customer_id','20000000-0000-4000-8000-000000000001','lead_id',null,'last_service_at','2024-09-15','reason','Fictional customer is beyond twelve months.','subject','Fictional fall service review one','message','Fictional office-review draft one; nothing is sent.'),
   jsonb_build_object('customer_id','27000000-0000-4000-8000-000000000003','lead_id',null,'last_service_at',null,'reason','Fictional customer has no completed service date.','subject','Fictional fall service review two','message','Fictional office-review draft two; nothing is sent.'),
   jsonb_build_object('customer_id','27000000-0000-4000-8000-000000000004','lead_id',null,'last_service_at','2024-08-01','reason','Fictional atomic scheduling candidate.','subject','Fictional fall service review three','message','Fictional office-review draft three; nothing is sent.')
  )
 );
 result:=public.create_reactivation_campaign(payload);
 if result->>'status'<>'saved' or (result->>'candidate_count')::integer<>3 or result->>'campaign_status'<>'review' then raise exception 'Owner campaign command failed'; end if;
 result:=public.create_reactivation_campaign(payload);
 if result->>'status'<>'replayed' or (result->>'candidate_count')::integer<>3 then raise exception 'Campaign replay failed'; end if;
 perform set_config('request.jwt.claim.sub','97000000-0000-4000-8001-000000000002',true);
 result:=public.create_reactivation_campaign(payload);
 if result->>'status'<>'conflict' or result->>'reason'<>'request_reuse' then raise exception 'Campaign request replay crossed actors'; end if;
 perform set_config('request.jwt.claim.sub','97000000-0000-4000-8001-000000000001',true);
 result:=public.create_reactivation_campaign(jsonb_set(payload,'{name}','"Changed replay"'));
 if result->>'status'<>'conflict' or result->>'reason'<>'request_reuse' then raise exception 'Changed campaign replay accepted'; end if;
 begin perform public.create_reactivation_campaign(payload||jsonb_build_object('created_by','97000000-0000-4000-8001-000000000006')); raise exception 'Client supplied campaign creator accepted'; exception when invalid_parameter_value then null; end;
 if (select count(*) from public.reactivation_campaigns where tenant_id='10000000-0000-4000-8000-000000000001')<>1 then raise exception 'Campaign command duplicated state'; end if;
 if (select count(*) from public.reactivation_candidates where tenant_id='10000000-0000-4000-8000-000000000001')<>3 then raise exception 'Campaign candidate count mismatch'; end if;
 if not exists(select 1 from public.reactivation_campaigns where tenant_id='10000000-0000-4000-8000-000000000001' and name='Fictional fall maintenance review' and status='review' and created_by='97000000-0000-4000-8001-000000000001' and approved_by is null and approved_at is null) then raise exception 'Campaign identity or initial state was forged'; end if;
end $$;

do $$
begin
 begin insert into public.reactivation_campaigns(tenant_id,name,season,channel,trigger_type,status,created_by) values('10000000-0000-4000-8000-000000000001','Direct insert','fall','email','manual','approved','97000000-0000-4000-8001-000000000006'); raise exception 'Direct campaign insert accepted'; exception when insufficient_privilege then null; end;
 begin insert into public.reactivation_candidates(tenant_id,campaign_id,customer_id,reason,channel,subject,message,status) select tenant_id,id,'20000000-0000-4000-8000-000000000001','Direct insert','email','Direct insert','Direct insert','booked' from public.reactivation_campaigns limit 1; raise exception 'Direct candidate insert accepted'; exception when insufficient_privilege then null; end;
 begin delete from public.reactivation_campaigns where tenant_id='10000000-0000-4000-8000-000000000001'; raise exception 'Direct campaign delete accepted'; exception when insufficient_privilege then null; end;
 begin delete from public.reactivation_candidates where tenant_id='10000000-0000-4000-8000-000000000001'; raise exception 'Direct candidate delete accepted'; exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub','97000000-0000-4000-8001-000000000003',true);
do $$
declare campaign_id uuid; candidate_id uuid; other_actor uuid:='97000000-0000-4000-8001-000000000006'; result jsonb;
begin
 if (select count(*) from public.reactivation_campaigns where tenant_id='10000000-0000-4000-8000-000000000001')<>1 or (select count(*) from public.reactivation_candidates where tenant_id='10000000-0000-4000-8000-000000000001')<>3 then raise exception 'Dispatcher office read unavailable'; end if;
 select id into campaign_id from public.reactivation_campaigns where tenant_id='10000000-0000-4000-8000-000000000001';
 select id into candidate_id from public.reactivation_candidates where tenant_id='10000000-0000-4000-8000-000000000001' and customer_id='20000000-0000-4000-8000-000000000001';
 begin update public.reactivation_campaigns set status='approved',approved_by=other_actor,approved_at=now() where id=campaign_id; raise exception 'Dispatcher forged campaign approval'; exception when insufficient_privilege then null; end;
 begin update public.reactivation_candidates set status='booked',customer_id='27000000-0000-4000-8000-000000000003',reviewed_by=other_actor,reviewed_at=now() where id=candidate_id; raise exception 'Dispatcher forged candidate state or linkage'; exception when insufficient_privilege then null; end;
 result:=public.review_reactivation_candidate(jsonb_build_object('tenant_id','10000000-0000-4000-8000-000000000001','candidate_id',candidate_id,'decision','approve'));
 if result->>'candidate_status'<>'approved' then raise exception 'Dispatcher candidate approval command failed'; end if;
 if not exists(select 1 from public.reactivation_candidates where id=candidate_id and status='approved' and customer_id='20000000-0000-4000-8000-000000000001' and reviewed_by='97000000-0000-4000-8001-000000000003' and reviewed_at is not null) then raise exception 'Candidate approval attribution failed'; end if;
end $$;

select set_config('request.jwt.claim.sub','97000000-0000-4000-8001-000000000002',true);
do $$
declare candidate_id uuid; result jsonb;
begin
 if (select count(*) from public.reactivation_campaigns where tenant_id='10000000-0000-4000-8000-000000000001')<>1 or (select count(*) from public.reactivation_candidates where tenant_id='10000000-0000-4000-8000-000000000001')<>3 then raise exception 'Admin office read unavailable'; end if;
 select id into candidate_id from public.reactivation_candidates where tenant_id='10000000-0000-4000-8000-000000000001' and customer_id='27000000-0000-4000-8000-000000000003';
 result:=public.review_reactivation_candidate(jsonb_build_object('tenant_id','10000000-0000-4000-8000-000000000001','candidate_id',candidate_id,'decision','dismiss'));
 if result->>'candidate_status'<>'dismissed' then raise exception 'Admin candidate dismissal command failed'; end if;
 if not exists(select 1 from public.reactivation_candidates where id=candidate_id and status='dismissed' and reviewed_by='97000000-0000-4000-8001-000000000002' and reviewed_at is not null) then raise exception 'Candidate dismissal attribution failed'; end if;
end $$;

select set_config('request.jwt.claim.sub','97000000-0000-4000-8001-000000000004',true);
do $$
declare candidate_id uuid;
begin
 if (select count(*) from public.reactivation_campaigns)<>0 or (select count(*) from public.reactivation_candidates)<>0 then raise exception 'Viewer can read personalized Reactivation records'; end if;
 select id into candidate_id from public.reactivation_candidates where tenant_id='10000000-0000-4000-8000-000000000001' limit 1;
 begin perform public.review_reactivation_candidate(jsonb_build_object('tenant_id','10000000-0000-4000-8000-000000000001','candidate_id',coalesce(candidate_id,'00000000-0000-4000-8000-000000000000'::uuid),'decision','approve')); raise exception 'Viewer Reactivation command accepted'; exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub','97000000-0000-4000-8001-000000000005',true);
do $$
begin
 if (select count(*) from public.reactivation_campaigns)<>0 or (select count(*) from public.reactivation_candidates)<>0 then raise exception 'Technician can read personalized Reactivation records'; end if;
 begin perform public.create_reactivation_campaign(jsonb_build_object('tenant_id','10000000-0000-4000-8000-000000000001','request_id','98000000-0000-4000-8001-000000000010','name','Forbidden','season','fall','channel','email','trigger_type','manual','weather_trigger',null,'candidates','[]'::jsonb)); raise exception 'Technician Reactivation command accepted'; exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub','97000000-0000-4000-8001-000000000006',true);
do $$
begin
 if (select count(*) from public.reactivation_campaigns)<>0 or (select count(*) from public.reactivation_candidates)<>0 then raise exception 'Cross-tenant owner can read Reactivation records'; end if;
 begin perform public.review_reactivation_candidate(jsonb_build_object('tenant_id','10000000-0000-4000-8000-000000000001','candidate_id','00000000-0000-4000-8000-000000000000','decision','approve')); raise exception 'Cross-tenant Reactivation command accepted'; exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub','97000000-0000-4000-8001-000000000007',true);
do $$
begin
 if (select count(*) from public.reactivation_campaigns)<>0 or (select count(*) from public.reactivation_candidates)<>0 then raise exception 'Unconfirmed user can read Reactivation records'; end if;
 begin perform public.create_reactivation_campaign('{}'::jsonb); raise exception 'Unconfirmed Reactivation command accepted'; exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub','97000000-0000-4000-8001-000000000008',true);
do $$
begin
 if (select count(*) from public.reactivation_campaigns)<>0 or (select count(*) from public.reactivation_candidates)<>0 then raise exception 'Deleted user can read Reactivation records'; end if;
 begin perform public.create_reactivation_campaign('{}'::jsonb); raise exception 'Deleted-user Reactivation command accepted'; exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub','97000000-0000-4000-8001-000000000001',true);
do $$
declare candidate_id uuid; result jsonb;
begin
 if (select count(*) from public.reactivation_campaigns where tenant_id='10000000-0000-4000-8000-000000000001')<>1 or (select count(*) from public.reactivation_candidates where tenant_id='10000000-0000-4000-8000-000000000001')<>3 then raise exception 'Owner office read unavailable'; end if;
 begin perform public.review_reactivation_candidate(null::jsonb); raise exception 'Null candidate review input accepted'; exception when invalid_parameter_value then null; end;
 begin perform public.review_reactivation_candidate(jsonb_build_object('padding',repeat('x',1048577))); raise exception 'Oversized candidate review input accepted'; exception when invalid_parameter_value then null; end;
 select id into candidate_id from public.reactivation_candidates where tenant_id='10000000-0000-4000-8000-000000000001' and customer_id='27000000-0000-4000-8000-000000000004';
 result:=public.review_reactivation_candidate(jsonb_build_object('tenant_id','10000000-0000-4000-8000-000000000001','candidate_id',candidate_id,'decision','approve'));
 if result->>'candidate_status'<>'approved' then raise exception 'Owner candidate approval failed'; end if;
end $$;
reset role;

create function reactivation_private.test_appointment_insert_fault()
returns trigger language plpgsql set search_path='' as $$
begin raise exception 'Fictional appointment fault' using errcode='XX000'; end; $$;
create trigger test_appointment_insert_fault before insert on public.appointments
for each row execute function reactivation_private.test_appointment_insert_fault();

set local role authenticated;
select set_config('request.jwt.claim.sub','97000000-0000-4000-8001-000000000001',true);
do $$
declare candidate_id uuid; target_start timestamptz:=date_trunc('hour',now()+interval '2 days'); target_end timestamptz; target_date date;
begin
 target_end:=target_start+interval '1 hour'; target_date:=target_start::date;
 select id into candidate_id from public.reactivation_candidates where tenant_id='10000000-0000-4000-8000-000000000001' and customer_id='27000000-0000-4000-8000-000000000004';
 begin perform * from public.schedule_reactivation_visit('10000000-0000-4000-8000-000000000001',candidate_id,target_date,target_start,target_end); raise exception 'Appointment fault did not abort scheduling'; exception when sqlstate 'XX000' then null; end;
 if not exists(select 1 from public.reactivation_candidates where id=candidate_id and status='approved' and job_id is null and appointment_id is null and scheduled_by is null and scheduled_at is null) then raise exception 'Failed schedule changed candidate'; end if;
 if exists(select 1 from public.jobs where tenant_id='10000000-0000-4000-8000-000000000001' and customer_id='27000000-0000-4000-8000-000000000004') then raise exception 'Failed schedule left a job'; end if;
 if exists(select 1 from public.appointments where tenant_id='10000000-0000-4000-8000-000000000001' and title='Seasonal maintenance visit') then raise exception 'Failed schedule left an appointment'; end if;
end $$;
reset role;

drop trigger test_appointment_insert_fault on public.appointments;
drop function reactivation_private.test_appointment_insert_fault();

set local role authenticated;
select set_config('request.jwt.claim.sub','97000000-0000-4000-8001-000000000001',true);
do $$
declare candidate_id uuid; dismissed_id uuid; created record; target_start timestamptz:=date_trunc('hour',now()+interval '2 days'); target_end timestamptz; target_date date;
begin
 target_end:=target_start+interval '1 hour'; target_date:=target_start::date;
 select id into candidate_id from public.reactivation_candidates where tenant_id='10000000-0000-4000-8000-000000000001' and customer_id='20000000-0000-4000-8000-000000000001';
 select id into dismissed_id from public.reactivation_candidates where tenant_id='10000000-0000-4000-8000-000000000001' and customer_id='27000000-0000-4000-8000-000000000003';
 select * into created from public.schedule_reactivation_visit('10000000-0000-4000-8000-000000000001',candidate_id,target_date,target_start,target_end);
 if created.job_id is null or created.appointment_id is null then raise exception 'Scheduling command did not return linked records'; end if;
 if not exists(select 1 from public.reactivation_candidates where id=candidate_id and status='booked' and job_id=created.job_id and appointment_id=created.appointment_id and scheduled_by='97000000-0000-4000-8001-000000000001' and scheduled_at is not null) then raise exception 'Booked candidate state or scheduler attribution missing'; end if;
 if not exists(select 1 from public.jobs where tenant_id='10000000-0000-4000-8000-000000000001' and id=created.job_id and customer_id='20000000-0000-4000-8000-000000000001') then raise exception 'Scheduled job tenant/customer link missing'; end if;
 if not exists(select 1 from public.appointments where tenant_id='10000000-0000-4000-8000-000000000001' and id=created.appointment_id and job_id=created.job_id) then raise exception 'Scheduled appointment tenant/job link missing'; end if;
 begin perform * from public.schedule_reactivation_visit('10000000-0000-4000-8000-000000000001',candidate_id,target_date,target_start,target_end); raise exception 'Booked candidate scheduled twice'; exception when insufficient_privilege then null; end;
 begin perform * from public.schedule_reactivation_visit('10000000-0000-4000-8000-000000000001',dismissed_id,target_date,target_start,target_end); raise exception 'Dismissed candidate scheduled'; exception when insufficient_privilege then null; end;
 if (select count(*) from public.jobs where tenant_id='10000000-0000-4000-8000-000000000001' and title='Seasonal maintenance visit')<>1 or (select count(*) from public.appointments where tenant_id='10000000-0000-4000-8000-000000000001' and title='Seasonal maintenance visit')<>1 then raise exception 'Rejected schedule duplicated linked records'; end if;
 if (select count(*) from public.audit_events where tenant_id='10000000-0000-4000-8000-000000000001' and entity_type='reactivation_campaigns')<>2 then raise exception 'Rejected campaign writes changed audit history'; end if;
 if (select count(*) from public.audit_events where tenant_id='10000000-0000-4000-8000-000000000001' and entity_type='reactivation_candidates')<>7 then raise exception 'Rejected candidate writes changed audit history'; end if;
end $$;

reset role;
rollback;
