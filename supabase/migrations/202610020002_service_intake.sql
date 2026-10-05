begin;
create table public.leads (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id),
 submission_id uuid not null, customer_id uuid,
 name text not null check(length(btrim(name)) between 1 and 160),
 email text check(length(email)<=254), phone text check(length(phone)<=40),
 description text not null check(length(btrim(description)) between 1 and 4000),
 priority text not null default 'normal' check(priority in ('low','normal','high','urgent')),
 status text not null default 'new' check(status in ('new','contacted','scheduled','closed')),
 follow_up_date date, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(tenant_id,submission_id), foreign key(tenant_id,customer_id) references public.customers(tenant_id,id)
);
create index leads_tenant_created_idx on public.leads(tenant_id,created_at desc);
alter table public.leads enable row level security;
create policy lead_read on public.leads for select to authenticated using(public.has_tenant_role(tenant_id));
create policy lead_insert on public.leads for insert to authenticated with check(public.has_tenant_role(tenant_id,array['owner','admin','dispatcher']::public.app_role[]));
create policy lead_update on public.leads for update to authenticated using(public.has_tenant_role(tenant_id,array['owner','admin','dispatcher']::public.app_role[])) with check(public.has_tenant_role(tenant_id,array['owner','admin','dispatcher']::public.app_role[]));
revoke all on public.leads from public,anon,authenticated;
grant select on public.leads to authenticated;
grant insert(tenant_id,submission_id,customer_id,name,email,phone,description,priority,status,follow_up_date) on public.leads to authenticated;
grant update(name,email,phone,description,priority,status,follow_up_date) on public.leads to authenticated;
create trigger touch_updated_at before update on public.leads for each row execute function public.touch_updated_at();
create trigger audit_change after insert or update or delete on public.leads for each row execute function public.record_audit_event();
commit;

