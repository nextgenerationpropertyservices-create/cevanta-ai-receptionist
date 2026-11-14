begin;
create table public.permit_scope_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  name text not null check (length(btrim(name)) between 1 and 100),
  permit_kind text not null default '' check (length(permit_kind) <= 80),
  scope text not null check (length(btrim(scope)) between 1 and 4000),
  updated_at timestamptz not null default now()
);
create unique index permit_scope_templates_name_idx
  on public.permit_scope_templates (tenant_id, lower(name));
create table public.permit_ahj_overrides (
  id uuid not null unique default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  ahj_id text not null check (ahj_id ~ '^[a-z0-9-]{1,80}$'),
  profile jsonb not null check (
    jsonb_typeof(profile) = 'object'
    and profile ? 'name'
    and jsonb_typeof(profile->'name') = 'string'
    and length(btrim(profile->>'name')) between 1 and 160
    and octet_length(profile::text) <= 20000
    and coalesce(profile->>'formUrl','') ~* '^(https?://|$)'
    and coalesce(profile->>'portal','') ~* '^(https?://|$)'
    and coalesce(profile->>'relatedUrl','') ~* '^(https?://|$)'
    and coalesce(profile->>'source','') ~* '^(https?://|$)'
  ),
  updated_at timestamptz not null default now(),
  primary key (tenant_id, ahj_id)
);
alter table public.permit_scope_templates enable row level security;
alter table public.permit_ahj_overrides enable row level security;
revoke all on public.permit_scope_templates,public.permit_ahj_overrides from public,anon,authenticated;
grant select,delete on public.permit_scope_templates,public.permit_ahj_overrides to authenticated;
grant insert (tenant_id,name,permit_kind,scope), update (name,permit_kind,scope) on public.permit_scope_templates to authenticated;
grant insert (tenant_id,ahj_id,profile), update (profile) on public.permit_ahj_overrides to authenticated;
create policy permit_scope_templates_office on public.permit_scope_templates for all to authenticated using (
  exists (select 1 from public.permit_workspace_access a where a.tenant_id=permit_scope_templates.tenant_id and a.enabled and (a.expires_at is null or a.expires_at>now()))
) with check (
  exists (select 1 from public.permit_workspace_access a where a.tenant_id=permit_scope_templates.tenant_id and a.enabled and (a.expires_at is null or a.expires_at>now()))
);
create policy permit_ahj_overrides_office on public.permit_ahj_overrides for all to authenticated using (
  exists (select 1 from public.permit_workspace_access a where a.tenant_id=permit_ahj_overrides.tenant_id and a.enabled and (a.expires_at is null or a.expires_at>now()))
) with check (
  exists (select 1 from public.permit_workspace_access a where a.tenant_id=permit_ahj_overrides.tenant_id and a.enabled and (a.expires_at is null or a.expires_at>now()))
);
create trigger touch_updated_at before update on public.permit_scope_templates for each row execute function public.touch_updated_at();
create trigger touch_updated_at before update on public.permit_ahj_overrides for each row execute function public.touch_updated_at();
create trigger audit_change after insert or update or delete on public.permit_scope_templates for each row execute function public.record_audit_event();
create trigger audit_change after insert or update or delete on public.permit_ahj_overrides for each row execute function public.record_audit_event();
commit;

