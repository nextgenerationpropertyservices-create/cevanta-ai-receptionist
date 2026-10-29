-- Delete an unprotected job through a narrow tenant-scoped command.
-- Ordinary authenticated sessions intentionally retain no direct DELETE grant.
begin;

create or replace function public.delete_job(
  target_tenant uuid,
  target_job uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid;
  actor_role public.app_role;
  deleted_job_id uuid;
begin
  select actor
  into actor_id
  from onboarding_private.current_identity();

  if actor_id is null or target_tenant is null or target_job is null then
    return '{"status":"unavailable"}'::jsonb;
  end if;

  select m.role
  into actor_role
  from public.memberships m
  where m.tenant_id = target_tenant
    and m.user_id = actor_id
  for share;

  if actor_role is null or actor_role not in ('owner', 'admin', 'dispatcher') then
    return '{"status":"unavailable"}'::jsonb;
  end if;

  begin
    delete from public.jobs j
    where j.tenant_id = target_tenant
      and j.id = target_job
    returning j.id into deleted_job_id;
  exception
    when foreign_key_violation then
      -- Appointments and other linked records remain intact. Do not expose
      -- which relationship protected the job.
      return '{"status":"protected"}'::jsonb;
  end;

  if deleted_job_id is null then
    return '{"status":"unavailable"}'::jsonb;
  end if;

  return '{"status":"deleted"}'::jsonb;
exception
  when others then
    -- The exception block is a PostgreSQL subtransaction: an audit or other
    -- unexpected failure rolls the delete back before this safe result.
    return '{"status":"unavailable"}'::jsonb;
end;
$$;

alter function public.delete_job(uuid, uuid) owner to postgres;
revoke all on function public.delete_job(uuid, uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.delete_job(uuid, uuid) to authenticated;

commit;
