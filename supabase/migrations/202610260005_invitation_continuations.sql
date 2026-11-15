-- CEV-INVITE-CONT-169A: digest-only, short-lived invitation continuations.
-- Local migration only. Apply to hosted Supabase only after independent review.
begin;

create table onboarding_private.invitation_continuations (
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid not null,
 invitation_id uuid not null,
 recipient_user_id uuid not null,
 acceptance_request_id uuid not null,
 handle_digest bytea not null unique check(octet_length(handle_digest)=32),
 created_at timestamptz not null default clock_timestamp() check(isfinite(created_at)),
 expires_at timestamptz not null check(isfinite(expires_at) and expires_at>created_at and expires_at<=created_at+interval '15 minutes'),
 consumed_at timestamptz check(consumed_at is null or (isfinite(consumed_at) and consumed_at>=created_at)),
 revoked_at timestamptz check(revoked_at is null or (isfinite(revoked_at) and revoked_at>=created_at)),
 version integer not null default 1 check(version between 1 and 2147483647),
 foreign key(tenant_id,invitation_id) references onboarding_private.invitations(tenant_id,id),
 check(consumed_at is null or revoked_at is null)
);

create unique index invitation_continuations_one_active_idx
 on onboarding_private.invitation_continuations(tenant_id,invitation_id)
 where consumed_at is null and revoked_at is null;
create index invitation_continuations_invitation_idx
 on onboarding_private.invitation_continuations(tenant_id,invitation_id,created_at desc);

create function onboarding_private.guard_invitation_continuation()
returns trigger language plpgsql set search_path='' as $$
declare bound_recipient uuid; bound_request uuid; invitation_expiry timestamptz;
begin
 if TG_OP='DELETE' then raise exception 'Invitation continuation history retained' using errcode='23514'; end if;
 select i.recipient_user_id,i.creation_request_id,i.expires_at
 into bound_recipient,bound_request,invitation_expiry
 from onboarding_private.invitations i
 where i.tenant_id=new.tenant_id and i.id=new.invitation_id
 for key share;
 if bound_recipient is null or bound_recipient<>new.recipient_user_id or bound_request<>new.acceptance_request_id
    or new.expires_at>invitation_expiry then
  raise exception 'Invalid invitation continuation binding' using errcode='23514';
 end if;
 if TG_OP='INSERT' then
  if new.version<>1 or new.consumed_at is not null or new.revoked_at is not null then
   raise exception 'Invalid invitation continuation provision' using errcode='23514';
  end if;
 elsif (new.id,new.tenant_id,new.invitation_id,new.recipient_user_id,new.acceptance_request_id,new.handle_digest,new.created_at,new.expires_at)
       is distinct from
       (old.id,old.tenant_id,old.invitation_id,old.recipient_user_id,old.acceptance_request_id,old.handle_digest,old.created_at,old.expires_at)
    or old.consumed_at is not null or old.revoked_at is not null
    or new.version<>old.version+1
    or not (
      (new.consumed_at is not null and new.revoked_at is null and old.consumed_at is null and old.revoked_at is null)
      or
      (new.revoked_at is not null and new.consumed_at is null and old.consumed_at is null and old.revoked_at is null)
    ) then
  raise exception 'Invalid invitation continuation transition' using errcode='23514';
 end if;
 return new;
end; $$;

create trigger onboarding_invitation_continuation_transition
 before insert or update or delete on onboarding_private.invitation_continuations
 for each row execute function onboarding_private.guard_invitation_continuation();

alter table onboarding_private.invitation_continuations enable row level security;
alter table onboarding_private.invitation_continuations owner to postgres;
revoke all on onboarding_private.invitation_continuations from public,anon,authenticated,service_role;

