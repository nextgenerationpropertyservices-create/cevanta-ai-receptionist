begin;

alter table public.appointments
  add constraint appointments_tenant_id_unique unique (tenant_id, id);

create table public.reactivation_campaigns (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  name text not null check (length(btrim(name)) between 1 and 160),
  season text not null check (season in ('spring','fall','custom')),
  channel text not null check (channel in ('email','sms','both')),
  trigger_type text not null check (trigger_type in ('seasonal','weather','manual')),
  weather_trigger text check (weather_trigger is null or length(btrim(weather_trigger)) between 1 and 240),
  status text not null default 'draft' check (status in ('draft','review','approved','paused','completed')),
  created_by uuid not null references auth.users(id),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.reactivation_campaigns
  add constraint reactivation_campaigns_tenant_id_unique unique (tenant_id, id);

create index reactivation_campaigns_tenant_created_idx on public.reactivation_campaigns(tenant_id, created_at desc);

create table public.reactivation_candidates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  campaign_id uuid not null,
  customer_id uuid not null,
  lead_id uuid,
  last_service_at date,
  reason text not null check (length(btrim(reason)) between 1 and 800),
  channel text not null check (channel in ('email','sms','both')),
  subject text not null check (length(btrim(subject)) between 1 and 240),
  message text not null check (length(btrim(message)) between 1 and 4000),
  status text not null default 'draft' check (status in ('draft','approved','dismissed','scheduled','booked')),
  preferred_date date,
  preferred_time text check (preferred_time is null or length(btrim(preferred_time)) between 1 and 40),
  job_id uuid,
  appointment_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id, campaign_id, customer_id),
  foreign key (tenant_id, campaign_id) references public.reactivation_campaigns(tenant_id, id) on delete cascade,
  foreign key (tenant_id, customer_id) references public.customers(tenant_id, id),
  foreign key (tenant_id, lead_id) references public.leads(tenant_id, id),
  foreign key (tenant_id, job_id) references public.jobs(tenant_id, id),
  foreign key (tenant_id, appointment_id) references public.appointments(tenant_id, id)
);

create index reactivation_candidates_tenant_status_idx on public.reactivation_candidates(tenant_id, status, created_at desc);
create index reactivation_candidates_tenant_customer_idx on public.reactivation_candidates(tenant_id, customer_id);

alter table public.reactivation_campaigns enable row level security;
alter table public.reactivation_candidates enable row level security;

create policy reactivation_campaign_read on public.reactivation_campaigns
  for select to authenticated using (public.has_tenant_role(tenant_id));
create policy reactivation_campaign_insert on public.reactivation_campaigns
  for insert to authenticated with check (public.has_tenant_role(tenant_id, array['owner','admin','dispatcher']::public.app_role[]));
create policy reactivation_campaign_update on public.reactivation_campaigns
  for update to authenticated using (public.has_tenant_role(tenant_id, array['owner','admin','dispatcher']::public.app_role[]))
  with check (public.has_tenant_role(tenant_id, array['owner','admin','dispatcher']::public.app_role[]));

create policy reactivation_candidate_read on public.reactivation_candidates
  for select to authenticated using (public.has_tenant_role(tenant_id));
create policy reactivation_candidate_insert on public.reactivation_candidates
  for insert to authenticated with check (public.has_tenant_role(tenant_id, array['owner','admin','dispatcher']::public.app_role[]));
create policy reactivation_candidate_update on public.reactivation_candidates
  for update to authenticated using (public.has_tenant_role(tenant_id, array['owner','admin','dispatcher']::public.app_role[]))
  with check (public.has_tenant_role(tenant_id, array['owner','admin','dispatcher']::public.app_role[]));

revoke all on public.reactivation_campaigns, public.reactivation_candidates from public, anon, authenticated;
grant select on public.reactivation_campaigns, public.reactivation_candidates to authenticated;
grant insert(tenant_id,name,season,channel,trigger_type,weather_trigger,status,created_by) on public.reactivation_campaigns to authenticated;
grant update(name,season,channel,trigger_type,weather_trigger,status,approved_by,approved_at) on public.reactivation_campaigns to authenticated;
grant insert(tenant_id,campaign_id,customer_id,lead_id,last_service_at,reason,channel,subject,message,status) on public.reactivation_candidates to authenticated;
grant update(status,preferred_date,preferred_time,job_id,appointment_id) on public.reactivation_candidates to authenticated;

create trigger touch_reactivation_campaign_updated_at before update on public.reactivation_campaigns
  for each row execute function public.touch_updated_at();
create trigger touch_reactivation_candidate_updated_at before update on public.reactivation_candidates
  for each row execute function public.touch_updated_at();
create trigger audit_reactivation_campaign_change after insert or update or delete on public.reactivation_campaigns
  for each row execute function public.record_audit_event();
create trigger audit_reactivation_candidate_change after insert or update or delete on public.reactivation_candidates
  for each row execute function public.record_audit_event();

create function public.schedule_reactivation_visit(
  target_tenant uuid,
  target_candidate uuid,
  target_date date,
  target_starts_at timestamptz,
  target_ends_at timestamptz
) returns table(job_id uuid, appointment_id uuid)
language plpgsql security definer set search_path = '' as $$
declare
  candidate_row public.reactivation_candidates%rowtype;
  new_job_id uuid;
  new_appointment_id uuid;
begin
  if not public.has_tenant_role(target_tenant, array['owner','admin','dispatcher']::public.app_role[]) then
    raise exception 'Reactivation scheduling is unavailable.' using errcode = '42501';
  end if;
  select * into candidate_row from public.reactivation_candidates
    where tenant_id = target_tenant and id = target_candidate for update;
  if not found then raise exception 'Reactivation candidate is unavailable.' using errcode = 'P0002'; end if;
  if candidate_row.status <> 'approved' then raise exception 'Approve the reactivation message before scheduling.' using errcode = '42501'; end if;
  if target_ends_at <= target_starts_at then raise exception 'The visit end must be after the start.' using errcode = '22023'; end if;
  insert into public.jobs(tenant_id,submission_id,lead_id,customer_id,service_location_id,assigned_user_id,title,description,status,priority,scheduled_date)
    values(target_tenant,gen_random_uuid(),candidate_row.lead_id,candidate_row.customer_id,null,null,'Seasonal maintenance visit',candidate_row.message,'scheduled','normal',target_date)
    returning id into new_job_id;
  insert into public.appointments(tenant_id,job_id,submission_id,title,starts_at,ends_at,status)
    values(target_tenant,new_job_id,gen_random_uuid(),'Seasonal maintenance visit',target_starts_at,target_ends_at,'scheduled')
    returning id into new_appointment_id;
  update public.reactivation_candidates set status='booked',preferred_date=target_date,job_id=new_job_id,appointment_id=new_appointment_id
    where tenant_id=target_tenant and id=target_candidate;
  return query select new_job_id,new_appointment_id;
end;
$$;
revoke all on function public.schedule_reactivation_visit(uuid,uuid,date,timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.schedule_reactivation_visit(uuid,uuid,date,timestamptz,timestamptz) to authenticated;

commit;
