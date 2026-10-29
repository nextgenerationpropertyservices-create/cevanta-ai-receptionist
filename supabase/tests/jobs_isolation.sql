-- Synthetic transaction only; no accounts or real personal data. Rollback restores state.
begin;
-- The embedded Auth compatibility table is intentionally minimal. These
-- columns already exist in hosted Supabase and let this suite exercise the
-- same confirmed/nondeleted identity contract locally.
alter table auth.users add column if not exists email_confirmed_at timestamptz;
alter table auth.users add column if not exists deleted_at timestamptz;
insert into auth.users(id,email,email_confirmed_at,deleted_at)
select ('92000000-0000-4000-8000-00000000000'||n)::uuid,
       'job-user-'||n||'@example.invalid',now(),null
from generate_series(1,7)n;
insert into auth.users(id,email,email_confirmed_at,deleted_at) values
 ('92000000-0000-4000-8000-000000000008','job-unconfirmed@example.invalid',null,null),
 ('92000000-0000-4000-8000-000000000009','job-deleted@example.invalid',now(),now()),
 ('92000000-0000-4000-8000-000000000010','job-nonmember@example.invalid',now(),null),
 ('92000000-0000-4000-8000-000000000011','job-technician@example.invalid',now(),null);
insert into public.memberships(tenant_id,user_id,role)
select '10000000-0000-4000-8000-000000000001',('92000000-0000-4000-8000-00000000000'||n)::uuid,
 (array['owner','admin','dispatcher','technician','viewer','technician']::public.app_role[])[n] from generate_series(1,6)n;
insert into public.memberships(tenant_id,user_id,role) values('10000000-0000-4000-8000-000000000002','92000000-0000-4000-8000-000000000007','technician');
insert into public.memberships(tenant_id,user_id,role) values
 ('10000000-0000-4000-8000-000000000001','92000000-0000-4000-8000-000000000008','owner'),
 ('10000000-0000-4000-8000-000000000001','92000000-0000-4000-8000-000000000009','admin');
insert into public.leads(id,tenant_id,submission_id,customer_id,name,description) values
 ('42000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001',gen_random_uuid(),'20000000-0000-4000-8000-000000000001','Synthetic lead A','Synthetic description'),
 ('42000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002',gen_random_uuid(),'20000000-0000-4000-8000-000000000002','Synthetic lead B','Synthetic description');
insert into public.customers(id,tenant_id,name) values('22000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','Synthetic second customer');
insert into public.jobs(id,tenant_id,submission_id,lead_id,customer_id,service_location_id,assigned_user_id,title,description) values
 ('62000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','72000000-0000-4000-8000-000000000001','42000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','92000000-0000-4000-8000-000000000004','Synthetic assigned A','Synthetic description'),
 ('62000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001',gen_random_uuid(),null,null,null,null,'Synthetic unassigned','Synthetic description'),
 ('62000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001',gen_random_uuid(),null,null,null,'92000000-0000-4000-8000-000000000006','Synthetic assigned B','Synthetic description'),
 ('62000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000002','72000000-0000-4000-8000-000000000001','42000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002',null,null,'Synthetic tenant B','Synthetic description');
do $$ declare definition text; begin
 if (select count(*)
     from pg_proc p
     join pg_namespace n on n.oid=p.pronamespace
     join pg_roles r on r.oid=p.proowner
     where n.nspname='public'
       and p.proname='delete_job'
       and p.prosecdef
       and r.rolname='postgres'
       and 'search_path=""'=any(p.proconfig)
       and has_function_privilege('authenticated',p.oid,'EXECUTE')
       and not has_function_privilege('anon',p.oid,'EXECUTE')
       and not has_function_privilege('service_role',p.oid,'EXECUTE'))<>1
 then raise exception 'Job delete command ownership/search path/grants'; end if;
 if has_table_privilege('authenticated','public.jobs','DELETE')
    or has_table_privilege('anon','public.jobs','DELETE')
    or exists(select 1 from pg_policies where schemaname='public' and tablename='jobs' and cmd='DELETE')
 then raise exception 'Direct job DELETE became available'; end if;
 select lower(pg_get_functiondef('public.delete_job(uuid,uuid)'::regprocedure)) into definition;
 if position('from onboarding_private.current_identity()' in definition)=0
    or position('from public.memberships' in definition)=0
    or position('delete from public.jobs' in definition)=0
 then raise exception 'Job delete command contains an unqualified trusted reference'; end if;
