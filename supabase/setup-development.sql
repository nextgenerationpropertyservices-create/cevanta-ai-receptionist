-- Cevanta development setup. Run once on the new, empty development project only.
-- Exact concatenation of the previously Architect/Quality-reviewed foundation migration and fictional seed.
-- Contains no sign-in users, passwords, or credentials.

begin;
create type public.app_role as enum ('owner','admin','dispatcher','technician','viewer');
create table public.tenants (
 id uuid primary key default gen_random_uuid(), name text not null check (length(btrim(name)) between 1 and 160),
 trade text not null default 'HVAC' check (length(btrim(trade)) between 1 and 80), timezone text not null default 'America/New_York',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.memberships (
 tenant_id uuid not null references public.tenants(id), user_id uuid not null references auth.users(id) on delete cascade,
 role public.app_role not null, created_at timestamptz not null default now(), primary key(tenant_id,user_id)
);
create index memberships_user_idx on public.memberships(user_id);
create table public.customers (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id),
 name text not null check(length(btrim(name)) between 1 and 160), email text check(length(email)<=254), phone text check(length(phone)<=40), notes text check(length(notes)<=4000),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(tenant_id,id)
);
create table public.contacts (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null, customer_id uuid not null,
 name text not null check(length(btrim(name)) between 1 and 160), email text check(length(email)<=254), phone text check(length(phone)<=40), job_title text check(length(job_title)<=100),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(tenant_id,customer_id) references public.customers(tenant_id,id)
);
create table public.service_locations (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null, customer_id uuid not null,
 label text not null check(length(btrim(label)) between 1 and 100), address_line1 text not null check(length(btrim(address_line1)) between 1 and 200),
 city text not null check(length(btrim(city)) between 1 and 100), state text not null check(length(btrim(state)) between 1 and 80), postal_code text not null check(length(btrim(postal_code)) between 1 and 24),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(tenant_id,id),
 foreign key(tenant_id,customer_id) references public.customers(tenant_id,id)
);
create table public.equipment (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null, service_location_id uuid not null,
 name text not null check(length(btrim(name)) between 1 and 120), type text not null check(length(btrim(type)) between 1 and 80), manufacturer text check(length(manufacturer)<=100), model text check(length(model)<=100), serial_number text check(length(serial_number)<=100),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(tenant_id,service_location_id) references public.service_locations(tenant_id,id)
);
create table public.audit_events (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id), actor_user_id uuid,
 entity_type text not null, entity_id uuid not null, action text not null check(action in ('INSERT','UPDATE','DELETE')), created_at timestamptz not null default now()
);
create index contacts_tenant_customer_idx on public.contacts(tenant_id,customer_id);
create index locations_tenant_customer_idx on public.service_locations(tenant_id,customer_id);
create index equipment_tenant_location_idx on public.equipment(tenant_id,service_location_id);
create index audit_tenant_time_idx on public.audit_events(tenant_id,created_at desc);

-- Owner-controlled provisioning is outside ordinary application requests.
-- Definer uses a fixed search_path; only a boolean derived from auth.uid() is exposed.
create function public.has_tenant_role(target uuid, allowed public.app_role[] default array['owner','admin','dispatcher','technician','viewer']::public.app_role[])
returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.memberships m where m.tenant_id=target and m.user_id=(select auth.uid()) and m.role=any(allowed));
$$;
revoke all on function public.has_tenant_role(uuid,public.app_role[]) from public,anon;
grant execute on function public.has_tenant_role(uuid,public.app_role[]) to authenticated;

create function public.touch_updated_at() returns trigger language plpgsql set search_path='' as $$
begin new.updated_at=now(); return new; end; $$;
create function public.record_audit_event() returns trigger language plpgsql security definer set search_path='' as $$
declare row_data jsonb; target uuid;
begin
 if TG_OP='DELETE' then row_data=to_jsonb(old); else row_data=to_jsonb(new); end if;
 if TG_TABLE_NAME='tenants' then target=(row_data->>'id')::uuid; else target=(row_data->>'tenant_id')::uuid; end if;
 insert into public.audit_events(tenant_id,actor_user_id,entity_type,entity_id,action)
 values(target,auth.uid(),TG_TABLE_NAME,(row_data->>'id')::uuid,TG_OP);
 if TG_OP='DELETE' then return old; end if; return new;
