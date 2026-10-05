-- Synthetic, isolated fixtures only; all writes roll back.
begin;
insert into auth.users(id) select ('93000000-0000-4000-8000-00000000000'||n)::uuid from generate_series(1,7)n;
insert into public.memberships(tenant_id,user_id,role)
select '10000000-0000-4000-8000-000000000001',('93000000-0000-4000-8000-00000000000'||n)::uuid,
 (array['owner','admin','dispatcher','technician','viewer','technician']::public.app_role[])[n] from generate_series(1,6)n;
insert into public.jobs(id,tenant_id,submission_id,assigned_user_id,title,description) values
 ('63000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001',gen_random_uuid(),'93000000-0000-4000-8000-000000000004','Synthetic assigned','Synthetic description'),
 ('63000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001',gen_random_uuid(),null,'Synthetic unassigned','Synthetic description'),
 ('63000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000002',gen_random_uuid(),null,'Synthetic other tenant','Synthetic description');
insert into public.appointments(id,tenant_id,job_id,submission_id,title,starts_at,ends_at) values
 ('83000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','63000000-0000-4000-8000-000000000001','73000000-0000-4000-8000-000000000001','Synthetic appointment','2026-10-03T10:00:00Z','2026-10-03T11:00:00Z'),
 ('83000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','63000000-0000-4000-8000-000000000002',gen_random_uuid(),'Synthetic unassigned','2026-10-03T12:00:00Z','2026-10-03T13:00:00Z'),
 ('83000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000002','63000000-0000-4000-8000-000000000003','73000000-0000-4000-8000-000000000001','Synthetic isolated','2026-10-03T10:00:00Z','2026-10-03T11:00:00Z');
set local role anon;
do $$ begin begin perform count(*) from public.appointments; raise exception 'Anonymous read'; exception when insufficient_privilege then null; end; end $$;
reset role;
-- A database role alone is not a verified identity. Missing subjects fail closed.
set local role authenticated;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
 if exists(select 1 from public.appointments) then raise exception 'Missing subject read'; end if;
 update public.appointments set title='Synthetic missing subject';
 if found then raise exception 'Missing subject update'; end if;
 begin
  insert into public.appointments(tenant_id,job_id,submission_id,title,starts_at,ends_at)
  values('10000000-0000-4000-8000-000000000001','63000000-0000-4000-8000-000000000001',gen_random_uuid(),'Synthetic missing subject','2026-10-03T10:00:00Z','2026-10-03T11:00:00Z');
  raise exception 'Missing subject insert';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role authenticated;
do $$ declare n integer; expected integer; begin
 for n in 1..7 loop
  perform set_config('request.jwt.claim.sub','93000000-0000-4000-8000-00000000000'||n,true);
  expected:=case when n=4 then 1 when n in(6,7) then 0 else 2 end;
  if (select count(*) from public.appointments)<>expected then raise exception 'Appointment visibility role %',n; end if;
  if exists(select 1 from public.appointments where tenant_id='10000000-0000-4000-8000-000000000002') then raise exception 'Cross tenant read'; end if;
  update public.appointments set status='cancelled' where id='83000000-0000-4000-8000-000000000001';
  if found is distinct from (n<=3) then raise exception 'Appointment write role %',n; end if;
  if n<=3 then
   begin
    insert into public.appointments(tenant_id,job_id,submission_id,title,starts_at,ends_at) values('10000000-0000-4000-8000-000000000001','63000000-0000-4000-8000-000000000002',gen_random_uuid(),'Synthetic authorized','2026-10-04T10:00:00Z','2026-10-04T11:00:00Z');
    raise exception 'Probe rollback' using errcode='ZX001';
   exception when sqlstate 'ZX001' then null; end;
  else
   begin insert into public.appointments(tenant_id,job_id,submission_id,title,starts_at,ends_at) values('10000000-0000-4000-8000-000000000001','63000000-0000-4000-8000-000000000001',gen_random_uuid(),'Synthetic denied','2026-10-04T10:00:00Z','2026-10-04T11:00:00Z'); raise exception 'Nonoffice insert'; exception when insufficient_privilege then null; end;
  end if;
  update public.appointments set status='cancelled' where id='83000000-0000-4000-8000-000000000003'; if found then raise exception 'Cross tenant update'; end if;
  begin delete from public.appointments where id='83000000-0000-4000-8000-000000000001'; raise exception 'Delete granted'; exception when insufficient_privilege then null; end;
 end loop;