end $$;
set local role anon;
do $$ begin
 begin perform count(*) from public.jobs; raise exception 'Anonymous jobs read'; exception when insufficient_privilege then null; end;
 begin perform * from public.get_tenant_technicians('10000000-0000-4000-8000-000000000001'); raise exception 'Anonymous roster'; exception when insufficient_privilege then null; end;
 begin perform public.delete_job('10000000-0000-4000-8000-000000000001','62000000-0000-4000-8000-000000000001'); raise exception 'Anonymous job delete command'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role authenticated;
do $$ declare n integer; expected_count integer; begin
 for n in 1..7 loop
  perform set_config('request.jwt.claim.sub','92000000-0000-4000-8000-00000000000'||n,true);
  expected_count:=case when n in(4,6) then 1 when n=7 then 0 else 3 end;
  if (select count(*) from public.jobs)<>expected_count then raise exception 'Job role visibility'; end if;
  if exists(select 1 from public.jobs where tenant_id='10000000-0000-4000-8000-000000000002') then raise exception 'Cross tenant read'; end if;
  if n in(4,6) and exists(select 1 from public.jobs where assigned_user_id is distinct from auth.uid()) then raise exception 'Technician unassigned/other job read'; end if;
  if n<=3 then
   if (select count(*) from public.get_tenant_technicians('10000000-0000-4000-8000-000000000001'))<>2 then raise exception 'Office roster'; end if;
   update public.jobs set status='scheduled',scheduled_date='2026-10-03' where id='62000000-0000-4000-8000-000000000002';
   if not found then raise exception 'Office update denied'; end if;
   begin
    insert into public.jobs(tenant_id,submission_id,title,description) values('10000000-0000-4000-8000-000000000001',gen_random_uuid(),'Synthetic role create','Synthetic description');
    raise exception 'Rollback successful insert' using errcode='ZX001';
   exception when sqlstate 'ZX001' then null; end;
  else
   begin perform * from public.get_tenant_technicians('10000000-0000-4000-8000-000000000001'); raise exception 'Nonoffice roster'; exception when insufficient_privilege then null; end;
   update public.jobs set status='completed' where id='62000000-0000-4000-8000-000000000001'; if found then raise exception 'Nonoffice write'; end if;
   begin insert into public.jobs(tenant_id,submission_id,title,description) values('10000000-0000-4000-8000-000000000001',gen_random_uuid(),'Synthetic denied','Synthetic description'); raise exception 'Nonoffice insert'; exception when insufficient_privilege then null; end;
  end if;
  begin perform * from public.get_tenant_technicians('10000000-0000-4000-8000-000000000002'); raise exception 'Cross tenant roster'; exception when insufficient_privilege then null; end;
  update public.jobs set status='cancelled' where id='62000000-0000-4000-8000-000000000004'; if found then raise exception 'Cross tenant update'; end if;
  begin delete from public.jobs where id='62000000-0000-4000-8000-000000000001'; raise exception 'Job delete granted'; exception when insufficient_privilege then null; end;
 end loop;
