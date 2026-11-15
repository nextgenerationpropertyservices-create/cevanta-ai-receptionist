-- CEV-INVITE-CONT-169A. Fictional embedded checks; not hosted JWT/PostgREST proof.
begin;

insert into auth.users(id,email,email_confirmed_at,deleted_at) values
 ('69000000-0000-4000-8001-000000000001','recipient@example.invalid',clock_timestamp(),null),
 ('69000000-0000-4000-8001-000000000002','wrong-account@example.invalid',clock_timestamp(),null),
 ('69000000-0000-4000-8001-000000000003','atomic-recipient@example.invalid',clock_timestamp(),null),
 ('69000000-0000-4000-8001-000000000004','conflict-recipient@example.invalid',clock_timestamp(),null),
 ('69000000-0000-4000-8001-000000000005','unconfirmed@example.invalid',null,null),
 ('69000000-0000-4000-8001-000000000006','deleted@example.invalid',clock_timestamp(),clock_timestamp()),
 ('69000000-0000-4000-8001-000000000007','non-owner-recipient@example.invalid',clock_timestamp(),null);

insert into public.tenants(id,name,trade,timezone) values
 ('69000000-0000-4000-8000-000000000001','Fictional Continuation Client','HVAC','America/New_York'),
 ('69000000-0000-4000-8000-000000000002','Fictional Other Client','Electrical','America/New_York');
insert into public.memberships(tenant_id,user_id,role) values
 ('69000000-0000-4000-8000-000000000001','69000000-0000-4000-8001-000000000004','viewer');

insert into onboarding_private.invitations(
 id,tenant_id,recipient_user_id,recipient_email,intended_role,token_digest,created_at,expires_at,creation_request_id
) values
 ('69000000-0000-4000-8003-000000000001','69000000-0000-4000-8000-000000000001','69000000-0000-4000-8001-000000000001','recipient@example.invalid','owner',sha256(convert_to('fictional-token-main','UTF8')),clock_timestamp()-interval '2 days',clock_timestamp()+interval '1 day','69000000-0000-4000-8002-000000000001'),
 ('69000000-0000-4000-8003-000000000002','69000000-0000-4000-8000-000000000001','69000000-0000-4000-8001-000000000003','atomic-recipient@example.invalid','owner',sha256(convert_to('fictional-token-atomic','UTF8')),clock_timestamp()-interval '2 days',clock_timestamp()+interval '1 day','69000000-0000-4000-8002-000000000002'),
 ('69000000-0000-4000-8003-000000000003','69000000-0000-4000-8000-000000000001','69000000-0000-4000-8001-000000000004','conflict-recipient@example.invalid','owner',sha256(convert_to('fictional-token-conflict','UTF8')),clock_timestamp()-interval '2 days',clock_timestamp()+interval '1 day','69000000-0000-4000-8002-000000000003'),
 ('69000000-0000-4000-8003-000000000004','69000000-0000-4000-8000-000000000002','69000000-0000-4000-8001-000000000005','unconfirmed@example.invalid','owner',sha256(convert_to('fictional-token-unconfirmed','UTF8')),clock_timestamp()-interval '2 days',clock_timestamp()+interval '1 day','69000000-0000-4000-8002-000000000004'),
 ('69000000-0000-4000-8003-000000000005','69000000-0000-4000-8000-000000000002','69000000-0000-4000-8001-000000000006','deleted@example.invalid','owner',sha256(convert_to('fictional-token-deleted','UTF8')),clock_timestamp()-interval '2 days',clock_timestamp()+interval '1 day','69000000-0000-4000-8002-000000000005'),
 ('69000000-0000-4000-8003-000000000006','69000000-0000-4000-8000-000000000002','69000000-0000-4000-8001-000000000002','wrong-account@example.invalid','owner',sha256(convert_to('fictional-token-expired','UTF8')),clock_timestamp()-interval '2 days',clock_timestamp()-interval '1 day','69000000-0000-4000-8002-000000000006'),
 ('69000000-0000-4000-8003-000000000007','69000000-0000-4000-8000-000000000002','69000000-0000-4000-8001-000000000007','non-owner-recipient@example.invalid','admin',sha256(convert_to('fictional-token-non-owner','UTF8')),clock_timestamp()-interval '2 days',clock_timestamp()+interval '1 day','69000000-0000-4000-8002-000000000007');

