-- CEV-PROJECT-AUDIT-167K: harden unreleased Reactivation reads and state transitions.
begin;

create schema if not exists reactivation_private;
revoke all on schema reactivation_private from public, anon, authenticated;

create table reactivation_private.campaign_command_receipts (
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  request_id uuid not null,
  input_digest bytea not null check (octet_length(input_digest) = 32),
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  campaign_id uuid not null,
  created_at timestamptz not null default now() check (isfinite(created_at)),
  primary key (tenant_id, request_id),
  foreign key (tenant_id, campaign_id) references public.reactivation_campaigns(tenant_id, id) on delete restrict
);
alter table reactivation_private.campaign_command_receipts enable row level security;
revoke all on reactivation_private.campaign_command_receipts from public, anon, authenticated;

alter table public.reactivation_candidates
  add column reviewed_by uuid references auth.users(id) on delete restrict,
  add column reviewed_at timestamptz,
  add column scheduled_by uuid references auth.users(id) on delete restrict,
  add column scheduled_at timestamptz,
  add constraint reactivation_candidates_review_attribution_pair
    check ((reviewed_by is null) = (reviewed_at is null)),
  add constraint reactivation_candidates_schedule_attribution_pair
    check ((scheduled_by is null) = (scheduled_at is null)),
  add constraint reactivation_candidates_reviewed_at_finite
    check (reviewed_at is null or isfinite(reviewed_at)),
  add constraint reactivation_candidates_scheduled_at_finite
    check (scheduled_at is null or isfinite(scheduled_at));