end $$;
select set_config('request.jwt.claim.sub','92000000-0000-4000-8000-000000000001',true);
do $$ declare col text; begin
 begin update public.jobs set status='scheduled',scheduled_date=null where id='62000000-0000-4000-8000-000000000002'; raise exception 'Scheduled without date'; exception when check_violation then null; end;
 begin update public.jobs set title=' ' where id='62000000-0000-4000-8000-000000000002'; raise exception 'Blank title'; exception when check_violation then null; end;
 begin update public.jobs set priority='invalid' where id='62000000-0000-4000-8000-000000000002'; raise exception 'Invalid priority'; exception when check_violation then null; end;
 insert into public.jobs(tenant_id,submission_id,title,description) values('10000000-0000-4000-8000-000000000001',gen_random_uuid(),'Synthetic authorized create','Synthetic description');
 begin insert into public.jobs(tenant_id,submission_id,title,description) values('10000000-0000-4000-8000-000000000002',gen_random_uuid(),'Synthetic denied','Synthetic description'); raise exception 'Cross tenant insert'; exception when insufficient_privilege then null; end;
 begin insert into public.jobs(tenant_id,submission_id,lead_id,title,description) values('10000000-0000-4000-8000-000000000001',gen_random_uuid(),'42000000-0000-4000-8000-000000000002','Synthetic wrong lead','Synthetic description'); raise exception 'Cross tenant lead'; exception when foreign_key_violation then null; end;
 begin insert into public.jobs(tenant_id,submission_id,customer_id,title,description) values('10000000-0000-4000-8000-000000000001',gen_random_uuid(),'20000000-0000-4000-8000-000000000002','Synthetic wrong customer','Synthetic description'); raise exception 'Cross tenant customer'; exception when foreign_key_violation then null; end;
 begin insert into public.jobs(tenant_id,submission_id,customer_id,service_location_id,title,description) values('10000000-0000-4000-8000-000000000001',gen_random_uuid(),'22000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000001','Synthetic wrong location','Synthetic description'); raise exception 'Wrong customer location'; exception when foreign_key_violation then null; end;
 begin insert into public.jobs(tenant_id,submission_id,service_location_id,title,description) values('10000000-0000-4000-8000-000000000001',gen_random_uuid(),'30000000-0000-4000-8000-000000000001','Synthetic location without customer','Synthetic description'); raise exception 'Location without customer'; exception when check_violation then null; end;
 begin insert into public.jobs(tenant_id,submission_id,lead_id,customer_id,title,description) values('10000000-0000-4000-8000-000000000001',gen_random_uuid(),'42000000-0000-4000-8000-000000000001','22000000-0000-4000-8000-000000000003','Synthetic lead mismatch','Synthetic description'); raise exception 'Lead customer mismatch'; exception when check_violation then null; end;
 begin update public.jobs set assigned_user_id='92000000-0000-4000-8000-000000000005' where id='62000000-0000-4000-8000-000000000002'; raise exception 'Assigned viewer'; exception when check_violation then null; end;
 begin update public.jobs set assigned_user_id='92000000-0000-4000-8000-000000000007' where id='62000000-0000-4000-8000-000000000002'; raise exception 'Assigned nonmember'; exception when check_violation then null; end;
 begin insert into public.jobs(tenant_id,submission_id,title,description,status) values('10000000-0000-4000-8000-000000000001',gen_random_uuid(),'Synthetic no date','Synthetic description','scheduled'); raise exception 'Scheduled missing date'; exception when check_violation then null; end;
 foreach col in array array['id','tenant_id','submission_id','lead_id','customer_id','service_location_id','created_at','updated_at'] loop
  begin execute format('update public.jobs set %I=%I where id=''62000000-0000-4000-8000-000000000001''',col,col); raise exception 'Mutable job identity/parent'; exception when insufficient_privilege then null; end;
 end loop;
 begin insert into public.jobs(tenant_id,submission_id,title,description) values('10000000-0000-4000-8000-000000000001','72000000-0000-4000-8000-000000000001','Synthetic duplicate','Synthetic description'); raise exception 'Duplicate token'; exception when unique_violation then null; end;
 begin insert into public.jobs(tenant_id,submission_id,lead_id,customer_id,title,description) values('10000000-0000-4000-8000-000000000001',gen_random_uuid(),'42000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Synthetic duplicate lead','Synthetic description'); raise exception 'Duplicate conversion'; exception when unique_violation then null; end;
 if (select title from public.jobs where id='62000000-0000-4000-8000-000000000001')<>'Synthetic assigned A' then raise exception 'Retry overwrote job'; end if;
 update public.jobs set assigned_user_id='92000000-0000-4000-8000-000000000006' where id='62000000-0000-4000-8000-000000000001';
