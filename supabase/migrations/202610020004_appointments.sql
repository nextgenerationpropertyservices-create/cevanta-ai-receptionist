begin;
alter table public.jobs add constraint jobs_tenant_id_unique unique(tenant_id,id);
create table public.appointments (
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid not null references public.tenants(id),
 job_id uuid not null,
 submission_id uuid not null,
 title text not null check(length(btrim(title)) between 1 and 160),
 starts_at timestamptz not null,
 ends_at timestamptz not null,
 status text not null default 'scheduled' check(status in ('scheduled','cancelled')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(tenant_id,submission_id),
 foreign key(tenant_id,job_id) references public.jobs(tenant_id,id),
 check(isfinite(starts_at) and isfinite(ends_at)),
 check(ends_at > starts_at and ends_at-starts_at <= interval '7 days')
);
create index appointments_tenant_start_idx on public.appointments(tenant_id,starts_at);
create index appointments_tenant_job_idx on public.appointments(tenant_id,job_id);
alter table public.appointments enable row level security;
-- Parent jobs RLS supplies current assignment scope, including reassignment/removal.
create policy appointment_read on public.appointments for select to authenticated
 using(public.has_tenant_role(tenant_id) and exists(
  select 1 from public.jobs j where j.tenant_id=appointments.tenant_id and j.id=appointments.job_id
 ));
create policy appointment_insert on public.appointments for insert to authenticated
 with check(public.has_tenant_role(tenant_id,array['owner','admin','dispatcher']::public.app_role[]));
create policy appointment_update on public.appointments for update to authenticated
 using(public.has_tenant_role(tenant_id,array['owner','admin','dispatcher']::public.app_role[]))
 with check(public.has_tenant_role(tenant_id,array['owner','admin','dispatcher']::public.app_role[]));
revoke all on public.appointments from public,anon,authenticated;
grant select on public.appointments to authenticated;
grant insert(tenant_id,job_id,submission_id,title,starts_at,ends_at,status) on public.appointments to authenticated;
grant update(title,starts_at,ends_at,status) on public.appointments to authenticated;
create trigger touch_updated_at before update on public.appointments for each row execute function public.touch_updated_at();
create trigger audit_change after insert or update or delete on public.appointments for each row execute function public.record_audit_event();
commit;
