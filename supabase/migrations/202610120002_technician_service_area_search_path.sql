begin;

create or replace function public.valid_technician_service_areas(items text[])
returns boolean
language sql
immutable
set search_path = ''
as $$
  select items is not null
    and cardinality(items) <= 30
    and not exists (
      select 1
      from unnest(items) item
      where item is null
        or btrim(item) = ''
        or length(item) > 60
    );
$$;

revoke all on function public.valid_technician_service_areas(text[]) from public, anon, authenticated;
grant execute on function public.valid_technician_service_areas(text[]) to authenticated;

commit;