end; $$;
revoke all on function public.touch_updated_at(),public.record_audit_event() from public,anon,authenticated;

alter table public.tenants enable row level security;
alter table public.memberships enable row level security;
alter table public.audit_events enable row level security;
create policy tenant_read on public.tenants for select to authenticated using(public.has_tenant_role(id));
create policy tenant_update on public.tenants for update to authenticated using(public.has_tenant_role(id,array['owner','admin']::public.app_role[])) with check(public.has_tenant_role(id,array['owner','admin']::public.app_role[]));
create policy membership_self_read on public.memberships for select to authenticated using(user_id=(select auth.uid()));
create policy audit_read on public.audit_events for select to authenticated using(public.has_tenant_role(tenant_id,array['owner','admin']::public.app_role[]));
revoke all on public.tenants,public.memberships,public.customers,public.contacts,public.service_locations,public.equipment,public.audit_events from anon,authenticated;
grant select on public.tenants,public.memberships,public.audit_events to authenticated;
grant update(name,trade,timezone) on public.tenants to authenticated;

do $$ declare table_name text; begin
 foreach table_name in array array['customers','contacts','service_locations','equipment'] loop
 execute format('alter table public.%I enable row level security',table_name);
 execute format('create policy entity_read on public.%I for select to authenticated using(public.has_tenant_role(tenant_id))',table_name);
 execute format('create policy entity_insert on public.%I for insert to authenticated with check(public.has_tenant_role(tenant_id,array[''owner'',''admin'',''dispatcher'']::public.app_role[]))',table_name);
 execute format('create policy entity_update on public.%I for update to authenticated using(public.has_tenant_role(tenant_id,array[''owner'',''admin'',''dispatcher'']::public.app_role[])) with check(public.has_tenant_role(tenant_id,array[''owner'',''admin'',''dispatcher'']::public.app_role[]))',table_name);
 execute format('grant select,insert on public.%I to authenticated',table_name);
 execute format('create trigger touch_updated_at before update on public.%I for each row execute function public.touch_updated_at()',table_name);
 execute format('create trigger audit_change after insert or update or delete on public.%I for each row execute function public.record_audit_event()',table_name);
 end loop;
end $$;
-- Record identity, tenant ownership, parent links, and timestamps are immutable
-- for ordinary sessions, including users with office roles in both tenants.
grant update(name,email,phone,notes) on public.customers to authenticated;
grant update(name,email,phone,job_title) on public.contacts to authenticated;
grant update(label,address_line1,city,state,postal_code) on public.service_locations to authenticated;
grant update(name,type,manufacturer,model,serial_number) on public.equipment to authenticated;
create trigger touch_updated_at before update on public.tenants for each row execute function public.touch_updated_at();
create trigger audit_change after insert or update on public.tenants for each row execute function public.record_audit_event();
commit;

-- Fictional fixtures. No user credentials, identities, or membership bypass.
insert into public.tenants(id,name,trade,timezone) values
 ('10000000-0000-4000-8000-000000000001','Cevanta Demo HVAC','HVAC','America/New_York'),
 ('10000000-0000-4000-8000-000000000002','Cevanta Demo Plumbing','Plumbing','America/Chicago');
insert into public.customers(id,tenant_id,name,email,phone,notes) values
 ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Example Customer One','customer-one@example.invalid',null,'Fictional demonstration record.'),
 ('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','Example Customer Two','customer-two@example.invalid',null,'Fictional isolation fixture.');
insert into public.contacts(tenant_id,customer_id,name,email) values
 ('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Example Contact','contact@example.invalid');
insert into public.service_locations(id,tenant_id,customer_id,label,address_line1,city,state,postal_code) values
 ('30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Demo location','123 Example Street','Example City','NY','00000');
insert into public.equipment(tenant_id,service_location_id,name,type,manufacturer,model) values
 ('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','Demo heat pump','Heat pump','Fictional Manufacturer','DEMO-1');
