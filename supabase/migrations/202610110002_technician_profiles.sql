begin;

create table public.technician_profiles (
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid not null,
 user_id uuid not null,
 skills text[] not null default '{}',
 availability_note text not null default '',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(tenant_id,user_id),
 foreign key(tenant_id,user_id) references public.memberships(tenant_id,user_id) on delete cascade,
 check(cardinality(skills) <= 20),
 check(length(availability_note) <= 500)
);

create index technician_profiles_tenant_idx on public.technician_profiles(tenant_id);
create index technician_profiles_user_idx on public.technician_profiles(user_id);

create function public.validate_technician_profile() returns trigger language plpgsql security definer set search_path='' as $$
begin
 perform 1 from public.memberships where tenant_id=new.tenant_id and user_id=new.user_id and role='technician' for share;
 if not found then raise exception 'Technician profile must belong to an active technician.' using errcode='23514'; end if;
 return new;
end; $$;

revoke all on function public.validate_technician_profile() from public,anon,authenticated;
create trigger validate_technician_profile before insert or update on public.technician_profiles for each row execute function public.validate_technician_profile();
create trigger touch_updated_at before update on public.technician_profiles for each row execute function public.touch_updated_at();
create trigger audit_change after insert or update or delete on public.technician_profiles for each row execute function public.record_audit_event();

alter table public.technician_profiles enable row level security;
create policy technician_profiles_read on public.technician_profiles for select to authenticated using(
 public.has_tenant_role(tenant_id,array['owner','admin','dispatcher']::public.app_role[])
 or (user_id=(select auth.uid()) and public.has_tenant_role(tenant_id,array['technician']::public.app_role[]))
);
create policy technician_profiles_insert on public.technician_profiles for insert to authenticated with check(public.has_tenant_role(tenant_id,array['owner','admin']::public.app_role[]));
create policy technician_profiles_update on public.technician_profiles for update to authenticated using(public.has_tenant_role(tenant_id,array['owner','admin']::public.app_role[])) with check(public.has_tenant_role(tenant_id,array['owner','admin']::public.app_role[]));

revoke all on public.technician_profiles from public,anon,authenticated;
grant select on public.technician_profiles to authenticated;
grant insert(tenant_id,user_id,skills,availability_note) on public.technician_profiles to authenticated;
grant update(skills,availability_note) on public.technician_profiles to authenticated;

commit;