end $$;
select set_config('request.jwt.claim.sub','92000000-0000-4000-8000-000000000004',true);
do $$ begin if exists(select 1 from public.jobs) then raise exception 'Prior technician retained reassigned job'; end if; end $$;
select set_config('request.jwt.claim.sub','92000000-0000-4000-8000-000000000006',true);
do $$ begin if (select count(*) from public.jobs)<>2 then raise exception 'New technician assignment missing'; end if; end $$;
reset role;
update public.memberships set role='viewer' where tenant_id='10000000-0000-4000-8000-000000000001' and user_id='92000000-0000-4000-8000-000000000006';
do $$ begin if exists(select 1 from public.jobs where assigned_user_id='92000000-0000-4000-8000-000000000006') then raise exception 'Demotion did not clear'; end if; end $$;
-- Removed technician has no visibility even if a cached session retains the subject.
update public.jobs set assigned_user_id='92000000-0000-4000-8000-000000000004' where id='62000000-0000-4000-8000-000000000002';
delete from public.memberships where tenant_id='10000000-0000-4000-8000-000000000001' and user_id='92000000-0000-4000-8000-000000000004';
do $$ begin if exists(select 1 from public.jobs where assigned_user_id='92000000-0000-4000-8000-000000000004') then raise exception 'Removal did not clear assignment'; end if; end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','92000000-0000-4000-8000-000000000004',true);
do $$ begin if exists(select 1 from public.jobs) then raise exception 'Removed member read'; end if; end $$;
reset role;
do $$ begin
 if (select count(*) from public.audit_events where entity_type='jobs' and action='INSERT')<>5 then raise exception 'Job insert audit duplicate'; end if;
 if not exists(select 1 from public.audit_events where entity_type='jobs' and action='UPDATE' and actor_user_id='92000000-0000-4000-8000-000000000003') then raise exception 'Office audit actor'; end if;
 if exists(select 1 from information_schema.columns where table_schema='public' and table_name='audit_events' and column_name not in('id','tenant_id','actor_user_id','entity_type','entity_id','action','created_at')) then raise exception 'Audit personal payload'; end if;
end $$;
alter table public.audit_events add constraint jobs_test_reject_audit check(entity_type<>'jobs') not valid;
set local role authenticated;
select set_config('request.jwt.claim.sub','92000000-0000-4000-8000-000000000001',true);
do $$ declare before_count bigint; previous_title text; begin
 select count(*) into before_count from public.jobs;
 begin insert into public.jobs(tenant_id,submission_id,title,description) values('10000000-0000-4000-8000-000000000001',gen_random_uuid(),'Synthetic rollback','Synthetic description'); raise exception 'Audit failure not enforced'; exception when check_violation then null; end;
 if (select count(*) from public.jobs)<>before_count then raise exception 'Job survived failed audit'; end if;
 select title into previous_title from public.jobs where id='62000000-0000-4000-8000-000000000002';
 begin update public.jobs set title='Synthetic failed audit update' where id='62000000-0000-4000-8000-000000000002'; raise exception 'Update audit failure not enforced'; exception when check_violation then null; end;
 if (select title from public.jobs where id='62000000-0000-4000-8000-000000000002') is distinct from previous_title then raise exception 'Update survived failed audit'; end if;
end $$;
reset role;

-- The preceding block proved ordinary job writes roll back when audit storage
-- fails. Remove its temporary constraint before exercising the delete command.
alter table public.audit_events drop constraint jobs_test_reject_audit;

insert into public.memberships(tenant_id,user_id,role) values
 ('10000000-0000-4000-8000-000000000001','92000000-0000-4000-8000-000000000011','technician');
insert into public.jobs(id,tenant_id,submission_id,title,description) values
 ('62000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000001',gen_random_uuid(),'Synthetic owner delete','Synthetic description'),
 ('62000000-0000-4000-8000-000000000006','10000000-0000-4000-8000-000000000001',gen_random_uuid(),'Synthetic admin delete','Synthetic description'),
 ('62000000-0000-4000-8000-000000000007','10000000-0000-4000-8000-000000000001',gen_random_uuid(),'Synthetic dispatcher delete','Synthetic description'),
 ('62000000-0000-4000-8000-000000000008','10000000-0000-4000-8000-000000000001',gen_random_uuid(),'Synthetic appointment protected','Synthetic description'),
 ('62000000-0000-4000-8000-000000000009','10000000-0000-4000-8000-000000000001',gen_random_uuid(),'Synthetic campaign protected','Synthetic description'),
 ('62000000-0000-4000-8000-000000000010','10000000-0000-4000-8000-000000000001',gen_random_uuid(),'Synthetic denied target','Synthetic description'),
 ('62000000-0000-4000-8000-000000000011','10000000-0000-4000-8000-000000000002',gen_random_uuid(),'Synthetic cross tenant target','Synthetic description'),
 ('62000000-0000-4000-8000-000000000012','10000000-0000-4000-8000-000000000001',gen_random_uuid(),'Synthetic audit failure target','Synthetic description');