update onboarding_private.invitations
set status='revoked',revoked_by='69000000-0000-4000-8001-000000000002',revoked_at=clock_timestamp(),version=version+1
where id='69000000-0000-4000-8003-000000000005';

do $$
declare
 exchange_input jsonb;
 result jsonb;
 handle_one bytea:=sha256(convert_to('fictional-continuation-one','UTF8'));
 handle_two bytea:=sha256(convert_to('fictional-continuation-two','UTF8'));
 handle_atomic bytea:=sha256(convert_to('fictional-continuation-atomic','UTF8'));
 handle_conflict bytea:=sha256(convert_to('fictional-continuation-conflict','UTF8'));
 handle_non_owner bytea:=sha256(convert_to('fictional-continuation-non-owner','UTF8'));
 before_count bigint;
 before_audits bigint;
 before_receipts bigint;
 function_count integer;
 exchange_definition text;
 acceptance_definition text;
begin
 if not (select relrowsecurity from pg_class where oid='onboarding_private.invitation_continuations'::regclass) then raise exception 'Continuation RLS missing'; end if;
 if (select r.rolname from pg_class c join pg_roles r on r.oid=c.relowner where c.oid='onboarding_private.invitation_continuations'::regclass)<>'postgres' then
  raise exception 'Continuation table owner mismatch';
 end if;
 if has_table_privilege('anon','onboarding_private.invitation_continuations','SELECT')
    or has_table_privilege('authenticated','onboarding_private.invitation_continuations','SELECT')
    or has_table_privilege('service_role','onboarding_private.invitation_continuations','SELECT') then
  raise exception 'Continuation table exposed';
 end if;
 select count(*) into function_count
 from pg_proc p join pg_namespace n on n.oid=p.pronamespace join pg_roles r on r.oid=p.proowner
 where n.nspname='public' and p.proname in ('exchange_invitation_continuation','onboarding_accept_invitation_continuation')
   and p.prosecdef and r.rolname='postgres' and 'search_path=""'=any(p.proconfig);
 if function_count<>2 then raise exception 'Continuation RPC owner/definer/search path mismatch'; end if;
 if not has_function_privilege('anon','public.exchange_invitation_continuation(jsonb)'::regprocedure,'EXECUTE')
    or not has_function_privilege('authenticated','public.exchange_invitation_continuation(jsonb)'::regprocedure,'EXECUTE')
    or has_function_privilege('service_role','public.exchange_invitation_continuation(jsonb)'::regprocedure,'EXECUTE')
    or has_function_privilege('anon','public.onboarding_accept_invitation_continuation(jsonb)'::regprocedure,'EXECUTE')
    or not has_function_privilege('authenticated','public.onboarding_accept_invitation_continuation(jsonb)'::regprocedure,'EXECUTE')
    or has_function_privilege('service_role','public.onboarding_accept_invitation_continuation(jsonb)'::regprocedure,'EXECUTE')
    or has_function_privilege('authenticated','public.onboarding_accept_invitation(jsonb)'::regprocedure,'EXECUTE') then
  raise exception 'Continuation RPC grants or raw-token revoke mismatch';
 end if;
 exchange_definition:=pg_get_functiondef('public.exchange_invitation_continuation(jsonb)'::regprocedure);
 acceptance_definition:=pg_get_functiondef('public.onboarding_accept_invitation_continuation(jsonb)'::regprocedure);
 if strpos(exchange_definition,'membership-v1:')=0
    or strpos(exchange_definition,'onboarding-v1:')<=strpos(exchange_definition,'membership-v1:')
    or strpos(exchange_definition,'where i.id=preliminary.id')<=strpos(exchange_definition,'onboarding-v1:')
    or strpos(exchange_definition,'update onboarding_private.invitation_continuations')<=strpos(exchange_definition,'where i.id=preliminary.id') then
  raise exception 'Exchange lock order changed';
 end if;
 if strpos(acceptance_definition,'membership-v1:')=0
    or strpos(acceptance_definition,'onboarding-v1:')<=strpos(acceptance_definition,'membership-v1:')
    or strpos(acceptance_definition,'where i.id=preliminary_continuation.invitation_id')<=strpos(acceptance_definition,'onboarding-v1:')
    or strpos(acceptance_definition,'where c.id=preliminary_continuation.id')<=strpos(acceptance_definition,'where i.id=preliminary_continuation.invitation_id') then
  raise exception 'Acceptance lock order changed';
 end if;

 perform set_config('request.jwt.claim.sub','',true);
 set local role anon;
 begin
  perform count(*) from onboarding_private.invitation_continuations;
  raise exception 'Anonymous continuation table read succeeded';
 exception when insufficient_privilege then null; end;
 exchange_input:=jsonb_build_object(
  'request_id','69000000-0000-4000-8002-000000000001',
  'token_digest_hex',encode(sha256(convert_to('fictional-token-main','UTF8')),'hex'),
  'continuation_digest_hex',encode(handle_one,'hex'),
  'expires_at',clock_timestamp()+interval '10 minutes'
 );
 result:=public.exchange_invitation_continuation(exchange_input);
 if result<>'{"status":"created"}'::jsonb then raise exception 'Anonymous exchange failed: %',result; end if;
 reset role;
 if (select count(*) from onboarding_private.invitation_continuations where invitation_id='69000000-0000-4000-8003-000000000001' and consumed_at is null and revoked_at is null)<>1 then raise exception 'First continuation missing'; end if;
 if exists(select 1 from information_schema.columns where table_schema='onboarding_private' and table_name='invitation_continuations' and column_name in ('token','handle','raw_token','raw_handle','recipient_email')) then raise exception 'Raw invitation material column exists'; end if;

 -- A fresh exchange revokes the older handle and leaves exactly one active row.
 perform set_config('request.jwt.claim.sub','',true);
 set local role anon;
 result:=public.exchange_invitation_continuation(jsonb_set(exchange_input,'{continuation_digest_hex}',to_jsonb(encode(handle_two,'hex'))));
 if result<>'{"status":"created"}'::jsonb then raise exception 'Replacement exchange failed: %',result; end if;
 reset role;
 if (select count(*) from onboarding_private.invitation_continuations where invitation_id='69000000-0000-4000-8003-000000000001' and consumed_at is null and revoked_at is null)<>1
    or not exists(select 1 from onboarding_private.invitation_continuations where handle_digest=handle_one and revoked_at is not null) then
  raise exception 'One-active continuation invariant failed';
 end if;

 before_count:=(select count(*) from onboarding_private.invitation_continuations);
 perform set_config('request.jwt.claim.sub','',true);
 set local role anon;
 result:=public.exchange_invitation_continuation(exchange_input||'{"extra":true}'::jsonb);
 if result->>'status'<>'unavailable' then raise exception 'Extra exchange field accepted'; end if;
 result:=public.exchange_invitation_continuation(jsonb_set(exchange_input,'{request_id}','"69000000-0000-4000-8002-000000000099"'));
 if result->>'status'<>'unavailable' then raise exception 'Substituted request accepted'; end if;
 result:=public.exchange_invitation_continuation(jsonb_set(exchange_input,'{token_digest_hex}',to_jsonb(repeat('0',64))));
 if result->>'status'<>'unavailable' then raise exception 'Substituted token digest accepted'; end if;
 result:=public.exchange_invitation_continuation(jsonb_set(exchange_input,'{expires_at}',to_jsonb((clock_timestamp()+interval '16 minutes')::text)));
 if result->>'status'<>'unavailable' then raise exception 'Overlong continuation accepted'; end if;
 result:=public.exchange_invitation_continuation(jsonb_build_object(
  'request_id','69000000-0000-4000-8002-000000000006','token_digest_hex',encode(sha256(convert_to('fictional-token-expired','UTF8')),'hex'),
  'continuation_digest_hex',encode(sha256(convert_to('fictional-expired-handle','UTF8')),'hex'),'expires_at',clock_timestamp()+interval '5 minutes'));
 if result->>'status'<>'unavailable' then raise exception 'Expired invitation exchanged'; end if;
 result:=public.exchange_invitation_continuation(jsonb_build_object(
  'request_id','69000000-0000-4000-8002-000000000004','token_digest_hex',encode(sha256(convert_to('fictional-token-unconfirmed','UTF8')),'hex'),
  'continuation_digest_hex',encode(sha256(convert_to('fictional-unconfirmed-handle','UTF8')),'hex'),'expires_at',clock_timestamp()+interval '5 minutes'));
 if result->>'status'<>'unavailable' then raise exception 'Unconfirmed recipient exchanged'; end if;
 result:=public.exchange_invitation_continuation(jsonb_build_object(
  'request_id','69000000-0000-4000-8002-000000000005','token_digest_hex',encode(sha256(convert_to('fictional-token-deleted','UTF8')),'hex'),
  'continuation_digest_hex',encode(sha256(convert_to('fictional-deleted-handle','UTF8')),'hex'),'expires_at',clock_timestamp()+interval '5 minutes'));
 if result->>'status'<>'unavailable' then raise exception 'Revoked/deleted invitation exchanged'; end if;
 result:=public.exchange_invitation_continuation(jsonb_build_object(
  'request_id','69000000-0000-4000-8002-000000000007','token_digest_hex',encode(sha256(convert_to('fictional-token-non-owner','UTF8')),'hex'),
  'continuation_digest_hex',encode(handle_non_owner,'hex'),'expires_at',clock_timestamp()+interval '5 minutes'));
 if result->>'status'<>'unavailable' then raise exception 'Non-owner invitation exchanged'; end if;
 reset role;
 if (select count(*) from onboarding_private.invitation_continuations)<>before_count then raise exception 'Rejected exchange changed continuation state'; end if;

 -- A continuation left by a historical owner-only contract mismatch cannot commit non-owner access.
 insert into onboarding_private.invitation_continuations(
  tenant_id,invitation_id,recipient_user_id,acceptance_request_id,handle_digest,created_at,expires_at
 ) values(
  '69000000-0000-4000-8000-000000000002','69000000-0000-4000-8003-000000000007',
  '69000000-0000-4000-8001-000000000007','69000000-0000-4000-8002-000000000007',
  handle_non_owner,clock_timestamp(),clock_timestamp()+interval '5 minutes'
 );
 before_audits:=(select count(*) from public.audit_events);
 before_receipts:=(select count(*) from onboarding_private.receipts);
 perform set_config('request.jwt.claim.sub','69000000-0000-4000-8001-000000000007',true);
 set local role authenticated;
 result:=public.onboarding_accept_invitation_continuation(jsonb_build_object('continuation_digest_hex',encode(handle_non_owner,'hex')));
 if result->>'status'<>'unavailable' then raise exception 'Historical non-owner continuation accepted'; end if;
 reset role;
 if exists(select 1 from public.memberships where tenant_id='69000000-0000-4000-8000-000000000002' and user_id='69000000-0000-4000-8001-000000000007')
    or not exists(select 1 from onboarding_private.invitations where id='69000000-0000-4000-8003-000000000007' and status='pending' and accepted_at is null)
    or not exists(select 1 from onboarding_private.invitation_continuations where handle_digest=handle_non_owner and consumed_at is null and revoked_at is null)
    or (select count(*) from public.audit_events)<>before_audits
    or (select count(*) from onboarding_private.receipts)<>before_receipts then
  raise exception 'Rejected non-owner acceptance changed state';
 end if;

 -- Authenticated exchange from a different account fails without replacing the active row.
 perform set_config('request.jwt.claim.sub','69000000-0000-4000-8001-000000000002',true);
 set local role authenticated;
 result:=public.exchange_invitation_continuation(jsonb_set(exchange_input,'{continuation_digest_hex}',to_jsonb(encode(sha256(convert_to('wrong-handle','UTF8')),'hex'))));
 if result->>'status'<>'unavailable' then raise exception 'Wrong account exchanged invitation'; end if;
 result:=public.onboarding_accept_invitation_continuation(jsonb_build_object('continuation_digest_hex',encode(handle_two,'hex')));
 if result->>'status'<>'unavailable' then raise exception 'Wrong account accepted continuation'; end if;
 reset role;

 -- The superseded handle is unusable. The current handle accepts exactly once.
 perform set_config('request.jwt.claim.sub','69000000-0000-4000-8001-000000000001',true);
 set local role authenticated;
 result:=public.onboarding_accept_invitation_continuation(jsonb_build_object('continuation_digest_hex',encode(handle_two,'hex'),'extra',true));
 if result->>'status'<>'unavailable' then raise exception 'Extra acceptance field accepted'; end if;
 result:=public.onboarding_accept_invitation_continuation('{"continuation_digest_hex":"not-a-digest"}'::jsonb);
 if result->>'status'<>'unavailable' then raise exception 'Malformed acceptance digest accepted'; end if;
 result:=public.onboarding_accept_invitation_continuation(jsonb_build_object('continuation_digest_hex',encode(handle_one,'hex')));
 if result->>'status'<>'unavailable' then raise exception 'Revoked continuation accepted'; end if;
 result:=public.onboarding_accept_invitation_continuation(jsonb_build_object('continuation_digest_hex',encode(handle_two,'hex')));
 if result->>'status'<>'accepted' or result->'workspace'->>'id'<>'69000000-0000-4000-8000-000000000001'
    or result->>'role'<>'owner' or result->>'entry'<>'setup' or result->'acceptance'->>'invitation_id'<>'69000000-0000-4000-8003-000000000001' then
  raise exception 'Accepted envelope mismatch: %',result;
 end if;
 reset role;
 if not exists(select 1 from public.memberships where tenant_id='69000000-0000-4000-8000-000000000001' and user_id='69000000-0000-4000-8001-000000000001' and role='owner') then raise exception 'Accepted membership missing'; end if;
 if not exists(select 1 from onboarding_private.invitations where id='69000000-0000-4000-8003-000000000001' and status='accepted' and accepted_by='69000000-0000-4000-8001-000000000001') then raise exception 'Invitation not accepted'; end if;
 if not exists(select 1 from onboarding_private.invitation_continuations where handle_digest=handle_two and consumed_at is not null and revoked_at is null and version=2) then raise exception 'Continuation not consumed'; end if;
 if (select count(*) from public.audit_events where tenant_id='69000000-0000-4000-8000-000000000001' and actor_user_id='69000000-0000-4000-8001-000000000001' and entity_type in ('memberships','onboarding_invitation'))<>2 then raise exception 'Acceptance audits missing'; end if;
 if not exists(select 1 from onboarding_private.receipts where tenant_id='69000000-0000-4000-8000-000000000001' and actor_user_id='69000000-0000-4000-8001-000000000001' and command='invite_accept' and request_id='69000000-0000-4000-8002-000000000001' and invitation_id='69000000-0000-4000-8003-000000000001' and input_digest<>handle_two and input_digest<>sha256(convert_to('fictional-token-main','UTF8'))) then raise exception 'Safe acceptance receipt missing'; end if;

 before_audits:=(select count(*) from public.audit_events);
 before_receipts:=(select count(*) from onboarding_private.receipts);
 perform set_config('request.jwt.claim.sub','69000000-0000-4000-8001-000000000001',true);
 set local role authenticated;
 result:=public.onboarding_accept_invitation_continuation(jsonb_build_object('continuation_digest_hex',encode(handle_two,'hex')));
 if result->>'status'<>'unavailable' then raise exception 'Consumed continuation replayed'; end if;
 reset role;
 if (select count(*) from public.audit_events)<>before_audits or (select count(*) from onboarding_private.receipts)<>before_receipts then raise exception 'Replay wrote audit or receipt'; end if;
 delete from public.memberships where tenant_id='69000000-0000-4000-8000-000000000001' and user_id='69000000-0000-4000-8001-000000000001';
 perform set_config('request.jwt.claim.sub','69000000-0000-4000-8001-000000000001',true);
 set local role authenticated;
 result:=public.onboarding_accept_invitation_continuation(jsonb_build_object('continuation_digest_hex',encode(handle_two,'hex')));
 if result->>'status'<>'unavailable' then raise exception 'Removed membership recreated'; end if;
 reset role;
 if exists(select 1 from public.memberships where tenant_id='69000000-0000-4000-8000-000000000001' and user_id='69000000-0000-4000-8001-000000000001') then raise exception 'Consumed continuation recreated membership'; end if;

 -- Existing incompatible membership stays authoritative.
 perform set_config('request.jwt.claim.sub','',true);
 set local role anon;
 result:=public.exchange_invitation_continuation(jsonb_build_object(
  'request_id','69000000-0000-4000-8002-000000000003','token_digest_hex',encode(sha256(convert_to('fictional-token-conflict','UTF8')),'hex'),
  'continuation_digest_hex',encode(handle_conflict,'hex'),'expires_at',clock_timestamp()+interval '5 minutes'));
 if result->>'status'<>'created' then raise exception 'Conflict fixture exchange failed'; end if;
 reset role;
 perform set_config('request.jwt.claim.sub','69000000-0000-4000-8001-000000000004',true);
 set local role authenticated;
 result:=public.onboarding_accept_invitation_continuation(jsonb_build_object('continuation_digest_hex',encode(handle_conflict,'hex')));
 if result->>'status'<>'unavailable' then raise exception 'Incompatible membership accepted'; end if;
 reset role;
 if not exists(select 1 from public.memberships where tenant_id='69000000-0000-4000-8000-000000000001' and user_id='69000000-0000-4000-8001-000000000004' and role='viewer') then raise exception 'Conflict membership changed'; end if;

 -- Receipt/audit failures must roll back membership, invitation and continuation writes.
 perform set_config('request.jwt.claim.sub','',true);
 set local role anon;
 result:=public.exchange_invitation_continuation(jsonb_build_object(
  'request_id','69000000-0000-4000-8002-000000000002','token_digest_hex',encode(sha256(convert_to('fictional-token-atomic','UTF8')),'hex'),
  'continuation_digest_hex',encode(handle_atomic,'hex'),'expires_at',clock_timestamp()+interval '5 minutes'));
 if result->>'status'<>'created' then raise exception 'Atomic fixture exchange failed'; end if;
 reset role;
 create function pg_temp.reject_atomic_audit() returns trigger language plpgsql as $f$
 begin if new.tenant_id='69000000-0000-4000-8000-000000000001' and new.actor_user_id='69000000-0000-4000-8001-000000000003' then raise exception 'fictional audit failure'; end if; return new; end $f$;
 create trigger invitation_continuation_atomic_failure before insert on public.audit_events for each row execute function pg_temp.reject_atomic_audit();
 before_audits:=(select count(*) from public.audit_events);
 before_receipts:=(select count(*) from onboarding_private.receipts);
 perform set_config('request.jwt.claim.sub','69000000-0000-4000-8001-000000000003',true);
 set local role authenticated;
 result:=public.onboarding_accept_invitation_continuation(jsonb_build_object('continuation_digest_hex',encode(handle_atomic,'hex')));
 if result->>'status'<>'retryable_failure' then raise exception 'Audit failure did not fail closed: %',result; end if;
 reset role;
 drop trigger invitation_continuation_atomic_failure on public.audit_events;
 if exists(select 1 from public.memberships where tenant_id='69000000-0000-4000-8000-000000000001' and user_id='69000000-0000-4000-8001-000000000003')
    or not exists(select 1 from onboarding_private.invitations where id='69000000-0000-4000-8003-000000000002' and status='pending')
    or not exists(select 1 from onboarding_private.invitation_continuations where handle_digest=handle_atomic and consumed_at is null and revoked_at is null)
    or (select count(*) from public.audit_events)<>before_audits
    or (select count(*) from onboarding_private.receipts)<>before_receipts then
  raise exception 'Atomic acceptance rollback failed';
 end if;

 -- Direct writes cannot substitute recipient/request or bypass expiry/transition rules.
 begin
  insert into onboarding_private.invitation_continuations(tenant_id,invitation_id,recipient_user_id,acceptance_request_id,handle_digest,expires_at)
  values('69000000-0000-4000-8000-000000000001','69000000-0000-4000-8003-000000000002','69000000-0000-4000-8001-000000000002','69000000-0000-4000-8002-000000000002',sha256(convert_to('bad-binding','UTF8')),clock_timestamp()+interval '5 minutes');
  raise exception 'Substituted recipient inserted';
 exception when check_violation then null; end;
 begin
  update onboarding_private.invitation_continuations set handle_digest=sha256(convert_to('mutated-handle','UTF8')),version=version+1 where handle_digest=handle_atomic;
  raise exception 'Continuation identity mutated';
 exception when check_violation then null; end;
end $$;

rollback;