end $$;
select set_config('request.jwt.claim.sub','93000000-0000-4000-8000-000000000001',true);
do $$ declare col text; begin
 begin insert into public.appointments(tenant_id,job_id,submission_id,title,starts_at,ends_at) values('10000000-0000-4000-8000-000000000002','63000000-0000-4000-8000-000000000003',gen_random_uuid(),'Synthetic denied tenant','2026-10-04T10:00:00Z','2026-10-04T11:00:00Z'); raise exception 'Cross tenant insert'; exception when insufficient_privilege then null; end;
 begin insert into public.appointments(tenant_id,job_id,submission_id,title,starts_at,ends_at) values('10000000-0000-4000-8000-000000000001','63000000-0000-4000-8000-000000000003',gen_random_uuid(),'Synthetic wrong job','2026-10-04T10:00:00Z','2026-10-04T11:00:00Z'); raise exception 'Cross tenant parent'; exception when foreign_key_violation then null; end;
 foreach col in array array['id','tenant_id','job_id','submission_id','created_at','updated_at'] loop
  begin execute format('update public.appointments set %I=%I where id=''83000000-0000-4000-8000-000000000001''',col,col); raise exception 'Mutable identity/parent'; exception when insufficient_privilege then null; end;
 end loop;
 begin update public.appointments set ends_at=starts_at where id='83000000-0000-4000-8000-000000000001'; raise exception 'Zero interval'; exception when check_violation then null; end;
 begin update public.appointments set ends_at=starts_at-interval '1 second' where id='83000000-0000-4000-8000-000000000001'; raise exception 'Negative interval'; exception when check_violation then null; end;
 begin update public.appointments set ends_at=starts_at+interval '7 days 1 second' where id='83000000-0000-4000-8000-000000000001'; raise exception 'Oversized interval'; exception when check_violation then null; end;
 begin update public.appointments set ends_at='infinity' where id='83000000-0000-4000-8000-000000000001'; raise exception 'Infinite end'; exception when check_violation then null; end;
 begin update public.appointments set starts_at='-infinity' where id='83000000-0000-4000-8000-000000000001'; raise exception 'Infinite start'; exception when check_violation then null; end;
 update public.appointments set ends_at=starts_at+interval '7 days' where id='83000000-0000-4000-8000-000000000001';
 if not found then raise exception 'Seven day boundary denied'; end if;
 begin update public.appointments set title=' ' where id='83000000-0000-4000-8000-000000000001'; raise exception 'Blank title'; exception when check_violation then null; end;
 begin update public.appointments set status='invalid' where id='83000000-0000-4000-8000-000000000001'; raise exception 'Unknown status'; exception when check_violation then null; end;
 begin insert into public.appointments(tenant_id,job_id,submission_id,title,starts_at,ends_at) values('10000000-0000-4000-8000-000000000001','63000000-0000-4000-8000-000000000002','73000000-0000-4000-8000-000000000001','Synthetic retry overwrite','2026-10-04T10:00:00Z','2026-10-04T11:00:00Z'); raise exception 'Duplicate token'; exception when unique_violation then null; end;
 if (select title from public.appointments where id='83000000-0000-4000-8000-000000000001')<>'Synthetic appointment' then raise exception 'Retry overwrite'; end if;
 update public.jobs set assigned_user_id='93000000-0000-4000-8000-000000000006' where id='63000000-0000-4000-8000-000000000001';
end $$;
select set_config('request.jwt.claim.sub','93000000-0000-4000-8000-000000000004',true);
do $$ begin if exists(select 1 from public.appointments) then raise exception 'Prior assignment retained'; end if; end $$;
select set_config('request.jwt.claim.sub','93000000-0000-4000-8000-000000000006',true);
do $$ begin if (select count(*) from public.appointments)<>1 then raise exception 'New assignment missing'; end if; end $$;
reset role;
delete from public.memberships where tenant_id='10000000-0000-4000-8000-000000000001' and user_id='93000000-0000-4000-8000-000000000006';
set local role authenticated;
do $$ begin if exists(select 1 from public.appointments) then raise exception 'Removed member access'; end if; end $$;
reset role;
-- Role changes must affect existing appointments immediately, not just new reads
-- through the application. A former office member is an unassigned technician.
update public.memberships set role='technician'
 where tenant_id='10000000-0000-4000-8000-000000000001'
 and user_id='93000000-0000-4000-8000-000000000003';
set local role authenticated;
select set_config('request.jwt.claim.sub','93000000-0000-4000-8000-000000000003',true);
do $$ begin
 if exists(select 1 from public.appointments) then raise exception 'Former office retained appointment reads'; end if;
 update public.appointments set title='Synthetic revoked office';
 if found then raise exception 'Former office retained appointment writes'; end if;
end $$;
reset role;
do $$ begin
 if (select count(*) from public.audit_events where entity_type='appointments' and action='INSERT')<>3 then raise exception 'Duplicate/missing audit'; end if;
 if not exists(select 1 from public.audit_events where entity_type='appointments' and action='UPDATE' and actor_user_id='93000000-0000-4000-8000-000000000003') then raise exception 'Wrong audit actor'; end if;
end $$;
alter table public.audit_events add constraint appointments_test_reject_audit check(entity_type<>'appointments') not valid;
set local role authenticated;
select set_config('request.jwt.claim.sub','93000000-0000-4000-8000-000000000001',true);
do $$ declare before_count bigint; previous_title text; begin
 select count(*) into before_count from public.appointments;
 begin insert into public.appointments(tenant_id,job_id,submission_id,title,starts_at,ends_at) values('10000000-0000-4000-8000-000000000001','63000000-0000-4000-8000-000000000002',gen_random_uuid(),'Synthetic failed audit','2026-10-04T10:00:00Z','2026-10-04T11:00:00Z'); raise exception 'Audit failure not enforced'; exception when check_violation then null; end;
 if (select count(*) from public.appointments)<>before_count then raise exception 'Insert survived audit failure'; end if;
 select title into previous_title from public.appointments where id='83000000-0000-4000-8000-000000000001';
 begin update public.appointments set title='Synthetic failed update' where id='83000000-0000-4000-8000-000000000001'; raise exception 'Update audit failure not enforced'; exception when check_violation then null; end;
 if (select title from public.appointments where id='83000000-0000-4000-8000-000000000001') is distinct from previous_title then raise exception 'Update survived audit failure'; end if;
end $$;
reset role;
rollback;
