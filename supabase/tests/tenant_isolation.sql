-- Run against a reset LOCAL database: psql "$LOCAL_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/tenant_isolation.sql
-- Transaction rollback removes synthetic test identities and all test writes.
begin;
insert into auth.users(id) values ('90000000-0000-4000-8000-000000000001'),('90000000-0000-4000-8000-000000000002');
insert into public.memberships(tenant_id,user_id,role) values
 ('10000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000001','dispatcher'),
 ('10000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000002','technician');
set local role authenticated;
select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000001',true);
do $$ begin
 if (select count(*) from public.tenants) <> 1 then raise exception 'Tenant isolation failed'; end if;
 if exists(select 1 from public.customers where tenant_id='10000000-0000-4000-8000-000000000002') then raise exception 'Cross tenant read'; end if;
 insert into public.customers(tenant_id,name) values('10000000-0000-4000-8000-000000000001','Authorized fixture');
 begin
 insert into public.customers(tenant_id,name) values('10000000-0000-4000-8000-000000000002','Unauthorized fixture');
 raise exception 'Cross tenant insert allowed';
 exception when insufficient_privilege then null; end;
 begin
 insert into public.service_locations(tenant_id,customer_id,label,address_line1,city,state,postal_code)
 values('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','Mismatch','Example','Example','NY','00000');
 raise exception 'Cross tenant parent allowed';
 exception when foreign_key_violation then null; end;
 if exists(select 1 from public.tenants where id='10000000-0000-4000-8000-000000000001' and name='Changed') then raise exception 'Invalid starting fixture'; end if;
 update public.tenants set name='Changed' where id='10000000-0000-4000-8000-000000000001';
 if found then raise exception 'Dispatcher changed settings'; end if;
 begin
 insert into public.memberships values('10000000-0000-4000-8000-000000000002','90000000-0000-4000-8000-000000000001','owner',now());
 raise exception 'Self provisioning allowed';
 exception when insufficient_privilege then null; end;
 end $$;
select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000002',true);
do $$ begin
 if (select count(*) from public.customers) < 1 then raise exception 'Technician cannot read'; end if;
 begin
 insert into public.customers(tenant_id,name) values('10000000-0000-4000-8000-000000000001','Forbidden');
 raise exception 'Technician insert allowed';
 exception when insufficient_privilege then null; end;
 update public.customers set name='Forbidden' where id='20000000-0000-4000-8000-000000000001';
 if found then raise exception 'Technician update allowed'; end if;
end $$;
reset role;
-- Multi-tenant office membership must not allow moving bare records between tenants.
insert into public.memberships(tenant_id,user_id,role) values
 ('10000000-0000-4000-8000-000000000002','90000000-0000-4000-8000-000000000001','admin');
set local role authenticated;
select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000001',true);
do $$ declare relation text; column_name text; begin
 foreach relation in array array['customers','contacts','service_locations','equipment'] loop
  foreach column_name in array array['id','tenant_id','created_at','updated_at'] loop
   if has_column_privilege('authenticated','public.' || relation,column_name,'UPDATE') then
    raise exception 'Identity/ownership/timestamp mutable: %.%',relation,column_name;
   end if;
  end loop;
 end loop;
 if has_column_privilege('authenticated','public.contacts','customer_id','UPDATE')
 or has_column_privilege('authenticated','public.service_locations','customer_id','UPDATE')
 or has_column_privilege('authenticated','public.equipment','service_location_id','UPDATE') then
  raise exception 'Parent links mutable';
 end if;
 begin
  update public.customers set tenant_id='10000000-0000-4000-8000-000000000002' where name='Authorized fixture';
  raise exception 'Multi-tenant office moved bare customer';
 exception when insufficient_privilege then null; end;
 begin
  update public.customers set id=gen_random_uuid() where name='Authorized fixture';
  raise exception 'Identity changed';
 exception when insufficient_privilege then null; end;
 begin
  update public.service_locations set customer_id='20000000-0000-4000-8000-000000000001';
  raise exception 'Parent changed';
 exception when insufficient_privilege then null; end;
 update public.customers set notes='Allowed business update' where name='Authorized fixture';
 if not found then raise exception 'Office business update blocked'; end if;
end $$;
reset role;
-- Exercise owner/admin settings access and viewer restrictions with one synthetic subject.
do $$ declare office_role public.app_role; begin
 foreach office_role in array array['owner','admin']::public.app_role[] loop
  update public.memberships set role=office_role where user_id='90000000-0000-4000-8000-000000000002';
  execute 'set local role authenticated';
  perform set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000002',true);
  update public.tenants set trade='HVAC' where id='10000000-0000-4000-8000-000000000001';
  if not found then raise exception 'Owner/admin settings update blocked'; end if;
  update public.customers set notes='Office update' where id='20000000-0000-4000-8000-000000000001';
  if not found then raise exception 'Owner/admin customer update blocked'; end if;
  execute 'reset role';
 end loop;
end $$;
update public.memberships set role='viewer' where user_id='90000000-0000-4000-8000-000000000002';
set local role authenticated;
select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000002',true);
do $$ begin
 if (select count(*) from public.customers) < 1 then raise exception 'Viewer cannot read'; end if;
 update public.customers set notes='Forbidden';
 if found then raise exception 'Viewer update allowed'; end if;
 begin
  insert into public.customers(tenant_id,name) values('10000000-0000-4000-8000-000000000001','Forbidden');
  raise exception 'Viewer insert allowed';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role anon;
do $$ begin
 begin
  perform 1 from public.customers;
  raise exception 'Anonymous read allowed';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.customers(tenant_id,name) values('10000000-0000-4000-8000-000000000001','Forbidden');
  raise exception 'Anonymous insert allowed';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$ begin
 if not exists(select 1 from public.audit_events where actor_user_id='90000000-0000-4000-8000-000000000001' and entity_type='customers' and action='INSERT') then raise exception 'Atomic audit missing'; end if;
end $$;
rollback;