create or replace function public.has_reactivation_office_access(target uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor_id uuid;
begin
  select actor into actor_id from onboarding_private.current_identity();
  if actor_id is null then
    return false;
  end if;
  return exists (
    select 1
    from public.memberships m
    where m.user_id = actor_id
      and m.tenant_id = target
      and m.role in ('owner', 'admin', 'dispatcher')
  );
end;
$$;
alter function public.has_reactivation_office_access(uuid) owner to postgres;
revoke all on function public.has_reactivation_office_access(uuid) from public, anon, authenticated;
grant execute on function public.has_reactivation_office_access(uuid) to authenticated;

drop policy if exists reactivation_campaign_read on public.reactivation_campaigns;
drop policy if exists reactivation_campaign_insert on public.reactivation_campaigns;
drop policy if exists reactivation_campaign_update on public.reactivation_campaigns;
drop policy if exists reactivation_candidate_read on public.reactivation_candidates;
drop policy if exists reactivation_candidate_insert on public.reactivation_candidates;
drop policy if exists reactivation_candidate_update on public.reactivation_candidates;

create policy reactivation_campaign_office_read on public.reactivation_campaigns
  for select to authenticated using (public.has_reactivation_office_access(tenant_id));
create policy reactivation_candidate_office_read on public.reactivation_candidates
  for select to authenticated using (public.has_reactivation_office_access(tenant_id));

revoke all on public.reactivation_campaigns, public.reactivation_candidates from public, anon, authenticated;
grant select on public.reactivation_campaigns, public.reactivation_candidates to authenticated;

create or replace function public.create_reactivation_campaign(input jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid;
  target_tenant_id uuid;
  request uuid;
  campaign_name text;
  campaign_season text;
  campaign_channel text;
  campaign_trigger text;
  campaign_weather text;
  input_candidates jsonb;
  normalized_candidates jsonb := '[]'::jsonb;
  normalized_candidate jsonb;
  candidate jsonb;
  candidate_customer_id uuid;
  candidate_lead_id uuid;
  candidate_last_service_at date;
  candidate_reason text;
  candidate_subject text;
  candidate_message text;
  candidate_count integer := 0;
  normalized_input jsonb;
  digest bytea;
  receipt reactivation_private.campaign_command_receipts%rowtype;
  new_campaign_id uuid;
  new_campaign_status text;
begin
  select actor into actor_id from onboarding_private.current_identity();
  if actor_id is null then
    raise exception 'Reactivation command is unavailable.' using errcode = '42501';
  end if;
  if input is null or onboarding_private.input_size(input) > 1048576 then
    raise exception 'invalid_input' using errcode = '22023';
  end if;

  perform onboarding_private.require_keys(
    input,
    array['tenant_id','request_id','name','season','channel','trigger_type','weather_trigger','candidates'],
    'input'
  );
  target_tenant_id := onboarding_private.input_uuid(input->'tenant_id', 'tenant_id');
  request := onboarding_private.input_uuid(input->'request_id', 'request_id');
  if not public.has_reactivation_office_access(target_tenant_id) then
    raise exception 'Reactivation command is unavailable.' using errcode = '42501';
  end if;

  campaign_name := onboarding_private.input_text(input->'name', 1, 160, 'name');
  campaign_season := onboarding_private.input_text(input->'season', 1, 20, 'season');
  campaign_channel := onboarding_private.input_text(input->'channel', 1, 20, 'channel');
  campaign_trigger := onboarding_private.input_text(input->'trigger_type', 1, 20, 'trigger_type');
  campaign_weather := case
    when input->'weather_trigger' = 'null'::jsonb then null
    else onboarding_private.input_text(input->'weather_trigger', 1, 240, 'weather_trigger')
  end;
  if campaign_season not in ('spring','fall','custom')
     or campaign_channel not in ('email','sms','both')
     or campaign_trigger not in ('seasonal','weather','manual')
     or (campaign_trigger = 'weather' and campaign_weather is null) then
    raise exception 'invalid_campaign' using errcode = '22023';
  end if;

  input_candidates := input->'candidates';
  if jsonb_typeof(input_candidates) <> 'array' or jsonb_array_length(input_candidates) > 250 then
    raise exception 'invalid_candidates' using errcode = '22023';
  end if;
  for candidate in select value from jsonb_array_elements(input_candidates) loop
    perform onboarding_private.require_keys(
      candidate,
      array['customer_id','lead_id','last_service_at','reason','subject','message'],
      'candidates'
    );
    candidate_customer_id := onboarding_private.input_uuid(candidate->'customer_id', 'candidates.customer_id');
    candidate_lead_id := case
      when candidate->'lead_id' = 'null'::jsonb then null
      else onboarding_private.input_uuid(candidate->'lead_id', 'candidates.lead_id')
    end;
    candidate_last_service_at := case
      when candidate->'last_service_at' = 'null'::jsonb then null
      else onboarding_private.input_date(candidate->'last_service_at', 'candidates.last_service_at')
    end;
    candidate_reason := onboarding_private.input_text(candidate->'reason', 1, 800, 'candidates.reason');
    candidate_subject := onboarding_private.input_text(candidate->'subject', 1, 240, 'candidates.subject');
    candidate_message := onboarding_private.input_text(candidate->'message', 1, 4000, 'candidates.message');
    normalized_candidate := jsonb_build_object(
      'customer_id', candidate_customer_id,
      'lead_id', candidate_lead_id,
      'last_service_at', candidate_last_service_at,
      'reason', candidate_reason,
      'subject', candidate_subject,
      'message', candidate_message
    );
    normalized_candidates := normalized_candidates || jsonb_build_array(normalized_candidate);
  end loop;

  normalized_input := jsonb_build_object(
    'tenant_id', target_tenant_id,
    'request_id', request,
    'name', campaign_name,
    'season', campaign_season,
    'channel', campaign_channel,
    'trigger_type', campaign_trigger,
    'weather_trigger', campaign_weather,
    'candidates', normalized_candidates
  );
  digest := sha256(convert_to(onboarding_private.canonical_json(jsonb_build_object(
    'contract_version', 'reactivation-campaign-v1',
    'actor_user_id', actor_id,
    'input', normalized_input
  )), 'UTF8'));

  perform pg_advisory_xact_lock(hashtextextended('reactivation-campaign-v1:' || target_tenant_id || ':' || request, 0));
  select * into receipt
  from reactivation_private.campaign_command_receipts
  where tenant_id = target_tenant_id and request_id = request;
  if found then
    if receipt.actor_user_id <> actor_id or receipt.input_digest <> digest then
      return jsonb_build_object('status','conflict','reason','request_reuse');
    end if;
    return jsonb_build_object(
      'status', 'replayed',
      'campaign_id', receipt.campaign_id,
      'campaign_status', (select status from public.reactivation_campaigns where tenant_id=target_tenant_id and id=receipt.campaign_id),
      'candidate_count', (select count(*) from public.reactivation_candidates where tenant_id=target_tenant_id and campaign_id=receipt.campaign_id)
    );
  end if;

  insert into public.reactivation_campaigns(
    tenant_id, name, season, channel, trigger_type, weather_trigger, status, created_by
  ) values (
    target_tenant_id, campaign_name, campaign_season, campaign_channel, campaign_trigger, campaign_weather, 'draft', actor_id
  ) returning id into new_campaign_id;

  for candidate in select value from jsonb_array_elements(normalized_candidates) loop
    candidate_customer_id := (candidate->>'customer_id')::uuid;
    candidate_lead_id := nullif(candidate->>'lead_id', '')::uuid;
    if not exists (
      select 1 from public.customers
      where tenant_id = target_tenant_id and id = candidate_customer_id
    ) then
      raise exception 'invalid_customer' using errcode = '22023';
    end if;
    if candidate_lead_id is not null and not exists (
      select 1 from public.leads
      where tenant_id = target_tenant_id and id = candidate_lead_id and customer_id = candidate_customer_id
    ) then
      raise exception 'invalid_lead' using errcode = '22023';
    end if;
    insert into public.reactivation_candidates(
      tenant_id, campaign_id, customer_id, lead_id, last_service_at,
      reason, channel, subject, message, status
    ) values (
      target_tenant_id,
      new_campaign_id,
      candidate_customer_id,
      candidate_lead_id,
      nullif(candidate->>'last_service_at', '')::date,
      candidate->>'reason',
      campaign_channel,
      candidate->>'subject',
      candidate->>'message',
      'draft'
    );
    candidate_count := candidate_count + 1;
  end loop;

  new_campaign_status := case when candidate_count > 0 then 'review' else 'draft' end;
  if new_campaign_status = 'review' then
    update public.reactivation_campaigns
    set status = 'review'
    where tenant_id = target_tenant_id and id = new_campaign_id;
  end if;
  insert into reactivation_private.campaign_command_receipts(
    tenant_id, request_id, input_digest, actor_user_id, campaign_id
  ) values (
    target_tenant_id, request, digest, actor_id, new_campaign_id
  );

  return jsonb_build_object(
    'status', 'saved',
    'campaign_id', new_campaign_id,
    'campaign_status', new_campaign_status,
    'candidate_count', candidate_count
  );
end;
$$;

create or replace function public.review_reactivation_candidate(input jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid;
  target_tenant_id uuid;
  target_candidate_id uuid;
  decision text;
  candidate_row public.reactivation_candidates%rowtype;
  next_status text;
begin
  select actor into actor_id from onboarding_private.current_identity();
  if actor_id is null then
    raise exception 'Reactivation command is unavailable.' using errcode = '42501';
  end if;
  if input is null or onboarding_private.input_size(input) > 1048576 then
    raise exception 'invalid_input' using errcode = '22023';
  end if;
  perform onboarding_private.require_keys(input, array['tenant_id','candidate_id','decision'], 'input');
  target_tenant_id := onboarding_private.input_uuid(input->'tenant_id', 'tenant_id');
  target_candidate_id := onboarding_private.input_uuid(input->'candidate_id', 'candidate_id');
  decision := onboarding_private.input_text(input->'decision', 1, 20, 'decision');
  if decision not in ('approve','dismiss') or not public.has_reactivation_office_access(target_tenant_id) then
    raise exception 'Reactivation command is unavailable.' using errcode = '42501';
  end if;

  select * into candidate_row
  from public.reactivation_candidates
  where tenant_id = target_tenant_id and id = target_candidate_id
  for update;
  if not found then
    raise exception 'Reactivation candidate is unavailable.' using errcode = '42501';
  end if;
  if decision = 'approve' and candidate_row.status = 'draft' then
    next_status := 'approved';
  elsif decision = 'dismiss' and candidate_row.status in ('draft','approved') then
    next_status := 'dismissed';
  else
    raise exception 'Reactivation candidate is unavailable.' using errcode = '42501';
  end if;

  update public.reactivation_candidates
  set status = next_status, reviewed_by = actor_id, reviewed_at = now()
  where tenant_id = target_tenant_id and id = target_candidate_id;
  return jsonb_build_object('status','saved','candidate_id',target_candidate_id,'candidate_status',next_status);
end;
$$;

create or replace function public.schedule_reactivation_visit(
  target_tenant uuid,
  target_candidate uuid,
  target_date date,
  target_starts_at timestamptz,
  target_ends_at timestamptz
) returns table(job_id uuid, appointment_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid;
  candidate_row public.reactivation_candidates%rowtype;
  new_job_id uuid;
  new_appointment_id uuid;
begin
  select actor into actor_id from onboarding_private.current_identity();
  if actor_id is null or not public.has_reactivation_office_access(target_tenant) then
    raise exception 'Reactivation scheduling is unavailable.' using errcode = '42501';
  end if;
  if target_tenant is null or target_candidate is null or target_date is null
     or target_starts_at is null or target_ends_at is null
     or target_starts_at <= now()
     or target_ends_at <= target_starts_at
     or target_ends_at > target_starts_at + interval '24 hours' then
    raise exception 'The visit time is invalid.' using errcode = '22023';
  end if;
  select * into candidate_row
  from public.reactivation_candidates
  where tenant_id = target_tenant and id = target_candidate
  for update;
  if not found or candidate_row.status <> 'approved' then
    raise exception 'Reactivation candidate is unavailable.' using errcode = '42501';
  end if;

  insert into public.jobs(
    tenant_id,submission_id,lead_id,customer_id,service_location_id,
    assigned_user_id,title,description,status,priority,scheduled_date
  ) values (
    target_tenant,gen_random_uuid(),candidate_row.lead_id,candidate_row.customer_id,null,
    null,'Seasonal maintenance visit',candidate_row.message,'scheduled','normal',target_date
  ) returning id into new_job_id;
  insert into public.appointments(tenant_id,job_id,submission_id,title,starts_at,ends_at,status)
  values (
    target_tenant,new_job_id,gen_random_uuid(),'Seasonal maintenance visit',
    target_starts_at,target_ends_at,'scheduled'
  ) returning id into new_appointment_id;
  update public.reactivation_candidates
  set status='booked', preferred_date=target_date, job_id=new_job_id,
      appointment_id=new_appointment_id, scheduled_by=actor_id, scheduled_at=now()
  where tenant_id=target_tenant and id=target_candidate;
  return query select new_job_id,new_appointment_id;
end;
$$;

alter function public.create_reactivation_campaign(jsonb) owner to postgres;
alter function public.review_reactivation_candidate(jsonb) owner to postgres;
alter function public.schedule_reactivation_visit(uuid,uuid,date,timestamptz,timestamptz) owner to postgres;
revoke all on function public.create_reactivation_campaign(jsonb) from public, anon, authenticated;
revoke all on function public.review_reactivation_candidate(jsonb) from public, anon, authenticated;
revoke all on function public.schedule_reactivation_visit(uuid,uuid,date,timestamptz,timestamptz) from public, anon, authenticated;
grant execute on function public.create_reactivation_campaign(jsonb) to authenticated;
grant execute on function public.review_reactivation_candidate(jsonb) to authenticated;
grant execute on function public.schedule_reactivation_visit(uuid,uuid,date,timestamptz,timestamptz) to authenticated;

commit;
