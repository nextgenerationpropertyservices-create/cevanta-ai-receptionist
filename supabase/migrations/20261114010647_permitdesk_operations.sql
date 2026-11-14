begin;
alter table public.job_permits
  add column utility_status text not null default 'not_required' check (utility_status in ('not_required','pending','scheduled','complete')),
  add column utility_reference text not null default '' check (length(utility_reference) <= 160),
  add column inspection_status text not null default 'not_scheduled' check (inspection_status in ('not_scheduled','scheduled','corrections','passed','cancelled')),
  add column inspection_date date,
  add column inspection_notes text not null default '' check (length(inspection_notes) <= 4000),
  add constraint permit_inspection_date_required check (inspection_status <> 'scheduled' or inspection_date is not null);
grant update (utility_status,utility_reference,inspection_status,inspection_date,inspection_notes) on public.job_permits to authenticated;
alter table public.job_permits
  add column closeout_reference text not null default '' check (length(closeout_reference) <= 160),
  add column closed_on date;
grant update (closeout_reference,closed_on) on public.job_permits to authenticated;

create function public.check_permit_closeout() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.status = 'closed'
    and (old.status <> 'closed' or old.closed_on is not null
      or new.closed_on is not null or new.closeout_reference <> '')
    and (new.inspection_status <> 'passed' or new.closed_on is null
      or new.closed_on < new.submitted_on or btrim(new.closeout_reference) = '') then
    raise exception 'Closeout requires a passed inspection, final reference and valid date.' using errcode = '23514';
  end if;
  return new;
end;
$$;
create trigger check_permit_closeout before update on public.job_permits
for each row execute function public.check_permit_closeout();
alter table public.job_permits add column parcel text not null default '' check (length(parcel) <= 1000);
alter table public.job_permits add column permit_coordinator text not null default '' check (length(permit_coordinator) <= 1000);
alter table public.job_permits add column blocker text not null default '' check (length(blocker) <= 1000);
alter table public.job_permits add column utility_provider text not null default '' check (length(utility_provider) <= 1000);
alter table public.job_permits add column meter_spot text not null default '' check (length(meter_spot) <= 1000);
alter table public.job_permits add column inspection_type text not null default '' check (length(inspection_type) <= 1000);
alter table public.job_permits add column first_inspection text not null default '' check (length(first_inspection) <= 1000);
alter table public.job_permits add column load_reviewer text not null default '' check (length(load_reviewer) <= 1000);
alter table public.job_permits add column photo_checklist text not null default '' check (length(photo_checklist) <= 1000);
alter table public.job_permits add column inspection_preparation text not null default '' check (length(inspection_preparation) <= 1000);
alter table public.job_permits add column existing_va text not null default '' check (length(existing_va) <= 1000);
alter table public.job_permits add column added_va text not null default '' check (length(added_va) <= 1000);
alter table public.job_permits add column minimum_service text not null default '' check (length(minimum_service) <= 1000);
alter table public.job_permits add column issued_on date;
alter table public.job_permits add column expires_on date;
alter table public.job_permits add column work_on date;
alter table public.job_permits add column disconnect_on date;
alter table public.job_permits add column reconnect_on date;
grant update (parcel, permit_coordinator, blocker, utility_provider, meter_spot, inspection_type, first_inspection, load_reviewer, photo_checklist, inspection_preparation, existing_va, added_va, minimum_service, issued_on, expires_on, work_on, disconnect_on, reconnect_on) on public.job_permits to authenticated;
commit;
