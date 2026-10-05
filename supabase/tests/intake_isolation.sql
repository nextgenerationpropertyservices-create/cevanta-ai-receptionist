-- Synthetic local/embedded regression fixtures only. Rollback removes all writes.
begin;
insert into auth.users(id) select ('91000000-0000-4000-8000-00000000000' || n)::uuid from generate_series(1,6) n;
insert into public.memberships(tenant_id,user_id,role)
select '10000000-0000-4000-8000-000000000001', ('91000000-0000-4000-8000-00000000000' || n)::uuid,
 (array['owner','admin','dispatcher','technician','viewer']::public.app_role[])[n] from generate_series(1,5) n;
insert into public.leads(id,tenant_id,submission_id,customer_id,name,description) values
 ('41000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','51000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Synthetic intake A','Synthetic description'),
 ('41000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','51000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','Synthetic intake B','Synthetic description');

set local role anon;
do $$ begin
 begin perform count(*) from public.leads; raise exception 'Anonymous read allowed'; exception when insufficient_privilege then null; end;
 begin insert into public.leads(tenant_id,submission_id,name,description) values('10000000-0000-4000-8000-000000000001',gen_random_uuid(),'Synthetic anonymous','Synthetic description'); raise exception 'Anonymous insert allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role authenticated;
do $$ declare n integer; begin
 for n in 1..6 loop
  perform set_config('request.jwt.claim.sub','91000000-0000-4000-8000-00000000000'||n,true);
  if exists(select 1 from public.leads where tenant_id='10000000-0000-4000-8000-000000000002') then raise exception 'Cross tenant read'; end if;
  if n=6 then
   if exists(select 1 from public.leads) then raise exception 'Nonmember read'; end if;
  elsif not exists(select 1 from public.leads where id='41000000-0000-4000-8000-000000000001') then raise exception 'Member read denied'; end if;
  if n<=3 then
   insert into public.leads(tenant_id,submission_id,name,description,status,priority) values('10000000-0000-4000-8000-000000000001',gen_random_uuid(),'Synthetic office fixture','Synthetic description','new','normal');
   update public.leads set status='contacted' where id='41000000-0000-4000-8000-000000000001';
   if not found then raise exception 'Office update denied'; end if;
  else
   begin insert into public.leads(tenant_id,submission_id,name,description) values('10000000-0000-4000-8000-000000000001',gen_random_uuid(),'Synthetic denied','Synthetic description'); raise exception 'Read-only/nonmember insert allowed'; exception when insufficient_privilege then null; end;
   update public.leads set status='closed' where id='41000000-0000-4000-8000-000000000001';
   if found then raise exception 'Read-only/nonmember update allowed'; end if;
  end if;
  update public.leads set status='closed' where id='41000000-0000-4000-8000-000000000002';
  if found then raise exception 'Cross tenant update'; end if;
  begin delete from public.leads where id='41000000-0000-4000-8000-000000000001'; raise exception 'Ordinary delete allowed'; exception when insufficient_privilege then null; end;
 end loop;
end $$;
select set_config('request.jwt.claim.sub','91000000-0000-4000-8000-000000000001',true);
do $$ declare identity_column text; begin
 begin insert into public.leads(tenant_id,submission_id,name,description) values('10000000-0000-4000-8000-000000000002',gen_random_uuid(),'Synthetic cross tenant','Synthetic description'); raise exception 'Cross tenant insert'; exception when insufficient_privilege then null; end;
 begin insert into public.leads(tenant_id,submission_id,customer_id,name,description) values('10000000-0000-4000-8000-000000000001',gen_random_uuid(),'20000000-0000-4000-8000-000000000002','Synthetic wrong customer','Synthetic description'); raise exception 'Cross tenant customer insert'; exception when foreign_key_violation then null; end;
 begin update public.leads set customer_id='20000000-0000-4000-8000-000000000002' where id='41000000-0000-4000-8000-000000000001'; raise exception 'Customer linkage mutable'; exception when insufficient_privilege then null; end;
 foreach identity_column in array array['id','tenant_id','submission_id','customer_id','created_at','updated_at'] loop
  begin execute format('update public.leads set %I=%I where id=''41000000-0000-4000-8000-000000000001''',identity_column,identity_column); raise exception 'Mutable lead identity'; exception when insufficient_privilege then null; end;
 end loop;
 begin insert into public.leads(tenant_id,submission_id,name,description) values('10000000-0000-4000-8000-000000000001','51000000-0000-4000-8000-000000000001','Synthetic duplicate overwrite','Synthetic duplicate'); raise exception 'Duplicate token allowed'; exception when unique_violation then null; end;
 if (select name from public.leads where id='41000000-0000-4000-8000-000000000001') <> 'Synthetic intake A' then raise exception 'Duplicate changed original'; end if;
 begin insert into public.leads(tenant_id,submission_id,name,description,status) values('10000000-0000-4000-8000-000000000001',gen_random_uuid(),'Synthetic invalid','Synthetic description','root'); raise exception 'Invalid status'; exception when check_violation then null; end;
 begin insert into public.leads(tenant_id,submission_id,name,description,priority) values('10000000-0000-4000-8000-000000000001',gen_random_uuid(),'Synthetic invalid','Synthetic description','root'); raise exception 'Invalid priority'; exception when check_violation then null; end;
end $$;
reset role;
-- Add second membership to ensure column grants protect multi-tenant office users.
insert into public.memberships(tenant_id,user_id,role) values('10000000-0000-4000-8000-000000000002','91000000-0000-4000-8000-000000000001','admin');
set local role authenticated;
do $$ begin
 begin update public.leads set tenant_id='10000000-0000-4000-8000-000000000002' where id='41000000-0000-4000-8000-000000000001'; raise exception 'Multi-member relocation allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$ begin
 if (select count(*) from public.audit_events where entity_type='leads' and action='INSERT') <> 5 then raise exception 'Lead insert audit count/duplicate audit'; end if;
 if (select count(*) from public.audit_events where entity_type='leads' and action='UPDATE') <> 3 then raise exception 'Lead update audit count'; end if;
 if exists(select 1 from information_schema.columns where table_schema='public' and table_name='audit_events' and column_name not in ('id','tenant_id','actor_user_id','entity_type','entity_id','action','created_at')) then raise exception 'Audit payload metadata violation'; end if;
 if not exists(select 1 from public.audit_events where entity_type='leads' and actor_user_id='91000000-0000-4000-8000-000000000003') then raise exception 'Audit actor missing'; end if;
end $$;
-- Deliberately break auditing: the business insert must roll back atomically.
alter table public.audit_events add constraint intake_test_reject_audit check(entity_type <> 'leads') not valid;
set local role authenticated;
do $$ declare before_count bigint; begin
 select count(*) into before_count from public.leads;
 begin insert into public.leads(tenant_id,submission_id,name,description) values('10000000-0000-4000-8000-000000000001',gen_random_uuid(),'Synthetic atomic rollback','Synthetic description'); raise exception 'Audit failure not enforced'; exception when check_violation then null; end;
 if (select count(*) from public.leads) <> before_count then raise exception 'Business write survived audit failure'; end if;
end $$;
reset role;
rollback;
