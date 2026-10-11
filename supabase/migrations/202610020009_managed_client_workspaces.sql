-- CEV-FULLAPP-94A: internal operator-managed client workspaces.
begin;

alter table public.tenants add column if not exists account_type text not null default 'client' check (account_type in ('internal','client'));

create table if not exists public.managed_client_workspaces (
 operator_tenant_id uuid not null references public.tenants(id) on delete cascade,
 client_tenant_id uuid primary key references public.tenants(id) on delete cascade,
 created_by uuid not null references auth.users(id) on delete restrict,
 status text not null default 'onboarding' check (status in ('onboarding','pilot','active','paused','archived')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check (operator_tenant_id <> client_tenant_id)
);
create index if not exists managed_client_workspaces_operator_idx on public.managed_client_workspaces(operator_tenant_id,created_at desc);
create index if not exists managed_client_workspaces_created_by_idx on public.managed_client_workspaces(created_by);

alter table public.managed_client_workspaces enable row level security;
create policy managed_client_workspaces_operator_read on public.managed_client_workspaces
 for select to authenticated using (public.has_tenant_role(operator_tenant_id,array['owner','admin']::public.app_role[]));
revoke all on public.managed_client_workspaces from anon,authenticated;
grant select on public.managed_client_workspaces to authenticated;

create trigger touch_updated_at before update on public.managed_client_workspaces for each row execute function public.touch_updated_at();

create table if not exists onboarding_private.managed_client_workspace_receipts (
 id uuid primary key default gen_random_uuid(),
 actor_user_id uuid not null,
 request_id uuid not null,
 input_digest bytea not null check(octet_length(input_digest)=32),
 operator_tenant_id uuid not null references public.tenants(id) on delete cascade,
 client_tenant_id uuid not null references public.tenants(id) on delete cascade,
 created_at timestamptz not null default now(),
 unique(actor_user_id,request_id),
 unique(client_tenant_id),
 check(isfinite(created_at))
);
alter table onboarding_private.managed_client_workspace_receipts enable row level security;
revoke all on onboarding_private.managed_client_workspace_receipts from public,anon,authenticated;

create or replace function onboarding_private.normalize_managed_client_workspace(input jsonb)
returns jsonb language plpgsql set search_path='' as $$
declare output jsonb; timezone_value text;
begin
 if input is null then raise exception using errcode='22023',message='invalid_input',detail='input'; end if;
 if onboarding_private.input_size(input)>131072 then raise exception using errcode='22023',message='too_large',detail='input'; end if;
 perform onboarding_private.require_keys(input,array['request_id','operator_tenant_id','name','trade','timezone'],'input');
 timezone_value:=onboarding_private.input_text(input->'timezone',1,100,'timezone');
 if not exists(select 1 from onboarding_private.timezones where name=timezone_value) then raise exception using errcode='22023',message='unsupported_timezone',detail='timezone'; end if;
 output:=jsonb_build_object(
  'request_id',onboarding_private.input_uuid(input->'request_id','request_id'),
  'operator_tenant_id',onboarding_private.input_uuid(input->'operator_tenant_id','operator_tenant_id'),
  'name',onboarding_private.input_text(input->'name',1,160,'name'),
  'trade',onboarding_private.input_text(input->'trade',1,80,'trade'),
  'timezone',timezone_value
 );
 return output;
end; $$;

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
  select jsonb_build_object('id',t.id,'name',t.name,'trade',t.trade,'timezone',t.timezone,'account_type',t.account_type,'status',m.status) into workspace
  from public.tenants t join public.managed_client_workspaces m on m.client_tenant_id=t.id
  where t.id=receipt.client_tenant_id and m.operator_tenant_id=receipt.operator_tenant_id;
  if workspace is null then return '{"status":"unavailable"}'; end if;
  return jsonb_build_object('status','replayed','workspace',workspace);
 end if;
 if not exists(select 1 from public.tenants where id=operator_id and account_type='internal' for share) then return '{"status":"unavailable"}'; end if;
 if not exists(select 1 from public.memberships where tenant_id=operator_id and user_id=actor_id and role in ('owner','admin') for share) then return '{"status":"unavailable"}'; end if;
 insert into public.tenants(name,trade,timezone,account_type) values(normalized->>'name',normalized->>'trade',normalized->>'timezone','client') returning id into target;
 insert into public.memberships(tenant_id,user_id,role) values(target,actor_id,'owner');
 insert into public.managed_client_workspaces(operator_tenant_id,client_tenant_id,created_by,status) values(operator_id,target,actor_id,'onboarding');
 insert into public.audit_events(tenant_id,actor_user_id,entity_type,entity_id,action) values(target,actor_id,'memberships',actor_id,'INSERT');
 insert into public.audit_events(tenant_id,actor_user_id,entity_type,entity_id,action) values(operator_id,actor_id,'managed_client_workspaces',target,'INSERT');
 insert into onboarding_private.managed_client_workspace_receipts(actor_user_id,request_id,input_digest,operator_tenant_id,client_tenant_id) values(actor_id,request,digest,operator_id,target);
 select jsonb_build_object('id',id,'name',name,'trade',trade,'timezone',timezone,'account_type',account_type,'status','onboarding') into workspace from public.tenants where id=target;
 return jsonb_build_object('status','saved','workspace',workspace);
exception when others then return '{"status":"retryable_failure"}';
end; $$;

alter function onboarding_private.normalize_managed_client_workspace(jsonb) owner to postgres;
revoke all on function onboarding_private.normalize_managed_client_workspace(jsonb) from public,anon,authenticated;
alter function public.provision_managed_client_workspace(jsonb) owner to postgres;
revoke all on function public.provision_managed_client_workspace(jsonb) from public,anon,authenticated;
grant execute on function public.provision_managed_client_workspace(jsonb) to authenticated;

commit;
