begin;

create schema if not exists integration_private;
revoke all on schema integration_private from public,anon,authenticated;

do $$ begin
 if not exists(select 1 from pg_roles where rolname='service_role') then
  create role service_role nologin;
 end if;
end $$;

create table if not exists integration_private.retell_connections (
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid not null references public.tenants(id) on delete cascade,
 connection_id uuid not null,
 provider_account_id text not null check(provider_account_id ~ '^agent_[A-Za-z0-9_-]{1,128}$'),
 enabled boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(connection_id,provider_account_id),
 check(isfinite(created_at)),
 check(isfinite(updated_at))
);

create unique index if not exists retell_connections_enabled_account_unique
 on integration_private.retell_connections(connection_id,provider_account_id)
 where enabled;

create table if not exists integration_private.retell_event_receipts (
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid not null references public.tenants(id) on delete cascade,
 connection_id uuid not null,
 provider_account_id text not null,
 provider_event_id text not null check(length(provider_event_id) between 1 and 180),
 provider_call_id text not null check(provider_call_id ~ '^call_[A-Za-z0-9_-]{1,128}$'),
 lead_id uuid not null references public.leads(id) on delete restrict,
 status text not null check(status in ('applied')),
 created_at timestamptz not null default now(),
 unique(connection_id,provider_account_id,provider_event_id),
 unique(connection_id,provider_account_id,provider_call_id),
 check(isfinite(created_at))
);

alter table integration_private.retell_connections enable row level security;
alter table integration_private.retell_event_receipts enable row level security;
revoke all on integration_private.retell_connections from public,anon,authenticated;
revoke all on integration_private.retell_event_receipts from public,anon,authenticated;

create or replace function integration_private.text_field(input jsonb, key text, min_len integer, max_len integer, required boolean default false)
returns text language plpgsql immutable set search_path='' as $$
declare value text;
begin
 if not input ? key then
  if required then raise exception using errcode='22023',message='missing_field',detail=key; end if;
  return null;
 end if;
 if jsonb_typeof(input->key) <> 'string' then raise exception using errcode='22023',message='invalid_field',detail=key; end if;
 value:=btrim(input->>key);
 if required and length(value) < min_len then raise exception using errcode='22023',message='invalid_field',detail=key; end if;
 if value='' then return null; end if;
 if length(value) < min_len or length(value) > max_len then raise exception using errcode='22023',message='invalid_field',detail=key; end if;
 return value;
end; $$;

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
 return jsonb_build_object('status','applied','tenant_id',route.tenant_id,'lead_id',new_lead);
exception when unique_violation then
 select * into receipt from integration_private.retell_event_receipts where connection_id=connection and provider_account_id=account and (provider_event_id=event_id or provider_call_id=call_id);
 if found then return jsonb_build_object('status','duplicate','tenant_id',receipt.tenant_id,'lead_id',receipt.lead_id); end if;
 return '{"status":"retryable_failure"}';
when others then
 return '{"status":"retryable_failure"}';
end; $$;

create trigger retell_connections_touch_updated_at before update on integration_private.retell_connections for each row execute function public.touch_updated_at();

alter function integration_private.text_field(jsonb,text,integer,integer,boolean) owner to postgres;
revoke all on function integration_private.text_field(jsonb,text,integer,integer,boolean) from public,anon,authenticated;
alter function public.ingest_retell_call_lead(jsonb) owner to postgres;
revoke all on function public.ingest_retell_call_lead(jsonb) from public,anon,authenticated;
grant execute on function public.ingest_retell_call_lead(jsonb) to service_role;

commit;
