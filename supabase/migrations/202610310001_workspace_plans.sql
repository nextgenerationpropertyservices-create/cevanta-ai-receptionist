begin;

create type public.workspace_plan as enum ('free','dashboard_plus','managed_receptionist');

alter table public.tenants add column plan public.workspace_plan;
update public.tenants set plan='managed_receptionist' where plan is null;
alter table public.tenants alter column plan set not null;
alter table public.tenants alter column plan set default 'free';

create function public.enforce_free_plan_active_lead_limit()
returns trigger language plpgsql security definer set search_path='' as $$
declare tenant_plan public.workspace_plan; active_count bigint;
begin
 if new.status not in ('new','contacted','scheduled') then return new; end if;
 if tg_op='UPDATE' and new.tenant_id=old.tenant_id and old.status in ('new','contacted','scheduled') then return new; end if;
 select plan into tenant_plan from public.tenants where id=new.tenant_id for update;
 if tenant_plan='free' then
  select count(*) into active_count from public.leads
  where tenant_id=new.tenant_id and status in ('new','contacted','scheduled')
   and (tg_op='INSERT' or id<>new.id);
  if active_count>=50 then
   raise exception using errcode='P0001',message='free_plan_active_lead_limit';
  end if;
 end if;
 return new;
end; $$;

create trigger enforce_free_plan_active_lead_limit
before insert or update of tenant_id,status on public.leads
for each row execute function public.enforce_free_plan_active_lead_limit();

create function public.enforce_free_plan_technician_limit()
returns trigger language plpgsql security definer set search_path='' as $$
declare tenant_plan public.workspace_plan; roster_count bigint;
begin
 if tg_op='UPDATE' and new.tenant_id=old.tenant_id then return new; end if;
 select plan into tenant_plan from public.tenants where id=new.tenant_id for update;
 if tenant_plan='free' then
  select count(*) into roster_count from public.technician_roster
  where tenant_id=new.tenant_id and (tg_op='INSERT' or id<>new.id);
  if roster_count>=2 then
   raise exception using errcode='P0001',message='free_plan_technician_limit';
  end if;
 end if;
 return new;
end; $$;

create trigger enforce_free_plan_technician_limit
before insert or update of tenant_id on public.technician_roster
for each row execute function public.enforce_free_plan_technician_limit();

alter function public.enforce_free_plan_active_lead_limit() owner to postgres;
alter function public.enforce_free_plan_technician_limit() owner to postgres;
revoke all on function public.enforce_free_plan_active_lead_limit(),public.enforce_free_plan_technician_limit() from public,anon,authenticated;

