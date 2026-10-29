-- CEV-PROJECT-AUDIT-167J: repair coarse audit writes for tenant-keyed milestone rows.
begin;

drop trigger if exists audit_client_onboarding_milestones on public.client_onboarding_milestones;

create or replace function onboarding_private.record_client_onboarding_milestone_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_tenant_id uuid;
begin
  if tg_op = 'DELETE' then
    target_tenant_id := old.tenant_id;
  else
    target_tenant_id := new.tenant_id;
  end if;

  insert into public.audit_events(tenant_id, actor_user_id, entity_type, entity_id, action)
  values (
    target_tenant_id,
    (select auth.uid()),
    'client_onboarding_milestones',
    target_tenant_id,
    tg_op
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

alter function onboarding_private.record_client_onboarding_milestone_audit() owner to postgres;
revoke all on function onboarding_private.record_client_onboarding_milestone_audit() from public, anon, authenticated;

create trigger audit_client_onboarding_milestones
after insert or update or delete on public.client_onboarding_milestones
for each row execute function onboarding_private.record_client_onboarding_milestone_audit();

commit;