insert into public.appointments(id,tenant_id,job_id,submission_id,title,starts_at,ends_at,status) values
 ('62000000-0000-4000-8001-000000000008','10000000-0000-4000-8000-000000000001','62000000-0000-4000-8000-000000000008',gen_random_uuid(),'Synthetic protected appointment',date_trunc('minute',now())+interval '1 day',date_trunc('minute',now())+interval '1 day 2 hours','scheduled');
insert into public.reactivation_campaigns(id,tenant_id,name,season,channel,trigger_type,status,created_by) values
 ('62000000-0000-4000-8002-000000000009','10000000-0000-4000-8000-000000000001','Synthetic protected campaign','custom','email','manual','draft','92000000-0000-4000-8000-000000000001');
insert into public.reactivation_candidates(id,tenant_id,campaign_id,customer_id,reason,channel,subject,message,status,job_id) values
 ('62000000-0000-4000-8003-000000000009','10000000-0000-4000-8000-000000000001','62000000-0000-4000-8002-000000000009','20000000-0000-4000-8000-000000000001','Synthetic linked job coverage','email','Synthetic subject','Synthetic message','draft','62000000-0000-4000-8000-000000000009');

set local role authenticated;
do $$ declare result jsonb; actor text; begin
 perform set_config('request.jwt.claim.sub','92000000-0000-4000-8000-000000000001',true);
 result:=public.delete_job('10000000-0000-4000-8000-000000000001','62000000-0000-4000-8000-000000000005');
 if result<>'{"status":"deleted"}'::jsonb then raise exception 'Owner delete command failed'; end if;

 perform set_config('request.jwt.claim.sub','92000000-0000-4000-8000-000000000002',true);
 result:=public.delete_job('10000000-0000-4000-8000-000000000001','62000000-0000-4000-8000-000000000006');
 if result<>'{"status":"deleted"}'::jsonb then raise exception 'Admin delete command failed'; end if;

 perform set_config('request.jwt.claim.sub','92000000-0000-4000-8000-000000000003',true);
 result:=public.delete_job('10000000-0000-4000-8000-000000000001','62000000-0000-4000-8000-000000000007');
 if result<>'{"status":"deleted"}'::jsonb then raise exception 'Dispatcher delete command failed'; end if;

 foreach actor in array array[
   '92000000-0000-4000-8000-000000000005',
   '92000000-0000-4000-8000-000000000008',
   '92000000-0000-4000-8000-000000000009',
   '92000000-0000-4000-8000-000000000010',
   '92000000-0000-4000-8000-000000000011'
 ] loop
  perform set_config('request.jwt.claim.sub',actor,true);
  result:=public.delete_job('10000000-0000-4000-8000-000000000001','62000000-0000-4000-8000-000000000010');
  if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Unauthorized delete disclosed a record'; end if;
 end loop;

 -- Cross-tenant, wrong-tenant, missing, and invalid-input cases intentionally
 -- share the same response so callers cannot probe another workspace.
 perform set_config('request.jwt.claim.sub','92000000-0000-4000-8000-000000000001',true);
 result:=public.delete_job('10000000-0000-4000-8000-000000000002','62000000-0000-4000-8000-000000000011');
 if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Cross-tenant delete disclosed a record'; end if;
 result:=public.delete_job('10000000-0000-4000-8000-000000000001','62000000-0000-4000-8000-000000000011');
 if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Wrong-tenant identifier disclosed a record'; end if;
 result:=public.delete_job('10000000-0000-4000-8000-000000000001','62000000-0000-4000-8000-999999999999');
 if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Missing job disclosed a record'; end if;
 result:=public.delete_job(null,'62000000-0000-4000-8000-000000000010');
 if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Null tenant accepted'; end if;

 result:=public.delete_job('10000000-0000-4000-8000-000000000001','62000000-0000-4000-8000-000000000008');
 if result<>'{"status":"protected"}'::jsonb then raise exception 'Appointment-linked job was not protected'; end if;
 result:=public.delete_job('10000000-0000-4000-8000-000000000001','62000000-0000-4000-8000-000000000009');
 if result<>'{"status":"protected"}'::jsonb then raise exception 'Campaign-linked job was not protected'; end if;

 begin
  delete from public.jobs where tenant_id='10000000-0000-4000-8000-000000000001' and id='62000000-0000-4000-8000-000000000010';
  raise exception 'Direct job DELETE unexpectedly succeeded';
 exception when insufficient_privilege then null; end;