-- Replaces the managed-client command so operator-created workspaces never inherit
-- the self-service free default.
create or replace function public.provision_managed_client_workspace(input jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor_id uuid; normalized jsonb; request uuid; digest bytea; receipt onboarding_private.managed_client_workspace_receipts%rowtype; workspace jsonb; operator_id uuid; target uuid; error_code text; error_field text;
begin
 select actor into actor_id from onboarding_private.current_identity();
 if actor_id is null then return '{"status":"unavailable"}'; end if;
 begin
  normalized:=onboarding_private.normalize_managed_client_workspace(input);
 exception when invalid_parameter_value then
  get stacked diagnostics error_code=message_text,error_field=pg_exception_detail;
  return jsonb_build_object('status','validation_error','issues',jsonb_build_array(jsonb_build_object('field',error_field,'code',error_code)));
 end;
 request:=(normalized->>'request_id')::uuid;
 operator_id:=(normalized->>'operator_tenant_id')::uuid;
 perform pg_advisory_xact_lock(hashtextextended('managed-client-workspace-v1:'||actor_id||':'||operator_id,0));
 digest:=sha256(convert_to(onboarding_private.canonical_json(jsonb_build_object('contract_version','managed-client-workspace-v1','actor_user_id',actor_id,'input',normalized)),'UTF8'));
 select * into receipt from onboarding_private.managed_client_workspace_receipts where actor_user_id=actor_id and request_id=request;
 if found then
  if receipt.input_digest<>digest then return '{"status":"conflict","reason":"request_reuse"}'; end if;
  select jsonb_build_object('id',t.id,'name',t.name,'trade',t.trade,'timezone',t.timezone,'account_type',t.account_type,'plan',t.plan,'status',m.status) into workspace
  from public.tenants t join public.managed_client_workspaces m on m.client_tenant_id=t.id
  where t.id=receipt.client_tenant_id and m.operator_tenant_id=receipt.operator_tenant_id;
  if workspace is null then return '{"status":"unavailable"}'; end if;
  return jsonb_build_object('status','replayed','workspace',workspace);
 end if;
 if not exists(select 1 from public.tenants where id=operator_id and account_type='internal' for share) then return '{"status":"unavailable"}'; end if;
 if not exists(select 1 from public.memberships where tenant_id=operator_id and user_id=actor_id and role in ('owner','admin') for share) then return '{"status":"unavailable"}'; end if;
 insert into public.tenants(name,trade,timezone,account_type,plan)
 values(normalized->>'name',normalized->>'trade',normalized->>'timezone','client','managed_receptionist') returning id into target;
 insert into public.memberships(tenant_id,user_id,role) values(target,actor_id,'owner');
 insert into public.managed_client_workspaces(operator_tenant_id,client_tenant_id,created_by,status) values(operator_id,target,actor_id,'onboarding');
 insert into public.audit_events(tenant_id,actor_user_id,entity_type,entity_id,action) values(target,actor_id,'memberships',actor_id,'INSERT');
 insert into public.audit_events(tenant_id,actor_user_id,entity_type,entity_id,action) values(operator_id,actor_id,'managed_client_workspaces',target,'INSERT');
 insert into onboarding_private.managed_client_workspace_receipts(actor_user_id,request_id,input_digest,operator_tenant_id,client_tenant_id) values(actor_id,request,digest,operator_id,target);
 select jsonb_build_object('id',id,'name',name,'trade',trade,'timezone',timezone,'account_type',account_type,'plan',plan,'status','onboarding') into workspace from public.tenants where id=target;
 return jsonb_build_object('status','saved','workspace',workspace);
exception when others then return '{"status":"retryable_failure"}';
end; $$;

alter function public.provision_managed_client_workspace(jsonb) owner to postgres;
revoke all on function public.provision_managed_client_workspace(jsonb) from public,anon,authenticated;
grant execute on function public.provision_managed_client_workspace(jsonb) to authenticated;

-- Provider ingestion is plan-gated before the event lock, lead insert, receipt,
-- or notification outbox write. A plan is not provider readiness evidence.
create or replace function public.ingest_retell_call_lead(input jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 connection uuid; account text; event_id text; call_id text; lead_name text; lead_email text; lead_phone text; lead_description text; lead_priority text; route integration_private.retell_connections%rowtype; receipt integration_private.retell_event_receipts%rowtype; new_lead uuid; tenant_plan public.workspace_plan;
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
 exception when others then return '{"status":"validation_error"}'; end;
 if account !~ '^agent_[A-Za-z0-9_-]{1,128}$' or call_id !~ '^call_[A-Za-z0-9_-]{1,128}$' or lead_priority not in ('normal','high','urgent') then return '{"status":"validation_error"}'; end if;
 if lead_email is not null and lead_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then return '{"status":"validation_error"}'; end if;
 select * into route from integration_private.retell_connections where connection_id=connection and provider_account_id=account and enabled;
 if not found then return '{"status":"unmapped_tenant"}'; end if;
 select plan into tenant_plan from public.tenants where id=route.tenant_id;
 if tenant_plan='free' then return jsonb_build_object('status','plan_restricted'); end if;
 perform pg_advisory_xact_lock(hashtextextended('retell-lead:'||connection::text||':'||account||':'||event_id,0));
 select * into receipt from integration_private.retell_event_receipts where connection_id=connection and provider_account_id=account and provider_event_id=event_id;
 if found then return jsonb_build_object('status','duplicate','tenant_id',receipt.tenant_id,'lead_id',receipt.lead_id); end if;
 insert into public.leads(tenant_id,submission_id,name,email,phone,description,priority,status)
 values(route.tenant_id,gen_random_uuid(),lead_name,lead_email,lead_phone,lead_description,lead_priority,'new') returning id into new_lead;
 insert into integration_private.retell_event_receipts(tenant_id,connection_id,provider_account_id,provider_event_id,provider_call_id,lead_id,status)
 values(route.tenant_id,connection,account,event_id,call_id,new_lead,'applied') returning * into receipt;
 if exists(select 1 from public.workspace_automation_controls where tenant_id=route.tenant_id and capability='email' and requested and owner_approved and activation_state in ('ready','active') and length(regexp_replace(coalesce(test_evidence,''),'\s','','g'))>0 and length(regexp_replace(coalesce(rollback_plan,''),'\s','','g'))>0) then
  insert into integration_private.office_notification_outbox(tenant_id,lead_id,channel,reason,status,subject)
  values(route.tenant_id,new_lead,'email','new_ai_lead_office_review','prepared_not_sent','New AI receptionist lead needs office review') on conflict do nothing;
 end if;
 return jsonb_build_object('status','applied','tenant_id',route.tenant_id,'lead_id',new_lead);
exception when unique_violation then
 select * into receipt from integration_private.retell_event_receipts where connection_id=connection and provider_account_id=account and (provider_event_id=event_id or provider_call_id=call_id);
 if found then return jsonb_build_object('status','duplicate','tenant_id',receipt.tenant_id,'lead_id',receipt.lead_id); end if;
 return '{"status":"retryable_failure"}';
when others then return '{"status":"retryable_failure"}';
end; $$;

alter function public.ingest_retell_call_lead(jsonb) owner to postgres;
revoke all on function public.ingest_retell_call_lead(jsonb) from public,anon,authenticated;
grant execute on function public.ingest_retell_call_lead(jsonb) to service_role;

commit;
