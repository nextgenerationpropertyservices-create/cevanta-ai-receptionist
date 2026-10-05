-- CEV-ONBOARD-RPC-46. No issuance, delivery, continuation or readiness checker.
begin;
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
 if input is null or octet_length(convert_to(input::text,'UTF8'))>131072 then raise exception using errcode='22023',message='too_large',detail='input'; end if;
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
 return query select u.id,lower(btrim(u.email,E'\t\n\v\f\r ')) from auth.users u where u.id=auth.uid() and u.email_confirmed_at is not null and u.deleted_at is null and onboarding_private.valid_email(btrim(u.email,E'\t\n\v\f\r ')) and u.email is not null for share of u;
end; $$;
create function onboarding_private.pending_readiness()
returns jsonb language sql immutable set search_path='' as $$
 select '{"configuration_state":"not_evaluated","manual_workspace_state":"not_evaluated","reason":"setup_policy_pending","next_action":"platform_operator","booking_state":"blocked","release_state":"not_evaluated","hostedReady":false,"providerConnectionAuthorized":false}'::jsonb;
$$;
create function onboarding_private.saved_result(state text, command text, target uuid, revision integer, result_id uuid, result_version integer)
returns jsonb language sql immutable set search_path='' as $$
 select jsonb_build_object('status',state,'entity',case when command='save_resume_step' then 'resume' when command in ('upsert_hours_exception','remove_hours_exception') then 'exception' else 'setup' end,'id',case when command='save_resume_step' or command in ('upsert_hours_exception','remove_hours_exception') then result_id else target end,'version',result_version,'config_revision',revision);
$$;
