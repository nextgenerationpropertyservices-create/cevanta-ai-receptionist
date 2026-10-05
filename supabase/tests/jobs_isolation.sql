-- Synthetic transaction only; no accounts or real personal data. Rollback restores state.
begin;
insert into auth.users(id) select ('92000000-0000-4000-8000-00000000000'||n)::uuid from generate_series(1,7)n;
insert into public.memberships(tenant_id,user_id,role)
select '10000000-0000-4000-8000-000000000001',('92000000-0000-4000-8000-00000000000'||n)::uuid,
 (array['owner','admin','dispatcher','technician','viewer','technician']::public.app_role[])[n] from generate_series(1,6)n;
insert into public.memberships(tenant_id,user_id,role) values('10000000-0000-4000-8000-000000000002','92000000-0000-4000-8000-000000000007','technician');
insert into public.leads(id,tenant_id,submission_id,customer_id,name,description) values
 ('42000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001',gen_random_uuid(),'20000000-0000-4000-8000-000000000001','Synthetic lead A','Synthetic description'),
 ('42000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002',gen_random_uuid(),'20000000-0000-4000-8000-000000000002','Synthetic lead B','Synthetic description');
insert into public.customers(id,tenant_id,name) values('22000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','Synthetic second customer');
insert into public.jobs(id,tenant_id,submission_id,lead_id,customer_id,service_location_id,assigned_user_id,title,description) values
 ('62000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','72000000-0000-4000-8000-000000000001','42000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','92000000-0000-4000-8000-000000000004','Synthetic assigned A','Synthetic description'),
 ('62000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001',gen_random_uuid(),null,null,null,null,'Synthetic unassigned','Synthetic description'),
 ('62000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001',gen_random_uuid(),null,null,null,'92000000-0000-4000-8000-000000000006','Synthetic assigned B','Synthetic description'),
 ('62000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000002','72000000-0000-4000-8000-000000000001','42000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002',null,null,'Synthetic tenant B','Synthetic description');
set local role anon;
do $$ begin
 begin perform count(*) from public.jobs; raise exception 'Anonymous jobs read'; exception when insufficient_privilege then null; end;
 begin perform * from public.get_tenant_technicians('10000000-0000-4000-8000-000000000001'); raise exception 'Anonymous roster'; exception when insufficient_privilege then null; end;
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
rollback;
