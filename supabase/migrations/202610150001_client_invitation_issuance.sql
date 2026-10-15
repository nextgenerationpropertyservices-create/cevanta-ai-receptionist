begin;

-- CEV-CLIENT-INVITE-124A: owner/admin-issued, one-time client owner invitations.
create or replace function public.issue_client_invitation(input jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 actor_id uuid; operator_id uuid; client_id uuid; target_user uuid; email_value text; role_value public.app_role; request uuid; digest bytea; expiry timestamptz; existing_role public.app_role; invitation_id uuid;
begin
 select actor,canonical_email into actor_id,email_value from onboarding_private.current_identity();
 if actor_id is null then return '{"status":"unavailable"}'; end if;
 begin
  if input is null or onboarding_private.input_size(input)>131072 then return '{"status":"validation_error"}'; end if;
  perform onboarding_private.require_keys(input,array['request_id','operator_tenant_id','client_tenant_id','recipient_email','intended_role','token_digest_hex','expires_at'],'input');
  request:=onboarding_private.input_uuid(input->'request_id','request_id');
  operator_id:=(input->>'operator_tenant_id')::uuid;
  client_id:=(input->>'client_tenant_id')::uuid;
  email_value:=lower(btrim(input->>'recipient_email'));
  role_value:=(input->>'intended_role')::public.app_role;
  digest:=decode(input->>'token_digest_hex','hex');
  expiry:=(input->>'expires_at')::timestamptz;
  if octet_length(digest)<>32 or email_value is null or not onboarding_private.valid_email(email_value) or role_value<>'owner'::public.app_role or expiry<=clock_timestamp() or expiry>clock_timestamp()+interval '7 days' then return '{"status":"validation_error"}'; end if;
 exception when others then return '{"status":"validation_error"}'; end;
 if not exists(
   select 1 from public.managed_client_workspaces m
   join public.memberships om on om.tenant_id=m.operator_tenant_id and om.user_id=actor_id and om.role in ('owner','admin')
   where m.operator_tenant_id=operator_id and m.client_tenant_id=client_id and m.status in ('onboarding','pilot','active')
 ) then return '{"status":"unavailable"}'; end if;
 select id into target_user from auth.users where lower(email)=email_value and email_confirmed_at is not null and deleted_at is null for share;
 if target_user is null then return '{"status":"not_found"}'; end if;
 perform pg_advisory_xact_lock(hashtextextended('client-invite-v1:'||client_id||':'||target_user,0));
 select role into existing_role from public.memberships where tenant_id=client_id and user_id=target_user for share;
 if existing_role is not null then return '{"status":"membership_conflict"}'; end if;
 if exists(select 1 from onboarding_private.invitations where tenant_id=client_id and recipient_user_id=target_user and status='pending') then return '{"status":"already_pending"}'; end if;
 insert into onboarding_private.invitations(tenant_id,recipient_user_id,recipient_email,intended_role,token_digest,expires_at,creation_request_id,created_by,updated_by)
 values(client_id,target_user,email_value,role_value,digest,expiry,request,actor_id,actor_id)
 returning id into invitation_id;
 insert into public.audit_events(tenant_id,actor_user_id,entity_type,entity_id,action) values(client_id,actor_id,'onboarding_invitation',invitation_id,'INSERT');
 return jsonb_build_object('status','created','invitation_id',invitation_id,'recipient_email',email_value,'intended_role',role_value,'expires_at',to_char(expiry at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'));
exception when unique_violation then return '{"status":"conflict"}'; when others then return '{"status":"retryable_failure"}';
end; $$;

alter function public.issue_client_invitation(jsonb) owner to postgres;
revoke all on function public.issue_client_invitation(jsonb) from public,anon,authenticated;
grant execute on function public.issue_client_invitation(jsonb) to authenticated;

commit;
