begin;

alter table public.technician_roster
  add column phone text;

alter table public.technician_roster
  add constraint technician_roster_phone_length
  check (phone is null or length(btrim(phone)) between 1 and 40);

commit;
