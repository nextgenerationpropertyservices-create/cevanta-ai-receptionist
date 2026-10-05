-- CEV-ONBOARD-RPC-46. No issuance, delivery, continuation or readiness checker.
begin;
-- Parsed compact JSON byte count, matching the shared parser without JSONB's
-- display whitespace or preserved decimal scale. HTTP raw-byte limit is separate.
create function onboarding_private.input_size(value jsonb)
returns bigint language plpgsql immutable set search_path='' as $$
declare result bigint;
begin
 case jsonb_typeof(value)
 when 'object' then select coalesce(sum(octet_length(convert_to(to_jsonb(key)::text,'UTF8'))+1+onboarding_private.input_size(val)),0)+greatest(count(*)-1,0)+2 into result from jsonb_each(value) as fields(key,val);
 when 'array' then select coalesce(sum(onboarding_private.input_size(val)),0)+greatest(count(*)-1,0)+2 into result from jsonb_array_elements(value) as fields(val);
 when 'number' then result:=octet_length(case when (value#>>'{}')::numeric=trunc((value#>>'{}')::numeric) then trunc((value#>>'{}')::numeric)::text else value::text end);
 else result:=octet_length(convert_to(value::text,'UTF8'));
 end case;
 return result;
end; $$;
create function onboarding_private.require_keys(value jsonb, keys text[], field text)
returns void language plpgsql set search_path='' as $$
begin
 if value is null or jsonb_typeof(value)<>'object' or not value ?& keys then raise exception using errcode='22023',message='invalid_input',detail=field; end if;
 if (select count(*) from jsonb_object_keys(value))<>cardinality(keys) then raise exception using errcode='22023',message='unknown_field',detail=field; end if;
end; $$;
create function onboarding_private.input_text(value jsonb, minimum integer, maximum integer, field text)
returns text language plpgsql set search_path='' as $$
declare result text;
begin
 if value is null or jsonb_typeof(value)<>'string' then raise exception using errcode='22023',message='invalid_text',detail=field; end if;
 result:=btrim(value#>>'{}',E'\t\n\v\f\r ');
 if not onboarding_private.valid_text(result,minimum,maximum) then raise exception using errcode='22023',message='invalid_text',detail=field; end if;
 return result;
end; $$;
create function onboarding_private.input_uuid(value jsonb, field text)
returns uuid language plpgsql set search_path='' as $$
begin
 if value is null or jsonb_typeof(value)<>'string' or (value#>>'{}') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then raise exception using errcode='22023',message='invalid_uuid',detail=field; end if;
 return (value#>>'{}')::uuid;
end; $$;
create function onboarding_private.input_integer(value jsonb, minimum integer, maximum integer, nullable boolean, field text)
returns integer language plpgsql set search_path='' as $$
declare number numeric;
begin
 if nullable and value='null'::jsonb then return null; end if;
 if value is null or jsonb_typeof(value)<>'number' then raise exception using errcode='22023',message='invalid_number',detail=field; end if;
 number:=(value#>>'{}')::numeric;
 if number<>trunc(number) or number<minimum or number>maximum then raise exception using errcode='22023',message='invalid_number',detail=field; end if;
 return number::integer;
end; $$;
create function onboarding_private.input_boolean(value jsonb, field text)
returns boolean language plpgsql set search_path='' as $$
begin
 if value is null or jsonb_typeof(value)<>'boolean' then raise exception using errcode='22023',message='invalid_boolean',detail=field; end if;
 return (value#>>'{}')::boolean;
end; $$;
create function onboarding_private.input_contact(value jsonb, kind text, field text)
returns text language plpgsql set search_path='' as $$
declare result text;
begin
 if value='null'::jsonb then return null; end if;
 result:=onboarding_private.input_text(value,0,case when kind='email' then 254 else 40 end,field);
 if result='' then return null; end if;
 if (kind='email' and not onboarding_private.valid_email(result)) or (kind='phone' and not onboarding_private.valid_phone(result)) then raise exception using errcode='22023',message='invalid_'||kind,detail=field; end if;
 return result;
end; $$;
create function onboarding_private.input_date(value jsonb, field text)
returns date language plpgsql set search_path='' as $$
declare raw text; result date;
begin
 if value is null or jsonb_typeof(value)<>'string' then raise exception using errcode='22023',message='invalid_date',detail=field; end if;
 raw:=value#>>'{}';
 if raw !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then raise exception using errcode='22023',message='invalid_date',detail=field; end if;
 begin result:=raw::date; exception when others then raise exception using errcode='22023',message='invalid_date',detail=field; end;
 if result not between date '0001-01-01' and date '9999-12-31' or to_char(result,'YYYY-MM-DD')<>raw then raise exception using errcode='22023',message='invalid_date',detail=field; end if;
 return result;
end; $$;
create function onboarding_private.input_intervals(value jsonb, closed boolean, field text)
returns jsonb language plpgsql set search_path='' as $$
declare result jsonb;
begin
 if not onboarding_private.valid_intervals(value,closed) then raise exception using errcode='22023',message='invalid_interval',detail=field; end if;
 select coalesce(jsonb_agg(jsonb_build_object('start_minute',(item->>'start_minute')::numeric::integer,'end_minute',(item->>'end_minute')::numeric::integer) order by (item->>'start_minute')::numeric,(item->>'end_minute')::numeric),'[]') into result from jsonb_array_elements(value) item;
 return result;
end; $$;
create function onboarding_private.normalize_config(command text, input jsonb)
returns jsonb language plpgsql set search_path='' as $$
declare payload jsonb; output jsonb; items jsonb:='[]'; item jsonb; normalized jsonb; ids uuid[]:='{}'; weekdays integer[]:='{}'; item_id uuid; weekday integer; closed boolean; maximum integer;
begin
 if input is null then raise exception using errcode='22023',message='invalid_input',detail='input'; end if;
 if onboarding_private.input_size(input)>131072 then raise exception using errcode='22023',message='too_large',detail='input'; end if;
 perform onboarding_private.require_keys(input,array['tenant_id','request_id','expected_config_revision','payload'],'input');
 output:=jsonb_build_object('tenant_id',onboarding_private.input_uuid(input->'tenant_id','tenant_id'),'request_id',onboarding_private.input_uuid(input->'request_id','request_id'),'expected_config_revision',onboarding_private.input_integer(input->'expected_config_revision',0,2147483647,false,'expected_config_revision'));
 payload:=input->'payload';
 if command='save_business_profile' then
  perform onboarding_private.require_keys(payload,array['name','trade','timezone','business_contact_name','business_email','business_phone'],'payload');
  normalized:=jsonb_build_object('name',onboarding_private.input_text(payload->'name',1,160,'name'),'trade',onboarding_private.input_text(payload->'trade',1,80,'trade'),'timezone',onboarding_private.input_text(payload->'timezone',1,100,'timezone'),'business_contact_name',onboarding_private.input_text(payload->'business_contact_name',0,160,'business_contact_name'),'business_email',onboarding_private.input_contact(payload->'business_email','email','business_email'),'business_phone',onboarding_private.input_contact(payload->'business_phone','phone','business_phone'));
  if not exists(select 1 from onboarding_private.timezones where name=normalized->>'timezone') then raise exception using errcode='22023',message='unsupported_timezone',detail='timezone'; end if;
 elsif command in ('replace_services','replace_escalation_contacts') then
  perform onboarding_private.require_keys(payload,array['items'],'payload'); maximum:=case when command='replace_services' then 100 else 20 end;
  if jsonb_typeof(payload->'items')<>'array' or jsonb_array_length(payload->'items')>maximum then raise exception using errcode='22023',message='invalid_input',detail='items'; end if;
  for item in select value from jsonb_array_elements(payload->'items') loop
   if command='replace_services' then perform onboarding_private.require_keys(item,array['id','name','description','enabled','position'],'items'); else perform onboarding_private.require_keys(item,array['id','label','contact_name','email','phone','enabled','position'],'items'); end if;
   item_id:=case when item->'id'='null'::jsonb then null else onboarding_private.input_uuid(item->'id','items.id') end;
   if item_id=any(ids) then raise exception using errcode='22023',message='duplicate_id',detail='items.id'; end if;
   if item_id is not null then ids:=array_append(ids,item_id); end if;
   normalized:=jsonb_build_object('id',item_id,'enabled',onboarding_private.input_boolean(item->'enabled','items.enabled'),'position',onboarding_private.input_integer(item->'position',0,9999,false,'items.position'));
   if command='replace_services' then normalized:=normalized||jsonb_build_object('name',onboarding_private.input_text(item->'name',0,120,'items.name'),'description',onboarding_private.input_text(item->'description',0,2000,'items.description'));
   else normalized:=normalized||jsonb_build_object('label',onboarding_private.input_text(item->'label',0,120,'items.label'),'contact_name',onboarding_private.input_text(item->'contact_name',0,160,'items.contact_name'),'email',onboarding_private.input_contact(item->'email','email','items.email'),'phone',onboarding_private.input_contact(item->'phone','phone','items.phone')); end if;
   items:=items||jsonb_build_array(normalized);
  end loop;
  select coalesce(jsonb_agg(value order by (value->>'position')::integer,coalesce(value->>'id','') collate "C",ordinal),'[]') into items from jsonb_array_elements(items) with ordinality as entries(value,ordinal);
  normalized:=jsonb_build_object('items',items);
 elsif command='replace_weekly_hours' then
  perform onboarding_private.require_keys(payload,array['days'],'payload');
  if jsonb_typeof(payload->'days')<>'array' or jsonb_array_length(payload->'days')<>7 then raise exception using errcode='22023',message='invalid_input',detail='days'; end if;
  for item in select value from jsonb_array_elements(payload->'days') loop
   perform onboarding_private.require_keys(item,array['weekday','closed','intervals'],'days'); weekday:=onboarding_private.input_integer(item->'weekday',0,6,false,'days.weekday'); closed:=onboarding_private.input_boolean(item->'closed','days.closed');
   if weekday=any(weekdays) then raise exception using errcode='22023',message='invalid_input',detail='days.weekday'; end if;
   weekdays:=array_append(weekdays,weekday); items:=items||jsonb_build_array(jsonb_build_object('weekday',weekday,'closed',closed,'intervals',onboarding_private.input_intervals(item->'intervals',closed,'days.intervals')));
  end loop;
  select jsonb_agg(value order by (value->>'weekday')::integer) into items from jsonb_array_elements(items);
  normalized:=jsonb_build_object('days',items);
 elsif command in ('upsert_hours_exception','remove_hours_exception') then
  perform onboarding_private.require_keys(payload,case when command='upsert_hours_exception' then array['date','closed','intervals'] else array['date'] end,'payload');
  normalized:=jsonb_build_object('date',to_char(onboarding_private.input_date(payload->'date','date'),'YYYY-MM-DD'));
  if command='upsert_hours_exception' then closed:=onboarding_private.input_boolean(payload->'closed','closed'); normalized:=normalized||jsonb_build_object('closed',closed,'intervals',onboarding_private.input_intervals(payload->'intervals',closed,'intervals')); end if;
 elsif command='save_booking_preferences' then
  perform onboarding_private.require_keys(payload,array['lead_time_minutes','buffer_before_minutes','buffer_after_minutes','horizon_days','notes','acknowledged'],'payload');
  normalized:=jsonb_build_object('lead_time_minutes',onboarding_private.input_integer(payload->'lead_time_minutes',0,525600,true,'lead_time_minutes'),'buffer_before_minutes',onboarding_private.input_integer(payload->'buffer_before_minutes',0,1440,true,'buffer_before_minutes'),'buffer_after_minutes',onboarding_private.input_integer(payload->'buffer_after_minutes',0,1440,true,'buffer_after_minutes'),'horizon_days',onboarding_private.input_integer(payload->'horizon_days',1,730,true,'horizon_days'),'notes',onboarding_private.input_text(payload->'notes',0,2000,'notes'),'acknowledged',onboarding_private.input_boolean(payload->'acknowledged','acknowledged'));
 else raise exception using errcode='22023',message='invalid_input',detail='command'; end if;
 return output||jsonb_build_object('payload',normalized);
end; $$;
-- Authoritative Auth record; absent/unconfirmed/deleted users never authorize a command.
-- PL/pgSQL permits old storage-only compatibility fixtures to load this migration.
create function onboarding_private.current_identity()
returns table(actor uuid, canonical_email text) language plpgsql set search_path='' as $$
begin
 return query select u.id,lower(btrim(u.email,E'\t\n\v\f\r ')) from auth.users u where u.id=auth.uid() and u.email_confirmed_at is not null and u.deleted_at is null and u.email is not null for share of u;
end; $$;
create function onboarding_private.pending_readiness()
returns jsonb language sql immutable set search_path='' as $$
 select '{"configuration_state":"not_evaluated","manual_workspace_state":"not_evaluated","reason":"setup_policy_pending","next_action":"platform_operator","booking_state":"blocked","release_state":"not_evaluated","hostedReady":false,"providerConnectionAuthorized":false}'::jsonb;
$$;
create function onboarding_private.saved_result(state text, command text, target uuid, revision integer, result_id uuid, result_version integer)
returns jsonb language sql immutable set search_path='' as $$
 select jsonb_build_object('status',state,'entity',case when command='save_resume_step' then 'resume' when command in ('upsert_hours_exception','remove_hours_exception') then 'exception' else 'setup' end,'id',case when command='save_resume_step' or command in ('upsert_hours_exception','remove_hours_exception') then result_id else target end,'version',result_version,'config_revision',revision);
$$;

-- Internal fixed-table writer; no identifiers or metadata come from public input.
create function onboarding_private.row_changed(relation text, target uuid, row_id uuid, data jsonb)
returns boolean language plpgsql set search_path='' as $$
declare stored jsonb;
begin
 if relation not in ('tenant_business_profiles','tenant_services','tenant_hours_days','tenant_hours_exceptions','tenant_booking_preferences','tenant_escalation_contacts','tenant_setup_resume') then raise exception 'Invalid internal table'; end if;
 execute format('select to_jsonb(t) from public.%I t where tenant_id=$1 and id=$2',relation) into stored using target,row_id;
 return stored is null or not stored @> data;
end; $$;
create function onboarding_private.persist_row(relation text, target uuid, row_id uuid, data jsonb)
returns void language plpgsql set search_path='' as $$
declare columns text; allowed text[]; old_version integer;
begin
 allowed:=case relation
 when 'tenant_business_profiles' then array['business_contact_name','business_email','business_phone']
 when 'tenant_services' then array['name','description','enabled','position']
 when 'tenant_hours_days' then array['weekday','closed','intervals']
 when 'tenant_hours_exceptions' then array['local_date','closed','intervals','active']
 when 'tenant_booking_preferences' then array['mode','lead_time_minutes','buffer_before_minutes','buffer_after_minutes','horizon_days','notes','acknowledged']
 when 'tenant_escalation_contacts' then array['label','contact_name','email','phone','enabled','position']
 when 'tenant_setup_resume' then array['user_id','step_id'] else null end;
 if allowed is null or exists(select 1 from jsonb_object_keys(data) k where not k=any(allowed)) then raise exception 'Invalid internal fields'; end if;
 if not onboarding_private.row_changed(relation,target,row_id,data) then return; end if;
 select string_agg(format('%I',k),',' order by k) into columns from jsonb_object_keys(data) k;
 execute format('select version from public.%I where tenant_id=$1 and id=$2 for update',relation) into old_version using target,row_id;
 if old_version is null then
  execute format('insert into public.%I(id,tenant_id,created_by,updated_by,%s) select $2,$3,auth.uid(),auth.uid(),%s from jsonb_populate_record(null::public.%I,$1)',relation,columns,columns,relation) using data,row_id,target;
 else
  if old_version=2147483647 then raise exception 'Version exhausted' using errcode='22003'; end if;
  execute format('update public.%I set (%s)=(select %s from jsonb_populate_record(null::public.%I,$1)),version=version+1,updated_by=auth.uid() where tenant_id=$2 and id=$3',relation,columns,columns,relation) using data,target,row_id;
 end if;
end; $$;


-- HISTORY68D receipt extension for one-row retained-history re-enable replay.
alter table onboarding_private.receipts drop constraint if exists receipts_command_check;
alter table onboarding_private.receipts drop constraint if exists receipts_check;
alter table onboarding_private.receipts add column if not exists history_kind text check(history_kind in ('services','escalation_contacts','date_exceptions'));
alter table onboarding_private.receipts add column if not exists history_row_id uuid;
alter table onboarding_private.receipts add constraint receipts_command_check check(command in ('save_business_profile','replace_services','replace_weekly_hours','upsert_hours_exception','remove_hours_exception','save_booking_preferences','replace_escalation_contacts','save_resume_step','invite_accept','onboarding_history_reenable'));
alter table onboarding_private.receipts add constraint receipts_check check(
 (command='invite_accept' and result_id is null and target_date is null and result_version is null and config_revision is null and intended_role is not null and accepted_at is not null and isfinite(accepted_at) and history_kind is null and history_row_id is null)
 or (command in ('upsert_hours_exception','remove_hours_exception') and target_date is not null and result_version is not null and config_revision is not null and config_revision=result_version and intended_role is null and accepted_at is null and history_kind is null and history_row_id is null and (command<>'upsert_hours_exception' or result_id is not null))
 or (command='onboarding_history_reenable' and result_id is null and target_date is null and result_version is not null and config_revision is not null and intended_role is null and accepted_at is null and history_kind is not null and history_row_id is not null)
 or (command not in ('invite_accept','upsert_hours_exception','remove_hours_exception','onboarding_history_reenable') and result_id is null and target_date is null and result_version is not null and config_revision is not null and intended_role is null and accepted_at is null and history_kind is null and history_row_id is null and (command='save_resume_step' or config_revision=result_version))
);
create or replace function onboarding_private.guard_receipt_target()
returns trigger language plpgsql set search_path='' as $$
begin
 if new.invitation_id is not null and not exists(select 1 from onboarding_private.invitations i where i.tenant_id=new.tenant_id and i.id=new.invitation_id and i.status='accepted' and i.accepted_by=new.actor_user_id and i.intended_role=new.intended_role and i.accepted_at=new.accepted_at) then raise exception 'Invalid receipt invitation binding' using errcode='23514'; end if;
 if new.result_id is not null and not exists(select 1 from public.tenant_hours_exceptions e where e.tenant_id=new.tenant_id and e.id=new.result_id and e.local_date=new.target_date) then raise exception 'Invalid receipt exception binding' using errcode='23514'; end if;
 if new.resume_id is not null and not exists(select 1 from public.tenant_setup_resume r where r.tenant_id=new.tenant_id and r.id=new.resume_id and r.user_id=new.actor_user_id) then raise exception 'Invalid receipt resume binding' using errcode='23514'; end if;
 if new.history_kind='services' and not exists(select 1 from public.tenant_services s where s.tenant_id=new.tenant_id and s.id=new.history_row_id) then raise exception 'Invalid receipt history service binding' using errcode='23514'; end if;
 if new.history_kind='escalation_contacts' and not exists(select 1 from public.tenant_escalation_contacts c where c.tenant_id=new.tenant_id and c.id=new.history_row_id) then raise exception 'Invalid receipt history contact binding' using errcode='23514'; end if;
 if new.history_kind='date_exceptions' and not exists(select 1 from public.tenant_hours_exceptions e where e.tenant_id=new.tenant_id and e.id=new.history_row_id) then raise exception 'Invalid receipt history exception binding' using errcode='23514'; end if;
 return new;
end; $$;
create function onboarding_private.saved_history_result(state text, kind text, row_id uuid, row_version integer, revision integer)
returns jsonb language sql immutable set search_path='' as $$
 select jsonb_build_object('status',state,'entity','history_reenable','kind',kind,'id',row_id,'version',row_version,'config_revision',revision);
$$;

create function public.onboarding_configure(command text, input jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor_id uuid; normalized jsonb; payload jsonb; target uuid; request uuid; expected integer; revision integer; digest bytea;
 role_value public.app_role; tenant_row public.tenants%rowtype; receipt onboarding_private.receipts%rowtype;
 relation text; row_id uuid; result_id uuid; desired jsonb; item jsonb; current_row record; plan jsonb:='[]'; ids uuid[]:='{}'; changed boolean:=false; authority_changed boolean:=false; key_date date;
 error_code text; error_field text;
begin
 select actor into actor_id from onboarding_private.current_identity();
 if actor_id is null then return '{"status":"unavailable"}'; end if;
 begin normalized:=onboarding_private.normalize_config(command,input);
 exception when invalid_parameter_value then
  get stacked diagnostics error_code=message_text,error_field=pg_exception_detail;
  return jsonb_build_object('status','validation_error','issues',jsonb_build_array(jsonb_build_object('field',error_field,'code',error_code)));
 end;
 target:=(normalized->>'tenant_id')::uuid; request:=(normalized->>'request_id')::uuid; expected:=(normalized->>'expected_config_revision')::integer; payload:=normalized->'payload';
 select role into role_value from public.memberships where tenant_id=target and user_id=actor_id for share;
 if role_value is null or role_value not in ('owner','admin') then return '{"status":"unavailable"}'; end if;
 select * into tenant_row from public.tenants where id=target for update;
 if not found then return '{"status":"unavailable"}'; end if;
 perform pg_advisory_xact_lock(hashtextextended('onboarding-v1:'||target||':'||actor_id||':'||command||':'||request,0));
 select config_revision into revision from public.tenant_setup_state where tenant_id=target for update; revision:=coalesce(revision,0);
 digest:=sha256(convert_to(onboarding_private.canonical_json(jsonb_build_object('contract_version','onboarding-v1','command',command,'actor_user_id',actor_id,'input',normalized)),'UTF8'));
 -- Target ownership is checked before any receipt can disclose a result.
 if command in ('replace_services','replace_escalation_contacts') then
  relation:=case when command='replace_services' then 'tenant_services' else 'tenant_escalation_contacts' end;
  for item in select value from jsonb_array_elements(payload->'items') loop
   if item->>'id' is not null then
    row_id:=(item->>'id')::uuid;
    execute format('select id from public.%I where tenant_id=$1 and id=$2',relation) into result_id using target,row_id;
    if result_id is null then return '{"status":"unavailable"}'; end if;
   end if;
  end loop;
 end if;
 select * into receipt from onboarding_private.receipts where tenant_id=target and actor_user_id=actor_id and receipts.command=onboarding_configure.command and request_id=request;
 if found then
  if receipt.input_digest<>digest then return '{"status":"conflict","reason":"request_reuse"}'; end if;
  if command in ('upsert_hours_exception','remove_hours_exception') and receipt.target_date<>(payload->>'date')::date then return '{"status":"retryable_failure"}'; end if;
  return onboarding_private.saved_result('replayed',command,target,receipt.config_revision,receipt.result_id,receipt.result_version);
 end if;
 if expected<>revision then return '{"status":"conflict","reason":"revision"}'; end if;
 result_id:=null;
 if command='save_business_profile' then
  relation:='tenant_business_profiles'; select id into row_id from public.tenant_business_profiles where tenant_id=target for update;
  desired:=payload-array['name','trade','timezone'];
  authority_changed:=(tenant_row.name,tenant_row.trade,tenant_row.timezone) is distinct from (payload->>'name',payload->>'trade',payload->>'timezone');
  changed:=authority_changed or onboarding_private.row_changed(relation,target,row_id,desired);
  plan:=jsonb_build_array(jsonb_build_object('relation',relation,'id',coalesce(row_id,gen_random_uuid()),'data',desired));
 elsif command in ('replace_services','replace_escalation_contacts') then
  for item in select value from jsonb_array_elements(payload->'items') loop
   row_id:=coalesce((item->>'id')::uuid,gen_random_uuid()); ids:=array_append(ids,row_id); desired:=item-'id';
   changed:=changed or onboarding_private.row_changed(relation,target,row_id,desired);
   plan:=plan||jsonb_build_array(jsonb_build_object('relation',relation,'id',row_id,'data',desired));
  end loop;
  for current_row in execute format('select id from public.%I where tenant_id=$1 and enabled and not(id=any($2)) order by id for update',relation) using target,ids loop
   changed:=true; plan:=plan||jsonb_build_array(jsonb_build_object('relation',relation,'id',current_row.id,'data',jsonb_build_object('enabled',false)));
  end loop;
 elsif command='replace_weekly_hours' then
  relation:='tenant_hours_days';
  for item in select value from jsonb_array_elements(payload->'days') loop
   select id into row_id from public.tenant_hours_days where tenant_id=target and weekday=(item->>'weekday')::integer for update;
   row_id:=coalesce(row_id,gen_random_uuid()); changed:=changed or onboarding_private.row_changed(relation,target,row_id,item);
   plan:=plan||jsonb_build_array(jsonb_build_object('relation',relation,'id',row_id,'data',item));
  end loop;
 elsif command in ('upsert_hours_exception','remove_hours_exception') then
  relation:='tenant_hours_exceptions'; key_date:=(payload->>'date')::date;
  select id into row_id from public.tenant_hours_exceptions where tenant_id=target and local_date=key_date for update;
  if command='upsert_hours_exception' then
   if row_id is null and (select count(*) from public.tenant_hours_exceptions where tenant_id=target)>=366 then return '{"status":"validation_error","issues":[{"field":"date","code":"invalid_input"}]}'; end if;
   row_id:=coalesce(row_id,gen_random_uuid()); desired:=(payload-'date')||jsonb_build_object('local_date',to_char(key_date,'YYYY-MM-DD'),'active',true);
  else desired:=jsonb_build_object('active',false); end if;
  result_id:=row_id;
  if row_id is not null then changed:=onboarding_private.row_changed(relation,target,row_id,desired); plan:=jsonb_build_array(jsonb_build_object('relation',relation,'id',row_id,'data',desired)); end if;
 else
  relation:='tenant_booking_preferences'; select id into row_id from public.tenant_booking_preferences where tenant_id=target for update; desired:=payload||'{"mode":"request_only"}';
  row_id:=coalesce(row_id,gen_random_uuid()); changed:=onboarding_private.row_changed(relation,target,row_id,desired); plan:=jsonb_build_array(jsonb_build_object('relation',relation,'id',row_id,'data',desired));
 end if;
 if (changed or revision=0) and revision=2147483647 then return '{"status":"conflict","reason":"version_exhausted"}'; end if;
 if authority_changed then
  update public.tenants set name=payload->>'name',trade=payload->>'trade',timezone=payload->>'timezone' where id=target;
  select config_revision into revision from public.tenant_setup_state where tenant_id=target;
 elsif changed or revision=0 then revision:=onboarding_private.advance_revision(target); end if;
 -- All aggregate writes follow tenant lock; deterministically lock changed children.
 if changed then
  for item in select value from jsonb_array_elements(plan) order by value->>'id' loop
   perform onboarding_private.persist_row(item->>'relation',target,(item->>'id')::uuid,item->'data');
  end loop;
 end if;
 insert into onboarding_private.receipts(tenant_id,actor_user_id,command,request_id,input_digest,result_id,target_date,result_version,config_revision)
 values(target,actor_id,command,request,digest,result_id,key_date,revision,revision);
 return onboarding_private.saved_result('saved',command,target,revision,result_id,revision);
exception
 when numeric_value_out_of_range then return '{"status":"conflict","reason":"version_exhausted"}';
 when others then return '{"status":"retryable_failure"}';
end; $$;

create function public.onboarding_save_resume(input jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor_id uuid; target uuid; request uuid; expected integer; step text; normalized jsonb; digest bytea; role_value public.app_role; resume_row public.tenant_setup_resume%rowtype; receipt onboarding_private.receipts%rowtype; revision integer; version_value integer; row_id uuid; error_code text; error_field text;
begin
 select actor into actor_id from onboarding_private.current_identity(); if actor_id is null then return '{"status":"unavailable"}'; end if;
 begin
  if input is null then raise exception using errcode='22023',message='invalid_input',detail='input'; end if;
  if onboarding_private.input_size(input)>131072 then raise exception using errcode='22023',message='too_large',detail='input'; end if;
  perform onboarding_private.require_keys(input,array['tenant_id','request_id','expected_version','step_id'],'input');
  target:=onboarding_private.input_uuid(input->'tenant_id','tenant_id'); request:=onboarding_private.input_uuid(input->'request_id','request_id'); expected:=onboarding_private.input_integer(input->'expected_version',0,2147483647,false,'expected_version'); step:=onboarding_private.input_text(input->'step_id',1,20,'step_id');
  if step not in ('access','profile','services','hours','booking','escalation','integrations','review') then raise exception using errcode='22023',message='invalid_input',detail='step_id'; end if;
 exception when invalid_parameter_value then get stacked diagnostics error_code=message_text,error_field=pg_exception_detail; return jsonb_build_object('status','validation_error','issues',jsonb_build_array(jsonb_build_object('field',error_field,'code',error_code))); end;
 select role into role_value from public.memberships where tenant_id=target and user_id=actor_id for share;
 if role_value is null or role_value not in ('owner','admin') then return '{"status":"unavailable"}'; end if;
 perform 1 from public.tenants where id=target for share; if not found then return '{"status":"unavailable"}'; end if;
 perform pg_advisory_xact_lock(hashtextextended('onboarding-v1:'||target||':'||actor_id||':save_resume_step:'||request,0));
 -- Serialize absence and distinct requests by actor, without affecting config revision.
 perform pg_advisory_xact_lock(hashtextextended('onboarding-resume-v1:'||target||':'||actor_id,0));
 normalized:=jsonb_build_object('tenant_id',target,'request_id',request,'expected_version',expected,'step_id',step);
 digest:=sha256(convert_to(onboarding_private.canonical_json(jsonb_build_object('contract_version','onboarding-v1','command','save_resume_step','actor_user_id',actor_id,'input',normalized)),'UTF8'));
 select * into receipt from onboarding_private.receipts where tenant_id=target and actor_user_id=actor_id and command='save_resume_step' and request_id=request;
 if found then
  if receipt.input_digest<>digest then return '{"status":"conflict","reason":"request_reuse"}'; end if;
  return onboarding_private.saved_result('replayed','save_resume_step',target,receipt.config_revision,receipt.resume_id,receipt.result_version);
 end if;
 select * into resume_row from public.tenant_setup_resume where tenant_id=target and user_id=actor_id for update;
 version_value:=coalesce(resume_row.version,0);
 if expected<>version_value then return '{"status":"conflict","reason":"revision"}'; end if;
 row_id:=coalesce(resume_row.id,gen_random_uuid());
 if resume_row.id is null or resume_row.step_id<>step then
  if version_value=2147483647 then return '{"status":"conflict","reason":"version_exhausted"}'; end if;
  perform onboarding_private.persist_row('tenant_setup_resume',target,row_id,jsonb_build_object('user_id',actor_id,'step_id',step)); version_value:=version_value+1;
 end if;
 select config_revision into revision from public.tenant_setup_state where tenant_id=target; revision:=coalesce(revision,0);
 insert into onboarding_private.receipts(tenant_id,actor_user_id,command,request_id,input_digest,resume_id,result_version,config_revision) values(target,actor_id,'save_resume_step',request,digest,row_id,version_value,revision);
 return onboarding_private.saved_result('saved','save_resume_step',target,revision,row_id,version_value);
exception when numeric_value_out_of_range then return '{"status":"conflict","reason":"version_exhausted"}'; when others then return '{"status":"retryable_failure"}';
end; $$;

create function public.onboarding_snapshot(target uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor_id uuid; role_value public.app_role; workspace jsonb; snapshot jsonb; revision integer;
begin
 select actor into actor_id from onboarding_private.current_identity(); if actor_id is null then return '{"status":"unavailable"}'; end if;
 select role into role_value from public.memberships where tenant_id=target and user_id=actor_id for share;
 if role_value is null then return '{"status":"unavailable"}'; end if;
 select jsonb_build_object('id',id,'name',name,'trade',trade,'timezone',timezone) into workspace from public.tenants where id=target for share;
 if workspace is null then return '{"status":"unavailable"}'; end if;
 -- One statement creates the complete projection while tenant config writers are blocked.
 if role_value in ('owner','admin') then
  select jsonb_build_object('projection','owner_setup','workspace',workspace,'flow_version','onboarding-v1','config_revision',coalesce((select config_revision from public.tenant_setup_state where tenant_id=target),0),
   'profile',(select jsonb_build_object('business_contact_name',business_contact_name,'business_email',business_email,'business_phone',business_phone) from public.tenant_business_profiles where tenant_id=target),
   'services',coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',name,'description',description,'enabled',enabled,'position',position,'version',version) order by position,id) from (select id,name,description,enabled,position,version from public.tenant_services where tenant_id=target and enabled order by position,id limit 100) current_services),'[]'),
   'weekly_hours',coalesce((select jsonb_agg(jsonb_build_object('weekday',weekday,'closed',closed,'intervals',intervals) order by weekday) from public.tenant_hours_days where tenant_id=target),'[]'),
   'exceptions',coalesce((select jsonb_agg(jsonb_build_object('id',id,'date',to_char(local_date,'YYYY-MM-DD'),'closed',closed,'intervals',intervals,'active',active,'version',version) order by local_date) from (select id,local_date,closed,intervals,active,version from public.tenant_hours_exceptions where tenant_id=target and active order by local_date limit 366) current_exceptions),'[]'),
   'booking',(select jsonb_build_object('mode',mode,'lead_time_minutes',lead_time_minutes,'buffer_before_minutes',buffer_before_minutes,'buffer_after_minutes',buffer_after_minutes,'horizon_days',horizon_days,'notes',notes,'acknowledged',acknowledged) from public.tenant_booking_preferences where tenant_id=target),
   'escalation',coalesce((select jsonb_agg(jsonb_build_object('id',id,'label',label,'contact_name',contact_name,'email',email,'phone',phone,'enabled',enabled,'position',position,'version',version) order by position,id) from (select id,label,contact_name,email,phone,enabled,position,version from public.tenant_escalation_contacts where tenant_id=target and enabled order by position,id limit 20) current_escalation),'[]'),
   'resume_step',coalesce((select case when flow_version='onboarding-v1' and step_id in ('access','profile','services','hours','booking','escalation','integrations','review') then step_id else 'profile' end from public.tenant_setup_resume where tenant_id=target and user_id=actor_id),'profile'),
   'resume_version',coalesce((select version from public.tenant_setup_resume where tenant_id=target and user_id=actor_id),0),'readiness',onboarding_private.pending_readiness()) into snapshot;
 elsif role_value='dispatcher' then
  select jsonb_build_object('projection','dispatcher_operations','workspace',workspace,'config_revision',coalesce((select config_revision from public.tenant_setup_state where tenant_id=target),0),
   'services',coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',name,'enabled',enabled) order by position,id) from (select id,name,enabled,position from public.tenant_services where tenant_id=target and enabled order by position,id limit 100) current_services),'[]'),
   'weekly_hours',coalesce((select jsonb_agg(jsonb_build_object('weekday',weekday,'closed',closed,'intervals',intervals) order by weekday) from public.tenant_hours_days where tenant_id=target),'[]'),
   'exceptions',coalesce((select jsonb_agg(jsonb_build_object('id',id,'date',to_char(local_date,'YYYY-MM-DD'),'closed',closed,'intervals',intervals) order by local_date) from public.tenant_hours_exceptions where tenant_id=target and active),'[]'),
   'booking',(select jsonb_build_object('mode',mode,'lead_time_minutes',lead_time_minutes,'buffer_before_minutes',buffer_before_minutes,'buffer_after_minutes',buffer_after_minutes,'horizon_days',horizon_days,'notes',notes,'acknowledged',acknowledged) from public.tenant_booking_preferences where tenant_id=target)) into snapshot;
 else snapshot:=jsonb_build_object('projection','workspace','workspace',workspace-array['trade','timezone'],'role',role_value); end if;
 return jsonb_build_object('status','available','snapshot',snapshot);
exception when others then return '{"status":"retryable_failure"}';
end; $$;


create function onboarding_private.normalize_history_list(input jsonb)
returns jsonb language plpgsql set search_path='' as $$
declare output jsonb; target uuid; kind text; state text; sort_value text; direction text; limit_value integer; cursor_value text; search_value text; key text;
begin
 if input is null or jsonb_typeof(input)<>'object' then raise exception using errcode='22023',message='invalid_input',detail='input'; end if;
 if onboarding_private.input_size(input)>131072 then raise exception using errcode='22023',message='too_large',detail='input'; end if;
 if not (input ? 'tenant_id') or not (input ? 'kind') then raise exception using errcode='22023',message='invalid_input',detail='input'; end if;
 for key in select jsonb_object_keys(input) loop
  if key not in ('tenant_id','kind','state','limit','cursor','search','sort','direction') then raise exception using errcode='22023',message='unknown_field',detail='input'; end if;
 end loop;
 target:=onboarding_private.input_uuid(input->'tenant_id','tenant_id'); kind:=onboarding_private.input_text(input->'kind',1,32,'kind');
 if kind not in ('services','escalation_contacts','date_exceptions') then raise exception using errcode='22023',message='invalid_input',detail='kind'; end if;
 state:=case when input ? 'state' then onboarding_private.input_text(input->'state',1,32,'state') else case when kind='date_exceptions' then 'inactive' else 'disabled' end end;
 if state not in ('disabled','inactive','all_retained') or (kind='date_exceptions' and state='disabled') or (kind<>'date_exceptions' and state='inactive') then raise exception using errcode='22023',message='invalid_input',detail='state'; end if;
 sort_value:=case when input ? 'sort' then onboarding_private.input_text(input->'sort',1,32,'sort') else case when kind='date_exceptions' then 'local_date' else 'position' end end;
 if sort_value not in ('position','updated_at','local_date') or (kind='date_exceptions' and sort_value='position') or (kind<>'date_exceptions' and sort_value='local_date') then raise exception using errcode='22023',message='invalid_input',detail='sort'; end if;
 direction:=case when input ? 'direction' then onboarding_private.input_text(input->'direction',1,8,'direction') else 'asc' end;
 if direction not in ('asc','desc') then raise exception using errcode='22023',message='invalid_input',detail='direction'; end if;
 limit_value:=case when input ? 'limit' then onboarding_private.input_integer(input->'limit',1,50,false,'limit') else 25 end;
 cursor_value:=case when input ? 'cursor' and input->'cursor'<>'null'::jsonb then onboarding_private.input_text(input->'cursor',1,512,'cursor') else null end;
 search_value:=case when input ? 'search' and input->'search'<>'null'::jsonb then onboarding_private.input_text(input->'search',0,120,'search') else null end;
 if kind='date_exceptions' and coalesce(search_value,'')<>'' then raise exception using errcode='22023',message='invalid_input',detail='search'; end if;
 output:=jsonb_build_object('tenant_id',target,'kind',kind,'state',state,'limit',limit_value,'cursor',cursor_value,'search',nullif(search_value,''),'sort',sort_value,'direction',direction);
 return output;
end; $$;
create function onboarding_private.normalize_history_reenable(input jsonb)
returns jsonb language plpgsql set search_path='' as $$
declare target uuid; request uuid; expected integer; kind text; row_id uuid; payload jsonb; normalized jsonb; closed boolean; key text;
begin
 if input is null or jsonb_typeof(input)<>'object' then raise exception using errcode='22023',message='invalid_input',detail='input'; end if;
 if onboarding_private.input_size(input)>131072 then raise exception using errcode='22023',message='too_large',detail='input'; end if;
 perform onboarding_private.require_keys(input,array['tenant_id','request_id','expected_config_revision','kind','row_id','payload'],'input');
 target:=onboarding_private.input_uuid(input->'tenant_id','tenant_id'); request:=onboarding_private.input_uuid(input->'request_id','request_id'); expected:=onboarding_private.input_integer(input->'expected_config_revision',0,2147483647,false,'expected_config_revision'); kind:=onboarding_private.input_text(input->'kind',1,32,'kind'); row_id:=onboarding_private.input_uuid(input->'row_id','row_id');
 if kind not in ('services','escalation_contacts','date_exceptions') then raise exception using errcode='22023',message='invalid_input',detail='kind'; end if;
 payload:=input->'payload';
 if kind='services' then
  perform onboarding_private.require_keys(payload,array['name','description','position'],'payload');
  normalized:=jsonb_build_object('name',onboarding_private.input_text(payload->'name',0,120,'name'),'description',onboarding_private.input_text(payload->'description',0,2000,'description'),'position',onboarding_private.input_integer(payload->'position',0,9999,false,'position'));
 elsif kind='escalation_contacts' then
  perform onboarding_private.require_keys(payload,array['label','contact_name','email','phone','position'],'payload');
  normalized:=jsonb_build_object('label',onboarding_private.input_text(payload->'label',0,120,'label'),'contact_name',onboarding_private.input_text(payload->'contact_name',0,160,'contact_name'),'email',onboarding_private.input_contact(payload->'email','email','email'),'phone',onboarding_private.input_contact(payload->'phone','phone','phone'),'position',onboarding_private.input_integer(payload->'position',0,9999,false,'position'));
 else
  perform onboarding_private.require_keys(payload,array['date','closed','intervals'],'payload');
  closed:=onboarding_private.input_boolean(payload->'closed','closed');
  normalized:=jsonb_build_object('date',to_char(onboarding_private.input_date(payload->'date','date'),'YYYY-MM-DD'),'closed',closed,'intervals',onboarding_private.input_intervals(payload->'intervals',closed,'intervals'));
 end if;
 return jsonb_build_object('tenant_id',target,'request_id',request,'expected_config_revision',expected,'kind',kind,'row_id',row_id,'payload',normalized);
end; $$;
create table if not exists onboarding_private.history_cursors (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id), actor_user_id uuid not null,
 kind text not null check(kind in ('services','escalation_contacts','date_exceptions')),
 state text not null check(state in ('disabled','inactive','all_retained')),
 search_digest bytea not null check(octet_length(search_digest)=32), sort_value text not null check(sort_value in ('position','updated_at','local_date')),
 direction text not null check(direction in ('asc','desc')), last_id uuid not null, last_value text not null check(onboarding_private.valid_text(last_value,1,80)),
 expires_at timestamptz not null check(isfinite(expires_at)), created_at timestamptz not null default now(), check(expires_at>created_at)
);
alter table onboarding_private.history_cursors enable row level security;
revoke all on onboarding_private.history_cursors from public,anon,authenticated;
create index if not exists onboarding_history_cursor_expiry_idx on onboarding_private.history_cursors(expires_at);

create function public.onboarding_history_list(input jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor_id uuid; normalized jsonb; target uuid; kind text; state text; sort_value text; direction text; limit_value integer; cursor_value text; search_value text; revision integer; role_value public.app_role; cursor_token uuid; cursor_row onboarding_private.history_cursors%rowtype; cursor_id uuid; cursor_last text; rows jsonb:='[]'; items jsonb:='[]'; total integer:=0; last_item jsonb; next_cursor text:=null; like_pattern text; search_digest bytea; error_code text; error_field text;
begin
 select actor into actor_id from onboarding_private.current_identity(); if actor_id is null then return '{"status":"unavailable"}'; end if;
 begin normalized:=onboarding_private.normalize_history_list(input); exception when invalid_parameter_value then get stacked diagnostics error_code=message_text,error_field=pg_exception_detail; return jsonb_build_object('status','validation_error','issues',jsonb_build_array(jsonb_build_object('field',error_field,'code',error_code))); end;
 target:=(normalized->>'tenant_id')::uuid; kind:=normalized->>'kind'; state:=normalized->>'state'; sort_value:=normalized->>'sort'; direction:=normalized->>'direction'; limit_value:=(normalized->>'limit')::integer; cursor_value:=normalized->>'cursor'; search_value:=normalized->>'search';
 select role into role_value from public.memberships where tenant_id=target and user_id=actor_id for share;
 if role_value is null or role_value not in ('owner','admin') then return '{"status":"unavailable"}'; end if;
 perform 1 from public.tenants where id=target for share; if not found then return '{"status":"unavailable"}'; end if;
 select config_revision into revision from public.tenant_setup_state where tenant_id=target; revision:=coalesce(revision,0);
 search_digest:=sha256(convert_to(coalesce(search_value,''),'UTF8'));
 if cursor_value is not null then
  begin cursor_token:=onboarding_private.input_uuid(to_jsonb(cursor_value),'cursor'); exception when invalid_parameter_value then get stacked diagnostics error_code=message_text,error_field=pg_exception_detail; return jsonb_build_object('status','validation_error','issues',jsonb_build_array(jsonb_build_object('field',error_field,'code',error_code))); end;
  select * into cursor_row from onboarding_private.history_cursors where id=cursor_token;
  if not found or cursor_row.expires_at<=clock_timestamp() or cursor_row.tenant_id<>target or cursor_row.actor_user_id<>actor_id or cursor_row.kind<>kind or cursor_row.state<>state or cursor_row.search_digest<>search_digest or cursor_row.sort_value<>sort_value or cursor_row.direction<>direction then return '{"status":"unavailable"}'; end if;
  cursor_id:=cursor_row.last_id; cursor_last:=cursor_row.last_value;
 end if;
 like_pattern:=case when search_value is null then null else '%'||replace(replace(replace(search_value,'\','\\'),'%','\%'),'_','\_')||'%' end;
 if kind='services' then
  select coalesce(jsonb_agg(item),'[]'),count(*) into rows,total from (
   select jsonb_build_object('id',id,'kind','service','state',case when enabled then 'active' else 'disabled' end,'version',version,'name',name,'description',description,'position',position,'updated_at',to_char(updated_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),'can_reenable',not enabled and version<2147483647) item, position, updated_at, id from public.tenant_services
   where tenant_id=target and (state='all_retained' or not enabled) and (like_pattern is null or name ilike like_pattern escape '\') and (cursor_value is null or (sort_value='position' and ((direction='asc' and (position,id)>((cursor_last)::integer,cursor_id)) or (direction='desc' and (position,id)<((cursor_last)::integer,cursor_id)))) or (sort_value='updated_at' and ((direction='asc' and (updated_at,id)>((cursor_last)::timestamptz,cursor_id)) or (direction='desc' and (updated_at,id)<((cursor_last)::timestamptz,cursor_id)))))
   order by case when sort_value='position' and direction='asc' then position end asc, case when sort_value='position' and direction='desc' then position end desc, case when sort_value='updated_at' and direction='asc' then updated_at end asc, case when sort_value='updated_at' and direction='desc' then updated_at end desc, case when direction='asc' then id end asc, case when direction='desc' then id end desc limit limit_value+1) page;
 elsif kind='escalation_contacts' then
  select coalesce(jsonb_agg(item),'[]'),count(*) into rows,total from (
   select jsonb_build_object('id',id,'kind','escalation_contact','state',case when enabled then 'active' else 'disabled' end,'version',version,'label',label,'contact_name',contact_name,'email',email,'phone',phone,'position',position,'updated_at',to_char(updated_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),'can_reenable',not enabled and version<2147483647) item, position, updated_at, id from public.tenant_escalation_contacts
   where tenant_id=target and (state='all_retained' or not enabled) and (like_pattern is null or label ilike like_pattern escape '\' or contact_name ilike like_pattern escape '\') and (cursor_value is null or (sort_value='position' and ((direction='asc' and (position,id)>((cursor_last)::integer,cursor_id)) or (direction='desc' and (position,id)<((cursor_last)::integer,cursor_id)))) or (sort_value='updated_at' and ((direction='asc' and (updated_at,id)>((cursor_last)::timestamptz,cursor_id)) or (direction='desc' and (updated_at,id)<((cursor_last)::timestamptz,cursor_id)))))
   order by case when sort_value='position' and direction='asc' then position end asc, case when sort_value='position' and direction='desc' then position end desc, case when sort_value='updated_at' and direction='asc' then updated_at end asc, case when sort_value='updated_at' and direction='desc' then updated_at end desc, case when direction='asc' then id end asc, case when direction='desc' then id end desc limit limit_value+1) page;
 else
  select coalesce(jsonb_agg(item),'[]'),count(*) into rows,total from (
   select jsonb_build_object('id',id,'kind','date_exception','state',case when active then 'active' else 'inactive' end,'version',version,'date',to_char(local_date,'YYYY-MM-DD'),'closed',closed,'intervals',intervals,'updated_at',to_char(updated_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),'can_reenable',not active and version<2147483647) item, local_date, updated_at, id from public.tenant_hours_exceptions
   where tenant_id=target and (state='all_retained' or not active) and (cursor_value is null or (sort_value='local_date' and ((direction='asc' and (local_date,id)>((cursor_last)::date,cursor_id)) or (direction='desc' and (local_date,id)<((cursor_last)::date,cursor_id)))) or (sort_value='updated_at' and ((direction='asc' and (updated_at,id)>((cursor_last)::timestamptz,cursor_id)) or (direction='desc' and (updated_at,id)<((cursor_last)::timestamptz,cursor_id)))))
   order by case when sort_value='local_date' and direction='asc' then local_date end asc, case when sort_value='local_date' and direction='desc' then local_date end desc, case when sort_value='updated_at' and direction='asc' then updated_at end asc, case when sort_value='updated_at' and direction='desc' then updated_at end desc, case when direction='asc' then id end asc, case when direction='desc' then id end desc limit limit_value+1) page;
 end if;
 select coalesce(jsonb_agg(value),'[]') into items from jsonb_array_elements(rows) with ordinality as entries(value,ordinal) where ordinal<=limit_value;
 if total>limit_value then
  last_item:=items->(limit_value-1);
  insert into onboarding_private.history_cursors(tenant_id,actor_user_id,kind,state,search_digest,sort_value,direction,last_id,last_value,expires_at)
  values(target,actor_id,kind,state,search_digest,sort_value,direction,(last_item->>'id')::uuid,case when sort_value='position' then last_item->>'position' when sort_value='local_date' then last_item->>'date' else last_item->>'updated_at' end,clock_timestamp()+interval '15 minutes') returning id::text into next_cursor;
 end if;
 return jsonb_build_object('status','available','tenant_id',target,'kind',kind,'config_revision',revision,'items',items,'page',jsonb_build_object('limit',limit_value,'next_cursor',next_cursor,'has_more',total>limit_value));
exception when others then return '{"status":"retryable_failure"}';
end; $$;

create function public.onboarding_history_reenable(input jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor_id uuid; normalized jsonb; target uuid; request uuid; expected integer; kind text; row_id uuid; payload jsonb; revision integer; role_value public.app_role; receipt onboarding_private.receipts%rowtype; digest bytea; changed boolean; row_version integer; row_date date; error_code text; error_field text;
begin
 select actor into actor_id from onboarding_private.current_identity(); if actor_id is null then return '{"status":"unavailable"}'; end if;
 begin normalized:=onboarding_private.normalize_history_reenable(input); exception when invalid_parameter_value then get stacked diagnostics error_code=message_text,error_field=pg_exception_detail; return jsonb_build_object('status','validation_error','issues',jsonb_build_array(jsonb_build_object('field',error_field,'code',error_code))); end;
 target:=(normalized->>'tenant_id')::uuid; request:=(normalized->>'request_id')::uuid; expected:=(normalized->>'expected_config_revision')::integer; kind:=normalized->>'kind'; row_id:=(normalized->>'row_id')::uuid; payload:=normalized->'payload';
 select role into role_value from public.memberships where tenant_id=target and user_id=actor_id for share;
 if role_value is null or role_value not in ('owner','admin') then return '{"status":"unavailable"}'; end if;
 perform 1 from public.tenants where id=target for update; if not found then return '{"status":"unavailable"}'; end if;
 perform pg_advisory_xact_lock(hashtextextended('onboarding-v1:'||target||':'||actor_id||':onboarding_history_reenable:'||request,0));
 select config_revision into revision from public.tenant_setup_state where tenant_id=target for update; revision:=coalesce(revision,0);
 digest:=sha256(convert_to(onboarding_private.canonical_json(jsonb_build_object('contract_version','onboarding-v1','command','onboarding_history_reenable','actor_user_id',actor_id,'input',normalized)),'UTF8'));
 select * into receipt from onboarding_private.receipts where tenant_id=target and actor_user_id=actor_id and command='onboarding_history_reenable' and request_id=request;
 if found then
  if receipt.input_digest<>digest then return '{"status":"conflict","reason":"request_reuse"}'; end if;
  return onboarding_private.saved_history_result('replayed',receipt.history_kind,receipt.history_row_id,receipt.result_version,receipt.config_revision);
 end if;
 if expected<>revision then return '{"status":"conflict","reason":"revision"}'; end if;
 if kind='services' then
  perform 1 from public.tenant_services where tenant_id=target and id=row_id and not enabled for update;
  if not found then return '{"status":"unavailable"}'; end if;
  if (select count(*) from public.tenant_services where tenant_id=target and enabled)>=100 then return '{"status":"validation_error","issues":[{"field":"payload","code":"invalid_input"}]}'; end if;
  changed:=onboarding_private.row_changed('tenant_services',target,row_id,payload||'{"enabled":true}');
  if changed and revision=2147483647 then return '{"status":"conflict","reason":"version_exhausted"}'; end if;
  if changed then revision:=onboarding_private.advance_revision(target); perform onboarding_private.persist_row('tenant_services',target,row_id,payload||'{"enabled":true}'); end if;
  select version into row_version from public.tenant_services where tenant_id=target and id=row_id;
 elsif kind='escalation_contacts' then
  perform 1 from public.tenant_escalation_contacts where tenant_id=target and id=row_id and not enabled for update;
  if not found then return '{"status":"unavailable"}'; end if;
  if (select count(*) from public.tenant_escalation_contacts where tenant_id=target and enabled)>=20 then return '{"status":"validation_error","issues":[{"field":"payload","code":"invalid_input"}]}'; end if;
  changed:=onboarding_private.row_changed('tenant_escalation_contacts',target,row_id,payload||'{"enabled":true}');
  if changed and revision=2147483647 then return '{"status":"conflict","reason":"version_exhausted"}'; end if;
  if changed then revision:=onboarding_private.advance_revision(target); perform onboarding_private.persist_row('tenant_escalation_contacts',target,row_id,payload||'{"enabled":true}'); end if;
  select version into row_version from public.tenant_escalation_contacts where tenant_id=target and id=row_id;
 else
  select local_date into row_date from public.tenant_hours_exceptions where tenant_id=target and id=row_id and not active for update;
  if row_date is null then return '{"status":"unavailable"}'; end if;
  if row_date<>(payload->>'date')::date then return '{"status":"validation_error","issues":[{"field":"date","code":"invalid_date"}]}'; end if;
  changed:=onboarding_private.row_changed('tenant_hours_exceptions',target,row_id,(payload-'date')||jsonb_build_object('local_date',to_char(row_date,'YYYY-MM-DD'),'active',true));
  if changed and revision=2147483647 then return '{"status":"conflict","reason":"version_exhausted"}'; end if;
  if changed then revision:=onboarding_private.advance_revision(target); perform onboarding_private.persist_row('tenant_hours_exceptions',target,row_id,(payload-'date')||jsonb_build_object('local_date',to_char(row_date,'YYYY-MM-DD'),'active',true)); end if;
  select version into row_version from public.tenant_hours_exceptions where tenant_id=target and id=row_id;
 end if;
 insert into onboarding_private.receipts(tenant_id,actor_user_id,command,request_id,input_digest,result_version,config_revision,history_kind,history_row_id) values(target,actor_id,'onboarding_history_reenable',request,digest,row_version,revision,kind,row_id);
 return onboarding_private.saved_history_result('saved',kind,row_id,row_version,revision);
exception when numeric_value_out_of_range then return '{"status":"conflict","reason":"version_exhausted"}'; when others then return '{"status":"retryable_failure"}';
end; $$;

create function public.onboarding_accept_invitation(input jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor_id uuid; email_value text; request uuid; token_hash bytea; digest bytea; preliminary onboarding_private.invitations%rowtype; invitation onboarding_private.invitations%rowtype; receipt onboarding_private.receipts%rowtype; role_value public.app_role; workspace jsonb; outcome text; affected integer; accepted_time timestamptz;
begin
 -- Malformed tokens never disclose validation/identity details.
 begin
  if input is null or onboarding_private.input_size(input)>131072 then return '{"status":"unavailable"}'; end if;
  perform onboarding_private.require_keys(input,array['request_id','token'],'input'); request:=onboarding_private.input_uuid(input->'request_id','request_id');
  if jsonb_typeof(input->'token')<>'string' then return '{"status":"unavailable"}'; end if;
  token_hash:=onboarding_private.token_digest(input->>'token'); if token_hash is null then return '{"status":"unavailable"}'; end if;
 exception when invalid_parameter_value then return '{"status":"unavailable"}'; end;
 select actor,canonical_email into actor_id,email_value from onboarding_private.current_identity(); if actor_id is null then return '{"status":"unavailable"}'; end if;
 -- Lookup identifies locks only, never supplies authorization or a response.
 select * into preliminary from onboarding_private.invitations where token_digest=token_hash;
 if not found then return '{"status":"unavailable"}'; end if;
 perform pg_advisory_xact_lock(hashtextextended('membership-v1:'||preliminary.tenant_id||':'||preliminary.recipient_user_id,0));
 select role into role_value from public.memberships where tenant_id=preliminary.tenant_id and user_id=actor_id for share;
 select jsonb_build_object('id',id,'name',name) into workspace from public.tenants where id=preliminary.tenant_id for share;
 if workspace is null then return '{"status":"unavailable"}'; end if;
 perform pg_advisory_xact_lock(hashtextextended('onboarding-v1:'||preliminary.tenant_id||':'||actor_id||':invite_accept:'||request,0));
 select * into invitation from onboarding_private.invitations where id=preliminary.id for update;
 if not found or invitation.token_digest<>token_hash or invitation.tenant_id<>preliminary.tenant_id or invitation.recipient_user_id<>actor_id or invitation.recipient_email<>email_value or invitation.status='revoked' then return '{"status":"unavailable"}'; end if;
 if invitation.status='accepted' then
  if invitation.accepted_by<>actor_id or role_value is null or role_value<>invitation.intended_role then return '{"status":"unavailable"}'; end if;
 elsif invitation.expires_at<=clock_timestamp() then return '{"status":"unavailable"}';
 elsif role_value is not null and role_value<>invitation.intended_role then return '{"status":"membership_conflict"}'; end if;
 digest:=sha256(convert_to(onboarding_private.canonical_json(jsonb_build_object('contract_version','onboarding-v1','command','invite_accept','tenant_id',invitation.tenant_id,'actor_user_id',actor_id,'request_id',request,'token_digest_hex',encode(token_hash,'hex'))),'UTF8'));
 select * into receipt from onboarding_private.receipts where tenant_id=invitation.tenant_id and actor_user_id=actor_id and command='invite_accept' and request_id=request;
 if found then
  if receipt.input_digest<>digest then return '{"status":"conflict","reason":"request_reuse"}'; end if;
  if invitation.status<>'accepted' or receipt.invitation_id<>invitation.id or receipt.intended_role<>invitation.intended_role or receipt.accepted_at<>invitation.accepted_at then return '{"status":"retryable_failure"}'; end if;
  outcome:='replayed'; accepted_time:=receipt.accepted_at;
 elsif invitation.status='accepted' then outcome:='already_accepted'; accepted_time:=invitation.accepted_at;
 else
  if invitation.version=2147483647 then return '{"status":"retryable_failure"}'; end if;
  if role_value is null then
   insert into public.memberships(tenant_id,user_id,role) values(invitation.tenant_id,actor_id,invitation.intended_role) on conflict(tenant_id,user_id) do nothing;
   get diagnostics affected=row_count;
   if affected=0 then
    -- Noncooperating writer collision: read a fresh snapshot, never take a late
    -- membership lock after tenant. Retry from the original full lock sequence.
    select role into role_value from public.memberships where tenant_id=invitation.tenant_id and user_id=actor_id;
    if role_value is not null and role_value<>invitation.intended_role then return '{"status":"membership_conflict"}'; end if;
    return '{"status":"retryable_failure"}';
   end if;
   insert into public.audit_events(tenant_id,actor_user_id,entity_type,entity_id,action) values(invitation.tenant_id,actor_id,'memberships',actor_id,'INSERT');
  end if;
  accepted_time:=clock_timestamp();
  update onboarding_private.invitations set status='accepted',accepted_by=actor_id,accepted_at=accepted_time,version=version+1,updated_by=actor_id,updated_at=accepted_time where id=invitation.id;
  insert into public.audit_events(tenant_id,actor_user_id,entity_type,entity_id,action) values(invitation.tenant_id,actor_id,'onboarding_invitation',invitation.id,'UPDATE');
  outcome:='accepted';
 end if;
 if outcome<>'replayed' then
  insert into onboarding_private.receipts(tenant_id,actor_user_id,command,request_id,input_digest,invitation_id,intended_role,accepted_at) values(invitation.tenant_id,actor_id,'invite_accept',request,digest,invitation.id,invitation.intended_role,accepted_time);
 end if;
 -- Tenant lock protects fresh name/config routing; policy remains unevaluated.
 return jsonb_build_object('status',outcome,'acceptance',jsonb_build_object('invitation_id',invitation.id,'accepted_at',to_char(accepted_time at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"')),'workspace',workspace,'role',invitation.intended_role,'entry','setup');
exception when others then return '{"status":"retryable_failure"}';
end; $$;

-- Explicit ownership/ACLs; only guarded onboarding entrypoints are callable.
do $$ declare routine record; begin
 for routine in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='onboarding_private' loop
  execute format('alter function %s owner to postgres',routine.signature);
  execute format('revoke all on function %s from public,anon,authenticated',routine.signature);
 end loop;
end; $$;
alter function public.onboarding_configure(text,jsonb) owner to postgres;
alter function public.onboarding_save_resume(jsonb) owner to postgres;
alter function public.onboarding_snapshot(uuid) owner to postgres;
alter function public.onboarding_accept_invitation(jsonb) owner to postgres;
alter function public.onboarding_history_list(jsonb) owner to postgres;
alter function public.onboarding_history_reenable(jsonb) owner to postgres;
revoke all on function public.onboarding_configure(text,jsonb),public.onboarding_save_resume(jsonb),public.onboarding_snapshot(uuid),public.onboarding_accept_invitation(jsonb),public.onboarding_history_list(jsonb),public.onboarding_history_reenable(jsonb) from public,anon,authenticated;
grant execute on function public.onboarding_configure(text,jsonb),public.onboarding_save_resume(jsonb),public.onboarding_snapshot(uuid),public.onboarding_accept_invitation(jsonb),public.onboarding_history_list(jsonb),public.onboarding_history_reenable(jsonb) to authenticated;
commit;