create function public.exchange_invitation_continuation(input jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 request uuid;
 token_hash bytea;
 continuation_hash bytea;
 requested_expiry timestamptz;
 actor_id uuid;
 actor_email text;
 recipient_live boolean;
 preliminary onboarding_private.invitations%rowtype;
 invitation onboarding_private.invitations%rowtype;
 created_time timestamptz;
begin
 begin
  if input is null or onboarding_private.input_size(input)>1024 then return '{"status":"unavailable"}'; end if;
  perform onboarding_private.require_keys(input,array['request_id','token_digest_hex','continuation_digest_hex','expires_at'],'input');
  request:=onboarding_private.input_uuid(input->'request_id','request_id');
  if jsonb_typeof(input->'token_digest_hex')<>'string'
     or (input->>'token_digest_hex')!~'^[0-9a-f]{64}$'
     or jsonb_typeof(input->'continuation_digest_hex')<>'string'
     or (input->>'continuation_digest_hex')!~'^[0-9a-f]{64}$'
     or jsonb_typeof(input->'expires_at')<>'string'
     or length(input->>'expires_at')>64 then return '{"status":"unavailable"}'; end if;
  token_hash:=decode(input->>'token_digest_hex','hex');
  continuation_hash:=decode(input->>'continuation_digest_hex','hex');
  requested_expiry:=(input->>'expires_at')::timestamptz;
  if octet_length(token_hash)<>32 or octet_length(continuation_hash)<>32 or not isfinite(requested_expiry) then
   return '{"status":"unavailable"}';
  end if;
 exception when others then return '{"status":"unavailable"}'; end;

 if auth.uid() is not null then
  select actor,canonical_email into actor_id,actor_email from onboarding_private.current_identity();
  if actor_id is null then return '{"status":"unavailable"}'; end if;
 end if;

 -- The lookup supplies lock identities only. Every condition is rechecked below.
 select * into preliminary
 from onboarding_private.invitations i
 where i.creation_request_id=request and i.token_digest=token_hash;
 if not found then return '{"status":"unavailable"}'; end if;

 perform pg_advisory_xact_lock(hashtextextended('membership-v1:'||preliminary.tenant_id::text||':'||preliminary.recipient_user_id::text,0));
 perform pg_advisory_xact_lock(hashtextextended('onboarding-v1:'||preliminary.tenant_id::text||':'||preliminary.recipient_user_id::text||':invite_accept:'||request::text,0));
 select * into invitation
 from onboarding_private.invitations i
 where i.id=preliminary.id and i.tenant_id=preliminary.tenant_id
 for update;

 if not found or invitation.creation_request_id<>request or invitation.token_digest<>token_hash
    or invitation.status<>'pending' or invitation.expires_at<=clock_timestamp()
    or invitation.accepted_at is not null or invitation.revoked_at is not null
    or invitation.intended_role<>'owner'
    or (actor_id is not null and (actor_id<>invitation.recipient_user_id or actor_email<>invitation.recipient_email)) then
  return '{"status":"unavailable"}';
 end if;
 select exists(
  select 1 from auth.users u
  where u.id=invitation.recipient_user_id
    and u.email_confirmed_at is not null and u.deleted_at is null
    and u.email is not null
    and lower(btrim(u.email,E'\t\n\v\f\r '))=invitation.recipient_email
 ) into recipient_live;
 if not recipient_live then return '{"status":"unavailable"}'; end if;

 created_time:=clock_timestamp();
 if requested_expiry<=created_time or requested_expiry>created_time+interval '15 minutes'
    or requested_expiry>invitation.expires_at then return '{"status":"unavailable"}'; end if;

 update onboarding_private.invitation_continuations
 set revoked_at=clock_timestamp(),version=version+1
 where tenant_id=invitation.tenant_id and invitation_id=invitation.id
   and consumed_at is null and revoked_at is null;
 insert into onboarding_private.invitation_continuations(
  tenant_id,invitation_id,recipient_user_id,acceptance_request_id,handle_digest,created_at,expires_at
 ) values(
  invitation.tenant_id,invitation.id,invitation.recipient_user_id,invitation.creation_request_id,
  continuation_hash,created_time,requested_expiry
 );
 return '{"status":"created"}';
exception when others then return '{"status":"retryable_failure"}';
end; $$;

create function public.onboarding_accept_invitation_continuation(input jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 continuation_hash bytea;
 actor_id uuid;
 email_value text;
 preliminary_continuation onboarding_private.invitation_continuations%rowtype;
 continuation onboarding_private.invitation_continuations%rowtype;
 invitation onboarding_private.invitations%rowtype;
 role_value public.app_role;
 workspace jsonb;
 accepted_time timestamptz;
 receipt_digest bytea;
 affected integer;
begin
 begin
  if input is null or onboarding_private.input_size(input)>256 then return '{"status":"unavailable"}'; end if;
  perform onboarding_private.require_keys(input,array['continuation_digest_hex'],'input');
  if jsonb_typeof(input->'continuation_digest_hex')<>'string'
     or (input->>'continuation_digest_hex')!~'^[0-9a-f]{64}$' then return '{"status":"unavailable"}'; end if;
  continuation_hash:=decode(input->>'continuation_digest_hex','hex');
  if octet_length(continuation_hash)<>32 then return '{"status":"unavailable"}'; end if;
 exception when others then return '{"status":"unavailable"}'; end;

 select actor,canonical_email into actor_id,email_value from onboarding_private.current_identity();
 if actor_id is null then return '{"status":"unavailable"}'; end if;

 -- Read immutable binding data without a row lock, then use the same lock order as exchange:
 -- membership advisory, onboarding advisory, invitation row, continuation row.
 select * into preliminary_continuation
 from onboarding_private.invitation_continuations c
 where c.handle_digest=continuation_hash;
 if not found or preliminary_continuation.consumed_at is not null or preliminary_continuation.revoked_at is not null
    or preliminary_continuation.expires_at<=clock_timestamp() or preliminary_continuation.recipient_user_id<>actor_id then
  return '{"status":"unavailable"}';
 end if;

 perform pg_advisory_xact_lock(hashtextextended('membership-v1:'||preliminary_continuation.tenant_id::text||':'||preliminary_continuation.recipient_user_id::text,0));
 perform pg_advisory_xact_lock(hashtextextended('onboarding-v1:'||preliminary_continuation.tenant_id::text||':'||actor_id::text||':invite_accept:'||preliminary_continuation.acceptance_request_id::text,0));
 select * into invitation
 from onboarding_private.invitations i
 where i.id=preliminary_continuation.invitation_id and i.tenant_id=preliminary_continuation.tenant_id
 for update;

 if not found or invitation.id<>preliminary_continuation.invitation_id or invitation.tenant_id<>preliminary_continuation.tenant_id
    or invitation.recipient_user_id<>preliminary_continuation.recipient_user_id
    or invitation.creation_request_id<>preliminary_continuation.acceptance_request_id
    or invitation.recipient_user_id<>actor_id or invitation.recipient_email<>email_value
    or invitation.status<>'pending' or invitation.expires_at<=clock_timestamp()
    or invitation.accepted_at is not null or invitation.revoked_at is not null
    or invitation.intended_role<>'owner' then
  return '{"status":"unavailable"}';
 end if;

 -- Re-lock and revalidate the exact continuation only after the shared advisory/invitation order.
 select * into continuation
 from onboarding_private.invitation_continuations c
 where c.id=preliminary_continuation.id and c.handle_digest=continuation_hash
   and c.tenant_id=preliminary_continuation.tenant_id and c.invitation_id=preliminary_continuation.invitation_id
 for update;
 if not found or continuation.recipient_user_id<>preliminary_continuation.recipient_user_id
    or continuation.acceptance_request_id<>preliminary_continuation.acceptance_request_id
    or continuation.consumed_at is not null or continuation.revoked_at is not null
    or continuation.expires_at<=clock_timestamp() or continuation.recipient_user_id<>actor_id then
  return '{"status":"unavailable"}';
 end if;

 select m.role into role_value
 from public.memberships m
 where m.tenant_id=continuation.tenant_id and m.user_id=actor_id
 for share;
 select jsonb_build_object('id',t.id,'name',t.name) into workspace
 from public.tenants t where t.id=continuation.tenant_id for share;
 if workspace is null then return '{"status":"unavailable"}'; end if;
 if invitation.id<>continuation.invitation_id or invitation.tenant_id<>continuation.tenant_id
    or invitation.recipient_user_id<>continuation.recipient_user_id
    or invitation.creation_request_id<>continuation.acceptance_request_id
    or (role_value is not null and role_value<>invitation.intended_role) then
  return '{"status":"unavailable"}';
 end if;

 if invitation.version=2147483647 then return '{"status":"retryable_failure"}'; end if;
 if role_value is null then
  insert into public.memberships(tenant_id,user_id,role)
  values(invitation.tenant_id,actor_id,invitation.intended_role)
  on conflict(tenant_id,user_id) do nothing;
  get diagnostics affected=row_count;
  if affected=0 then return '{"status":"retryable_failure"}'; end if;
  insert into public.audit_events(tenant_id,actor_user_id,entity_type,entity_id,action)
  values(invitation.tenant_id,actor_id,'memberships',actor_id,'INSERT');
 end if;

 accepted_time:=clock_timestamp();
 update onboarding_private.invitations
 set status='accepted',accepted_by=actor_id,accepted_at=accepted_time,
     version=version+1,updated_by=actor_id,updated_at=accepted_time
 where id=invitation.id and tenant_id=invitation.tenant_id;
 insert into public.audit_events(tenant_id,actor_user_id,entity_type,entity_id,action)
 values(invitation.tenant_id,actor_id,'onboarding_invitation',invitation.id,'UPDATE');

 -- The retained receipt identifies the accepted command without storing either digest.
 receipt_digest:=sha256(convert_to(onboarding_private.canonical_json(jsonb_build_object(
  'contract_version','onboarding-v1','command','invite_accept','tenant_id',invitation.tenant_id,
  'actor_user_id',actor_id,'request_id',continuation.acceptance_request_id,
  'invitation_id',invitation.id
 )),'UTF8'));
 insert into onboarding_private.receipts(
  tenant_id,actor_user_id,command,request_id,input_digest,invitation_id,intended_role,accepted_at
 ) values(
  invitation.tenant_id,actor_id,'invite_accept',continuation.acceptance_request_id,receipt_digest,
  invitation.id,invitation.intended_role,accepted_time
 );
 update onboarding_private.invitation_continuations
 set consumed_at=accepted_time,version=version+1
 where id=continuation.id and tenant_id=continuation.tenant_id
   and consumed_at is null and revoked_at is null;
 get diagnostics affected=row_count;
 if affected<>1 then raise exception 'Invitation continuation was not consumed' using errcode='40001'; end if;

 return jsonb_build_object(
  'status','accepted',
  'acceptance',jsonb_build_object('invitation_id',invitation.id,'accepted_at',to_char(accepted_time at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"')),
  'workspace',workspace,'role',invitation.intended_role,'entry','setup'
 );
exception when others then return '{"status":"retryable_failure"}';
end; $$;

alter function onboarding_private.guard_invitation_continuation() owner to postgres;
revoke all on function onboarding_private.guard_invitation_continuation() from public,anon,authenticated,service_role;

alter function public.exchange_invitation_continuation(jsonb) owner to postgres;
alter function public.onboarding_accept_invitation_continuation(jsonb) owner to postgres;
revoke all on function public.exchange_invitation_continuation(jsonb),public.onboarding_accept_invitation_continuation(jsonb) from public,anon,authenticated,service_role;
grant execute on function public.exchange_invitation_continuation(jsonb) to anon,authenticated;
grant execute on function public.onboarding_accept_invitation_continuation(jsonb) to authenticated;

-- Raw-token acceptance is intentionally not restored by rollback or later app fallback.
revoke all on function public.onboarding_accept_invitation(jsonb) from public,anon,authenticated,service_role;

commit;
