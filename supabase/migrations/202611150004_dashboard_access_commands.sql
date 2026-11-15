begin;

do $$
declare
  original text;
  guarded text;
begin
  original := pg_get_functiondef('public.delete_job(uuid,uuid)'::regprocedure);
  guarded := replace(original, 'if actor_role is null or actor_role not in',
    'if not public.missed_call_available(target_tenant) or actor_role is null or actor_role not in');
  if guarded = original then raise exception 'Missing job deletion access guard anchor'; end if;
  execute guarded;

  original := pg_get_functiondef('public.has_reactivation_office_access(uuid)'::regprocedure);
  guarded := replace(original, 'if actor_id is null then',
    'if actor_id is null or not public.missed_call_available(target) then');
  if guarded = original then raise exception 'Missing reactivation access guard anchor'; end if;
  execute guarded;
end;
$$;

commit;
