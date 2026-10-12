begin;

create or replace function public.valid_technician_service_areas(items text[])
returns boolean language sql immutable as $$
 select items is not null
  and cardinality(items) <= 30
  and not exists(
   select 1 from unnest(items) item
   where item is null or btrim(item) = '' or length(item) > 60
  );
$$;

create or replace function public.valid_technician_availability_windows(value jsonb)
returns boolean language plpgsql immutable set search_path='' as $$
declare item jsonb; seen_days text[] := '{}'; day_value text; start_value text; end_value text;
begin
 if value is null or jsonb_typeof(value) <> 'array' or jsonb_array_length(value) > 14 then return false; end if;
 for item in select * from jsonb_array_elements(value) loop
  if jsonb_typeof(item) <> 'object' then return false; end if;
  if (select count(*) from jsonb_object_keys(item)) <> 3 then return false; end if;
  if not (item ? 'day' and item ? 'start' and item ? 'end') then return false; end if;
  if jsonb_typeof(item->'day') is distinct from 'string' or jsonb_typeof(item->'start') is distinct from 'string' or jsonb_typeof(item->'end') is distinct from 'string' then return false; end if;
  day_value := item->>'day'; start_value := item->>'start'; end_value := item->>'end';
  if day_value not in ('monday','tuesday','wednesday','thursday','friday','saturday','sunday') then return false; end if;
  if day_value = any(seen_days) then return false; end if;
  if start_value !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' or end_value !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then return false; end if;
  if start_value >= end_value then return false; end if;
  seen_days := array_append(seen_days, day_value);
 end loop;
 return true;
end; $$;

alter table public.technician_profiles
 add column if not exists service_areas text[] not null default '{}',
 add column if not exists availability_windows jsonb not null default '[]'::jsonb;

alter table public.technician_profiles
 drop constraint if exists technician_profiles_service_areas_limit,
 drop constraint if exists technician_profiles_availability_windows_array,
 drop constraint if exists technician_profiles_availability_windows_size,
 add constraint technician_profiles_service_areas_valid check(public.valid_technician_service_areas(service_areas)),
 add constraint technician_profiles_availability_windows_valid check(public.valid_technician_availability_windows(availability_windows));

revoke all on function public.valid_technician_service_areas(text[]) from public,anon,authenticated;
revoke all on function public.valid_technician_availability_windows(jsonb) from public,anon,authenticated;
grant execute on function public.valid_technician_service_areas(text[]) to authenticated;
grant execute on function public.valid_technician_availability_windows(jsonb) to authenticated;

grant insert(service_areas,availability_windows) on public.technician_profiles to authenticated;
grant update(service_areas,availability_windows) on public.technician_profiles to authenticated;

commit;


