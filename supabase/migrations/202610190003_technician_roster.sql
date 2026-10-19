begin;

create table public.technician_roster (
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid not null references public.tenants(id) on delete cascade,
 display_name text not null check(length(btrim(display_name)) between 1 and 160),
 email text,
 linked_user_id uuid,
 skills text[] not null default '{}',
 service_areas text[] not null default '{}',
 availability_note text not null default '',
 availability_windows jsonb not null default '[]'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(tenant_id,id),
 unique(tenant_id,linked_user_id),
 foreign key(tenant_id,linked_user_id) references public.memberships(tenant_id,user_id) on delete set null,
 check(email is null or (email=btrim(lower(email)) and length(email)<=254)),
 check(cardinality(skills)<=20),
 check(public.valid_technician_service_areas(service_areas)),
 check(public.valid_technician_availability_windows(availability_windows))
);

create index technician_roster_tenant_idx on public.technician_roster(tenant_id,created_at desc);
create index technician_roster_linked_user_idx on public.technician_roster(tenant_id,linked_user_id);

create trigger technician_roster_touch_updated_at before update on public.technician_roster for each row execute function public.touch_updated_at();
create trigger technician_roster_audit after insert or update or delete on public.technician_roster for each row execute function public.record_audit_event();

alter table public.technician_roster enable row level security;
create policy technician_roster_read on public.technician_roster for select to authenticated using(public.has_tenant_role(tenant_id,array['owner','admin']::public.app_role[]));
create policy technician_roster_insert on public.technician_roster for insert to authenticated with check(public.has_tenant_role(tenant_id,array['owner','admin']::public.app_role[]));
create policy technician_roster_update on public.technician_roster for update to authenticated using(public.has_tenant_role(tenant_id,array['owner','admin']::public.app_role[])) with check(public.has_tenant_role(tenant_id,array['owner','admin']::public.app_role[]));
create policy technician_roster_delete on public.technician_roster for delete to authenticated using(public.has_tenant_role(tenant_id,array['owner','admin']::public.app_role[]));

revoke all on public.technician_roster from public,anon,authenticated;
grant select,insert,update,delete on public.technician_roster to authenticated;

-- Link a prepared roster entry to a confirmed account without exposing auth.users.
create function public.link_technician_roster(input jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 actor_id uuid := auth.uid(); target uuid; roster_id uuid; email_value text; target_user uuid; existing_role public.app_role; roster_row public.technician_roster%rowtype;
begin
 if actor_id is null then return jsonb_build_object('status','unavailable'); end if;
 begin
  target := (input->>'tenant_id')::uuid;
  roster_id := (input->>'roster_id')::uuid;
  email_value := lower(btrim(input->>'email'));
 exception when others then return jsonb_build_object('status','validation_error'); end;
 if target is null or roster_id is null or email_value is null or email_value='' or length(email_value)>254 then return jsonb_build_object('status','validation_error'); end if;
 if not public.has_tenant_role(target,array['owner','admin']::public.app_role[]) then return jsonb_build_object('status','unavailable'); end if;
 select * into roster_row from public.technician_roster where tenant_id=target and id=roster_id for update;
 if not found then return jsonb_build_object('status','not_found'); end if;
 select id into target_user from auth.users where lower(email)=email_value and email_confirmed_at is not null and deleted_at is null for share;
 if target_user is null then return jsonb_build_object('status','account_not_found'); end if;
 select role into existing_role from public.memberships where tenant_id=target and user_id=target_user for update;
 if existing_role='owner' or existing_role='admin' then return jsonb_build_object('status','protected_account'); end if;
 if existing_role is null then
  insert into public.memberships(tenant_id,user_id,role) values(target,target_user,'technician');
 else
  update public.memberships set role='technician' where tenant_id=target and user_id=target_user;
 end if;
 update public.technician_roster set email=email_value,linked_user_id=target_user where tenant_id=target and id=roster_id;
 insert into public.technician_profiles(tenant_id,user_id,skills,service_areas,availability_note,availability_windows)
 values(target,target_user,roster_row.skills,roster_row.service_areas,roster_row.availability_note,roster_row.availability_windows)
 on conflict(tenant_id,user_id) do update set skills=excluded.skills,service_areas=excluded.service_areas,availability_note=excluded.availability_note,availability_windows=excluded.availability_windows;
 return jsonb_build_object('status','linked','user_id',target_user);
exception when unique_violation then return jsonb_build_object('status','already_linked');
 when others then return jsonb_build_object('status','retryable_failure');
end; $$;

alter function public.link_technician_roster(jsonb) owner to postgres;
revoke all on function public.link_technician_roster(jsonb) from public,anon,authenticated;
grant execute on function public.link_technician_roster(jsonb) to authenticated;

commit;