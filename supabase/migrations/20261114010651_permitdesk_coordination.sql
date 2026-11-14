begin;

create table public.permit_coordination_notes (
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid not null references public.tenants(id) on delete cascade,
 permit_id uuid not null,
 source_message text not null check (length(btrim(source_message)) between 1 and 20000),
 extracted_reference text not null default '' check (length(extracted_reference)<=160),
 extracted_date date,
 suggested_status text not null default 'Needs office review' check (length(suggested_status)<=120),
 draft_subject text not null default '' check (length(draft_subject)<=200),
 draft_body text not null default '' check (length(draft_body)<=4000),
 created_at timestamptz not null default now(),
 foreign key (tenant_id,permit_id) references public.job_permits(tenant_id,id) on delete cascade
);
create index permit_coordination_notes_tenant_time on public.permit_coordination_notes(tenant_id,created_at desc);
alter table public.permit_coordination_notes enable row level security;
revoke all on public.permit_coordination_notes from public,anon,authenticated;
grant select,insert on public.permit_coordination_notes to authenticated;
create policy permit_coordination_active_member on public.permit_coordination_notes for all to authenticated using (
 exists (select 1 from public.permit_workspace_access a join public.tenants t on t.id=a.tenant_id where a.tenant_id=permit_coordination_notes.tenant_id and a.enabled and (a.expires_at is null or a.expires_at>now()) and t.account_type='client' and exists (select 1 from public.memberships m where m.tenant_id=a.tenant_id and m.user_id=auth.uid() and m.role in ('owner','admin','dispatcher')))
) with check (tenant_id in (select tenant_id from public.job_permits where id=permit_coordination_notes.permit_id));
create trigger audit_coordination_note after insert on public.permit_coordination_notes for each row execute function public.record_audit_event();
commit;
