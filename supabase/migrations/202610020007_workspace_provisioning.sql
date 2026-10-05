-- CEV-SELF-SERVE-73A: verified first-workspace provisioning.
begin;

create table if not exists onboarding_private.workspace_provision_receipts (
 id uuid primary key default gen_random_uuid(),
 actor_user_id uuid not null,
 request_id uuid not null,
 input_digest bytea not null check(octet_length(input_digest)=32),
 tenant_id uuid not null references public.tenants(id),
 created_at timestamptz not null default now(),
 unique(actor_user_id,request_id),
 unique(tenant_id),
 check(isfinite(created_at))
);
alter table onboarding_private.workspace_provision_receipts enable row level security;
revoke all on onboarding_private.workspace_provision_receipts from public,anon,authenticated;

create or replace function onboarding_private.normalize_workspace_provision(input jsonb)
returns jsonb language plpgsql set search_path='' as $$
declare output jsonb; timezone_value text;
begin
 if input is null then raise exception using errcode='22023',message='invalid_input',detail='input'; end if;
 if onboarding_private.input_size(input)>131072 then raise exception using errcode='22023',message='too_large',detail='input'; end if;
 perform onboarding_private.require_keys(input,array['request_id','name','trade','timezone'],'input');
 timezone_value:=onboarding_private.input_text(input->'timezone',1,100,'timezone');
 if not exists(select 1 from onboarding_private.timezones where name=timezone_value) then raise exception using errcode='22023',message='unsupported_timezone',detail='timezone'; end if;
 output:=jsonb_build_object(
  'request_id',onboarding_private.input_uuid(input->'request_id','request_id'),
  'name',onboarding_private.input_text(input->'name',1,160,'name'),
  'trade',onboarding_private.input_text(input->'trade',1,80,'trade'),
  'timezone',timezone_value
 );
 return output;
end; $$;

create or replace function public.provision_owner_workspace(input jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor_id uuid; normalized jsonb; request uuid; digest bytea; receipt onboarding_private.workspace_provision_receipts%rowtype; workspace jsonb; target uuid; error_code text; error_field text;
begin
 select actor into actor_id from onboarding_private.current_identity();
 if actor_id is null then return '{"status":"unavailable"}'; end if;
 begin
  normalized:=onboarding_private.normalize_workspace_provision(input);
 exception when invalid_parameter_value then
  get stacked diagnostics error_code=message_text,error_field=pg_exception_detail;
  return jsonb_build_object('status','validation_error','issues',jsonb_build_array(jsonb_build_object('field',error_field,'code',error_code)));
 end;
 request:=(normalized->>'request_id')::uuid;
 perform pg_advisory_xact_lock(hashtextextended('workspace-provision-v1:'||actor_id,0));
 digest:=sha256(convert_to(onboarding_private.canonical_json(jsonb_build_object('contract_version','workspace-provision-v1','actor_user_id',actor_id,'input',normalized)),'UTF8'));
 select * into receipt from onboarding_private.workspace_provision_receipts where actor_user_id=actor_id and request_id=request;
 if found then
  if receipt.input_digest<>digest then return '{"status":"conflict","reason":"request_reuse"}'; end if;
  select jsonb_build_object('id',t.id,'name',t.name,'trade',t.trade,'timezone',t.timezone) into workspace
  from public.tenants t join public.memberships m on m.tenant_id=t.id and m.user_id=actor_id and m.role='owner'
  where t.id=receipt.tenant_id;
  if workspace is null then return '{"status":"unavailable"}'; end if;
  return jsonb_build_object('status','replayed','workspace',workspace);
 end if;
 -- Launch policy: one self-service workspace per new owner account. Multi-workspace ownership needs a later reviewed task.
 if exists(select 1 from public.memberships where user_id=actor_id) then return '{"status":"unavailable"}'; end if;
 insert into public.tenants(name,trade,timezone) values(normalized->>'name',normalized->>'trade',normalized->>'timezone') returning id into target;
 insert into public.memberships(tenant_id,user_id,role) values(target,actor_id,'owner');
 insert into public.audit_events(tenant_id,actor_user_id,entity_type,entity_id,action) values(target,actor_id,'memberships',actor_id,'INSERT');
 insert into onboarding_private.workspace_provision_receipts(actor_user_id,request_id,input_digest,tenant_id) values(actor_id,request,digest,target);
 select jsonb_build_object('id',id,'name',name,'trade',trade,'timezone',timezone) into workspace from public.tenants where id=target;
 return jsonb_build_object('status','saved','workspace',workspace);
exception when others then return '{"status":"retryable_failure"}';
end; $$;

alter function onboarding_private.normalize_workspace_provision(jsonb) owner to postgres;
revoke all on function onboarding_private.normalize_workspace_provision(jsonb) from public,anon,authenticated;
alter function public.provision_owner_workspace(jsonb) owner to postgres;
revoke all on function public.provision_owner_workspace(jsonb) from public,anon,authenticated;
grant execute on function public.provision_owner_workspace(jsonb) to authenticated;

commit;