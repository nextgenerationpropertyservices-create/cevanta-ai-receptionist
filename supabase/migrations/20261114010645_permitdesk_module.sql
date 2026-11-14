begin;
create table public.permit_workspace_access (
 tenant_id uuid primary key references public.tenants(id),
 enabled boolean not null default false,
 expires_at timestamptz
);
create table public.job_permits (
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid not null references public.tenants(id),
 job_id uuid,
 title text not null check (length(btrim(title)) between 1 and 160),
 site text not null check (length(btrim(site)) between 1 and 200),
 jurisdiction text not null check (length(btrim(jurisdiction)) between 1 and 160),
 scope text not null check (length(btrim(scope)) between 1 and 4000),
 status text not null default 'draft' check (status in ('draft','ready','submitted','issued','closed')),
 submitted_on date,
 permit_number text not null default '' check (length(permit_number)<=100),
 next_followup date,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 foreign key (tenant_id, job_id) references public.jobs(tenant_id,id) on delete set null (job_id),
 unique (tenant_id,job_id),
 check (status not in ('submitted','issued','closed') or submitted_on is not null),
 check (status not in ('issued','closed') or btrim(permit_number)<>''),
 check (next_followup is null or submitted_on is null or next_followup>=submitted_on)
);
create index job_permits_recent_idx on public.job_permits(tenant_id,updated_at desc);
alter table public.permit_workspace_access enable row level security;
alter table public.job_permits enable row level security;
revoke all on public.permit_workspace_access,public.job_permits from public,anon,authenticated;
grant select on public.permit_workspace_access to authenticated;
grant select on public.job_permits to authenticated;
grant insert (tenant_id,job_id,title,site,jurisdiction,scope) on public.job_permits to authenticated;
grant update (title,site,jurisdiction,scope,status,submitted_on,permit_number,next_followup) on public.job_permits to authenticated;
create policy permit_access_read on public.permit_workspace_access for select to authenticated using (
 public.has_tenant_role(tenant_id,array['owner','admin','dispatcher']::public.app_role[])
 and exists (select 1 from public.tenants t where t.id=permit_workspace_access.tenant_id and t.account_type='client')
);
create policy permit_office_pilot on public.job_permits for all to authenticated using (
 exists (select 1 from public.permit_workspace_access a where a.tenant_id=job_permits.tenant_id and a.enabled and (a.expires_at is null or a.expires_at>now()))
) with check (
 exists (select 1 from public.permit_workspace_access a where a.tenant_id=job_permits.tenant_id and a.enabled and (a.expires_at is null or a.expires_at>now()))
);
create trigger touch_updated_at before update on public.job_permits for each row execute function public.touch_updated_at();
create trigger audit_change after insert or update on public.job_permits for each row execute function public.record_audit_event();
commit;
