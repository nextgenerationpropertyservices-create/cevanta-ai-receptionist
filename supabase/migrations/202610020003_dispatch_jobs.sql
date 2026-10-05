begin;
alter table public.leads add constraint leads_tenant_id_unique unique(tenant_id,id);
alter table public.service_locations add constraint locations_tenant_customer_id_unique unique(tenant_id,customer_id,id);
create table public.jobs (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id), submission_id uuid not null,
 lead_id uuid, customer_id uuid, service_location_id uuid, assigned_user_id uuid,
 title text not null check(length(btrim(title)) between 1 and 160), description text not null check(length(btrim(description)) between 1 and 4000),
 status text not null default 'new' check(status in ('new','scheduled','in_progress','completed','cancelled')),
 priority text not null default 'normal' check(priority in ('low','normal','high','urgent')), scheduled_date date,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(tenant_id,submission_id), unique(tenant_id,lead_id),
 check(status <> 'scheduled' or scheduled_date is not null),
 check(service_location_id is null or customer_id is not null),
 foreign key(tenant_id,lead_id) references public.leads(tenant_id,id),
 foreign key(tenant_id,customer_id) references public.customers(tenant_id,id),
 foreign key(tenant_id,customer_id,service_location_id) references public.service_locations(tenant_id,customer_id,id),
 foreign key(tenant_id,assigned_user_id) references public.memberships(tenant_id,user_id)
);
create index jobs_tenant_schedule_idx on public.jobs(tenant_id,scheduled_date);
create function public.validate_job_assignment() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.assigned_user_id is not null then
  perform 1 from public.memberships where tenant_id=new.tenant_id and user_id=new.assigned_user_id and role='technician' for share;
  if not found then raise exception 'Invalid technician assignment.' using errcode='23514'; end if;
 end if;
 if new.lead_id is not null and exists(select 1 from public.leads where tenant_id=new.tenant_id and id=new.lead_id and customer_id is not null and customer_id is distinct from new.customer_id) then
  raise exception 'Invalid lead customer link.' using errcode='23514';
 end if;
 return new;
end; $$;
create function public.clear_removed_job_assignment() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if TG_OP='DELETE' or new.role <> 'technician' then
  update public.jobs set assigned_user_id=null where tenant_id=old.tenant_id and assigned_user_id=old.user_id;
 end if;
 if TG_OP='DELETE' then return old; end if; return new;
end; $$;
create function public.get_tenant_technicians(target uuid) returns table(user_id uuid,display_name text) language plpgsql stable security definer set search_path='' as $$
begin
 if not public.has_tenant_role(target,array['owner','admin','dispatcher']::public.app_role[]) then raise exception 'Directory unavailable.' using errcode='42501'; end if;
 return query select m.user_id,coalesce(nullif(btrim(u.raw_user_meta_data->>'full_name'),''),nullif(btrim(u.raw_user_meta_data->>'name'),''),nullif(u.email,''),'Technician') from public.memberships m join auth.users u on u.id=m.user_id where m.tenant_id=target and m.role='technician' order by m.user_id;
end; $$;
revoke all on function public.validate_job_assignment(),public.clear_removed_job_assignment(),public.get_tenant_technicians(uuid) from public,anon,authenticated;
grant execute on function public.get_tenant_technicians(uuid) to authenticated;
create trigger validate_assignment before insert or update on public.jobs for each row execute function public.validate_job_assignment();
create trigger clear_job_assignment before delete or update of role on public.memberships for each row execute function public.clear_removed_job_assignment();
alter table public.jobs enable row level security;
create policy job_read on public.jobs for select to authenticated using(public.has_tenant_role(tenant_id,array['owner','admin','dispatcher','viewer']::public.app_role[]) or (assigned_user_id=(select auth.uid()) and public.has_tenant_role(tenant_id,array['technician']::public.app_role[])));
create policy job_insert on public.jobs for insert to authenticated with check(public.has_tenant_role(tenant_id,array['owner','admin','dispatcher']::public.app_role[]));
create policy job_update on public.jobs for update to authenticated using(public.has_tenant_role(tenant_id,array['owner','admin','dispatcher']::public.app_role[])) with check(public.has_tenant_role(tenant_id,array['owner','admin','dispatcher']::public.app_role[]));
revoke all on public.jobs from public,anon,authenticated;
grant select on public.jobs to authenticated;
grant insert(tenant_id,submission_id,lead_id,customer_id,service_location_id,assigned_user_id,title,description,status,priority,scheduled_date) on public.jobs to authenticated;
grant update(assigned_user_id,title,description,status,priority,scheduled_date) on public.jobs to authenticated;
create trigger touch_updated_at before update on public.jobs for each row execute function public.touch_updated_at();
create trigger audit_change after insert or update or delete on public.jobs for each row execute function public.record_audit_event();
commit;


