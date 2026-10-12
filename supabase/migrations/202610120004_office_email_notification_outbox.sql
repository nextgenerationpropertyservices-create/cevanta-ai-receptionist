begin;

create table integration_private.office_notification_outbox (
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid not null references public.tenants(id) on delete cascade,
 lead_id uuid not null,
 channel text not null check(channel in ('email')),
 reason text not null check(reason in ('new_ai_lead_office_review')),
 status text not null default 'prepared_not_sent' check(status in ('prepared_not_sent','sent','failed','skipped')),
 subject text not null check(length(subject) between 1 and 160),
 created_at timestamptz not null default now(),
 unique(tenant_id,lead_id,channel,reason),
 foreign key(tenant_id,lead_id) references public.leads(tenant_id,id) on delete cascade,
 check(isfinite(created_at))
);

alter table integration_private.office_notification_outbox enable row level security;
revoke all on integration_private.office_notification_outbox from public,anon,authenticated;

create index office_notification_outbox_tenant_created_idx on integration_private.office_notification_outbox(tenant_id,created_at desc);
create index office_notification_outbox_lead_idx on integration_private.office_notification_outbox(tenant_id,lead_id);

create or replace function public.ingest_retell_call_lead(input jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 connection uuid; account text; event_id text; call_id text; lead_name text; lead_email text; lead_phone text; lead_description text; lead_priority text; route integration_private.retell_connections%rowtype; receipt integration_private.retell_event_receipts%rowtype; new_lead uuid;
begin
 if input is null or jsonb_typeof(input)<>'object' then return '{"status":"validation_error"}'; end if;
 if exists(select 1 from jsonb_object_keys(input) k where k not in ('connection_id','provider_account_id','provider_event_id','provider_call_id','lead_name','lead_email','lead_phone','lead_description','lead_priority')) then return '{"status":"validation_error"}'; end if;
 begin
  connection:=(integration_private.text_field(input,'connection_id',36,36,true))::uuid;
  account:=integration_private.text_field(input,'provider_account_id',7,134,true);
  event_id:=integration_private.text_field(input,'provider_event_id',1,180,true);
  call_id:=integration_private.text_field(input,'provider_call_id',6,133,true);
  lead_name:=coalesce(integration_private.text_field(input,'lead_name',1,160,false),'AI receptionist call');
  lead_email:=integration_private.text_field(input,'lead_email',3,254,false);
  lead_phone:=integration_private.text_field(input,'lead_phone',1,40,false);
  lead_description:=integration_private.text_field(input,'lead_description',1,4000,true);
  lead_priority:=coalesce(integration_private.text_field(input,'lead_priority',3,10,false),'normal');
 exception when others then
  return '{"status":"validation_error"}';
 end;
 if account !~ '^agent_[A-Za-z0-9_-]{1,128}$' or call_id !~ '^call_[A-Za-z0-9_-]{1,128}$' or lead_priority not in ('normal','high','urgent') then return '{"status":"validation_error"}'; end if;
 if lead_email is not null and lead_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then return '{"status":"validation_error"}'; end if;
 select * into route from integration_private.retell_connections where connection_id=connection and provider_account_id=account and enabled;
 if not found then return '{"status":"unmapped_tenant"}'; end if;
 perform pg_advisory_xact_lock(hashtextextended('retell-lead:'||connection::text||':'||account||':'||event_id,0));
 select * into receipt from integration_private.retell_event_receipts where connection_id=connection and provider_account_id=account and provider_event_id=event_id;
 if found then
  return jsonb_build_object('status','duplicate','tenant_id',receipt.tenant_id,'lead_id',receipt.lead_id);
 end if;
 insert into public.leads(tenant_id,submission_id,name,email,phone,description,priority,status)
 values(route.tenant_id,gen_random_uuid(),lead_name,lead_email,lead_phone,lead_description,lead_priority,'new')
 returning id into new_lead;
 insert into integration_private.retell_event_receipts(tenant_id,connection_id,provider_account_id,provider_event_id,provider_call_id,lead_id,status)
 values(route.tenant_id,connection,account,event_id,call_id,new_lead,'applied')
 returning * into receipt;
 if exists(
  select 1 from public.workspace_automation_controls
  where tenant_id=route.tenant_id
   and capability='email'
   and requested
   and owner_approved
   and activation_state in ('ready','active')
   and length(regexp_replace(coalesce(test_evidence,''), '\s', '', 'g')) > 0
   and length(regexp_replace(coalesce(rollback_plan,''), '\s', '', 'g')) > 0
 ) then
  insert into integration_private.office_notification_outbox(tenant_id,lead_id,channel,reason,status,subject)
  values(route.tenant_id,new_lead,'email','new_ai_lead_office_review','prepared_not_sent','New AI receptionist lead needs office review')
  on conflict do nothing;
 end if;
 return jsonb_build_object('status','applied','tenant_id',route.tenant_id,'lead_id',new_lead);
exception when unique_violation then
 select * into receipt from integration_private.retell_event_receipts where connection_id=connection and provider_account_id=account and (provider_event_id=event_id or provider_call_id=call_id);
 if found then return jsonb_build_object('status','duplicate','tenant_id',receipt.tenant_id,'lead_id',receipt.lead_id); end if;
 return '{"status":"retryable_failure"}';
when others then
 return '{"status":"retryable_failure"}';
end; $$;

alter function public.ingest_retell_call_lead(jsonb) owner to postgres;
revoke all on function public.ingest_retell_call_lead(jsonb) from public,anon,authenticated;
grant execute on function public.ingest_retell_call_lead(jsonb) to service_role;

commit;
