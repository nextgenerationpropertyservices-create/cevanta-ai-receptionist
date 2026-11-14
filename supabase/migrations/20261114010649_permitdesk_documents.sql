alter table public.job_permits add constraint job_permits_tenant_id_id_key unique (tenant_id, id);

create table public.permit_documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  permit_id uuid not null,
  label text not null check (char_length(btrim(label)) between 1 and 120),
  category text not null check (category in ('application', 'plan', 'credential', 'photo', 'other')),
  filename text,
  content bytea,
  include_in_packet boolean not null default false,
  created_at timestamptz not null default now(),
  foreign key (tenant_id, permit_id) references public.job_permits (tenant_id, id) on delete cascade,
  check ((filename is null and content is null) or
    (filename is not null and content is not null and char_length(filename) between 1 and 150
      and octet_length(content) between 1 and 2097152))
);

create index permit_documents_parent_idx on public.permit_documents (tenant_id, permit_id);
alter table public.permit_documents enable row level security;
revoke all on public.permit_documents from public, anon, authenticated;
grant select, delete on public.permit_documents to authenticated;
grant update (include_in_packet) on public.permit_documents to authenticated;
grant insert (tenant_id, permit_id, label, category, filename, content, include_in_packet)
  on public.permit_documents to authenticated;

create policy permit_documents_read on public.permit_documents for select to authenticated using (
  exists (select 1 from public.job_permits p where p.id = permit_id and p.tenant_id = permit_documents.tenant_id)
);
create policy permit_documents_insert on public.permit_documents for insert to authenticated with check (
  exists (select 1 from public.job_permits p where p.id = permit_id and p.tenant_id = permit_documents.tenant_id)
);
create policy permit_documents_delete on public.permit_documents for delete to authenticated using (
  exists (select 1 from public.job_permits p where p.id = permit_id and p.tenant_id = permit_documents.tenant_id)
);
create policy permit_documents_packet on public.permit_documents for update to authenticated using (
  exists (select 1 from public.job_permits p where p.id = permit_id and p.tenant_id = permit_documents.tenant_id)
);
