begin;

create function public.get_tenant_team(target uuid)
returns table(user_id uuid,email text,display_name text,role public.app_role)
language plpgsql stable security definer set search_path='' as $$
begin
 if not public.has_tenant_role(target,array['owner','admin']::public.app_role[]) then raise exception 'Team directory unavailable.' using errcode='42501'; end if;
 return query
  select m.user_id,lower(u.email),coalesce(nullif(btrim(u.raw_user_meta_data->>'full_name'),''),nullif(btrim(u.raw_user_meta_data->>'name'),''),lower(u.email),'Team member'),m.role
  from public.memberships m join auth.users u on u.id=m.user_id
  where m.tenant_id=target
  order by case m.role when 'owner' then 1 when 'admin' then 2 when 'dispatcher' then 3 when 'technician' then 4 else 5 end, lower(u.email);
end; $$;

create function public.manage_tenant_member(input jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor_id uuid; target uuid; email_value text; target_user uuid; desired_role public.app_role; existing_role public.app_role; affected integer;
begin
 actor_id:=auth.uid();
 if actor_id is null then return '{"status":"unavailable"}'; end if;
 begin
  target:=(input->>'tenant_id')::uuid;
  email_value:=lower(btrim(input->>'email'));
  desired_role:=(input->>'role')::public.app_role;
 exception when others then return '{"status":"validation_error"}'; end;
 if target is null or email_value is null or email_value='' or desired_role not in ('dispatcher'::public.app_role,'technician'::public.app_role,'viewer'::public.app_role) then return '{"status":"validation_error"}'; end if;
 if not exists(select 1 from public.memberships where tenant_id=target and user_id=actor_id and role in ('owner','admin') for share) then return '{"status":"unavailable"}'; end if;
 select id into target_user from auth.users where lower(email)=email_value and email_confirmed_at is not null and deleted_at is null for share;
 if target_user is null then return '{"status":"not_found"}'; end if;
 perform pg_advisory_xact_lock(hashtextextended('team-member-v1:'||target||':'||target_user,0));
 select role into existing_role from public.memberships where tenant_id=target and user_id=target_user for update;
 if existing_role='owner' then return '{"status":"protected_owner"}'; end if;
 if existing_role is null then
  insert into public.memberships(tenant_id,user_id,role) values(target,target_user,desired_role);
  insert into public.audit_events(tenant_id,actor_user_id,entity_type,entity_id,action) values(target,actor_id,'memberships',target_user,'INSERT');
 elsif existing_role<>desired_role then
  update public.memberships set role=desired_role where tenant_id=target and user_id=target_user;
  get diagnostics affected=row_count;
  if affected<>1 then return '{"status":"retryable_failure"}'; end if;
  insert into public.audit_events(tenant_id,actor_user_id,entity_type,entity_id,action) values(target,actor_id,'memberships',target_user,'UPDATE');
 end if;
 return jsonb_build_object('status','saved','user_id',target_user,'role',desired_role);
exception when others then return '{"status":"retryable_failure"}';
end; $$;

alter function public.get_tenant_team(uuid) owner to postgres;
alter function public.manage_tenant_member(jsonb) owner to postgres;
revoke all on function public.get_tenant_team(uuid),public.manage_tenant_member(jsonb) from public,anon,authenticated;
grant execute on function public.get_tenant_team(uuid),public.manage_tenant_member(jsonb) to authenticated;

commit;