end $$;
reset role;

do $$ begin
 if exists(select 1 from public.jobs where id in(
   '62000000-0000-4000-8000-000000000005',
   '62000000-0000-4000-8000-000000000006',
   '62000000-0000-4000-8000-000000000007'
 )) then raise exception 'Successful delete left a job behind'; end if;
 if (select count(*) from public.jobs where id in(
   '62000000-0000-4000-8000-000000000008',
   '62000000-0000-4000-8000-000000000009',
   '62000000-0000-4000-8000-000000000010',
   '62000000-0000-4000-8000-000000000011',
   '62000000-0000-4000-8000-000000000012'
 ))<>5 then raise exception 'Denied/protected job changed'; end if;
 if not exists(select 1 from public.appointments where id='62000000-0000-4000-8001-000000000008' and job_id='62000000-0000-4000-8000-000000000008') then raise exception 'Protected appointment changed'; end if;
 if not exists(select 1 from public.reactivation_candidates where id='62000000-0000-4000-8003-000000000009' and job_id='62000000-0000-4000-8000-000000000009') then raise exception 'Protected campaign candidate changed'; end if;
 if (select count(*) from public.audit_events where entity_type='jobs' and action='DELETE' and entity_id in(
   '62000000-0000-4000-8000-000000000005',
   '62000000-0000-4000-8000-000000000006',
   '62000000-0000-4000-8000-000000000007'
 ))<>3 then raise exception 'Successful delete audit count'; end if;
 if not exists(select 1 from public.audit_events where entity_type='jobs' and action='DELETE' and entity_id='62000000-0000-4000-8000-000000000005' and actor_user_id='92000000-0000-4000-8000-000000000001')
    or not exists(select 1 from public.audit_events where entity_type='jobs' and action='DELETE' and entity_id='62000000-0000-4000-8000-000000000006' and actor_user_id='92000000-0000-4000-8000-000000000002')
    or not exists(select 1 from public.audit_events where entity_type='jobs' and action='DELETE' and entity_id='62000000-0000-4000-8000-000000000007' and actor_user_id='92000000-0000-4000-8000-000000000003')
 then raise exception 'Delete audit actor mismatch'; end if;
 if exists(select 1 from public.audit_events where entity_type='jobs' and action='DELETE' and entity_id in(
   '62000000-0000-4000-8000-000000000008',
   '62000000-0000-4000-8000-000000000009',
   '62000000-0000-4000-8000-000000000010',
   '62000000-0000-4000-8000-000000000011',
   '62000000-0000-4000-8000-000000000012'
 )) then raise exception 'Rejected delete wrote an audit row'; end if;
end $$;

-- A failed audit write must roll the job deletion back atomically.
alter table public.audit_events add constraint jobs_test_reject_delete_audit
 check(entity_type<>'jobs' or action<>'DELETE') not valid;
set local role authenticated;
select set_config('request.jwt.claim.sub','92000000-0000-4000-8000-000000000001',true);
do $$ declare result jsonb; begin
 result:=public.delete_job('10000000-0000-4000-8000-000000000001','62000000-0000-4000-8000-000000000012');
 if result<>'{"status":"unavailable"}'::jsonb then raise exception 'Failed delete audit did not return safely'; end if;
end $$;
reset role;
do $$ begin
 if not exists(select 1 from public.jobs where id='62000000-0000-4000-8000-000000000012') then raise exception 'Job survived without its delete audit'; end if;
 if exists(select 1 from public.audit_events where entity_type='jobs' and action='DELETE' and entity_id='62000000-0000-4000-8000-000000000012') then raise exception 'Failed delete left an audit row'; end if;
end $$;
alter table public.audit_events drop constraint jobs_test_reject_delete_audit;
rollback;
