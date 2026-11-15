-- CEV-PROJECT-AUDIT-167J. Fictional embedded RLS and coarse-audit checks; not live hosted JWT proof.
begin;

insert into auth.users(id,email) values
 ('96000000-0000-4000-8001-000000000001','milestone-owner@example.invalid'),
 ('96000000-0000-4000-8001-000000000002','milestone-admin@example.invalid'),
 ('96000000-0000-4000-8001-000000000003','milestone-dispatcher@example.invalid'),
 ('96000000-0000-4000-8001-000000000004','milestone-other-owner@example.invalid');
insert into public.memberships(tenant_id,user_id,role) values
 ('10000000-0000-4000-8000-000000000001','96000000-0000-4000-8001-000000000001','owner'),
 ('10000000-0000-4000-8000-000000000001','96000000-0000-4000-8001-000000000002','admin'),
 ('10000000-0000-4000-8000-000000000001','96000000-0000-4000-8001-000000000003','dispatcher'),
 ('10000000-0000-4000-8000-000000000002','96000000-0000-4000-8001-000000000004','owner');

do $$
begin
 if (select count(*) from pg_trigger t join pg_proc p on p.oid=t.tgfoid join pg_namespace n on n.oid=p.pronamespace where t.tgrelid='public.client_onboarding_milestones'::regclass and t.tgname='audit_client_onboarding_milestones' and not t.tgisinternal and n.nspname='onboarding_private' and p.proname='record_client_onboarding_milestone_audit')<>1 then raise exception 'Milestone-specific audit trigger missing'; end if;
 if exists(select 1 from pg_trigger t join pg_proc p on p.oid=t.tgfoid join pg_namespace n on n.oid=p.pronamespace where t.tgrelid='public.client_onboarding_milestones'::regclass and not t.tgisinternal and n.nspname='public' and p.proname='record_audit_event') then raise exception 'Incompatible generic milestone audit trigger remains'; end if;
 if (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace join pg_roles r on r.oid=p.proowner where n.nspname='onboarding_private' and p.proname='record_client_onboarding_milestone_audit' and p.prosecdef and r.rolname='postgres' and 'search_path=""'=any(p.proconfig) and not has_function_privilege('authenticated',p.oid,'EXECUTE') and not has_function_privilege('anon',p.oid,'EXECUTE'))<>1 then raise exception 'Milestone audit function ownership/search path/grants'; end if;
 if (select count(*) from information_schema.columns where table_schema='public' and table_name='audit_events' and column_name='entity_id' and is_nullable='NO')<>1 then raise exception 'Audit entity identifier is missing or nullable'; end if;
end $$;

set local role anon;
do $$
begin
 begin perform count(*) from public.client_onboarding_milestones; raise exception 'Anonymous milestone read accepted'; exception when insufficient_privilege then null; end;
 begin insert into public.client_onboarding_milestones(tenant_id,updated_by) values('10000000-0000-4000-8000-000000000001','96000000-0000-4000-8001-000000000001'); raise exception 'Anonymous milestone insert accepted'; exception when insufficient_privilege then null; end;
end $$;
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub','96000000-0000-4000-8001-000000000001',true);
insert into public.client_onboarding_milestones(tenant_id,updated_by)
values('10000000-0000-4000-8000-000000000001','96000000-0000-4000-8001-000000000001');

do $$
begin
 if not exists(select 1 from public.client_onboarding_milestones where tenant_id='10000000-0000-4000-8000-000000000001') then raise exception 'Owner cannot insert onboarding milestone'; end if;
 if (select count(*) from public.audit_events where tenant_id='10000000-0000-4000-8000-000000000001' and entity_type='client_onboarding_milestones' and entity_id='10000000-0000-4000-8000-000000000001' and action='INSERT' and actor_user_id='96000000-0000-4000-8001-000000000001')<>1 then raise exception 'Milestone insert audit missing or malformed'; end if;
 if exists(select 1 from public.audit_events where entity_type='client_onboarding_milestones' and entity_id is null) then raise exception 'Milestone audit has null entity identifier'; end if;
 begin insert into public.client_onboarding_milestones(tenant_id,updated_by) values('10000000-0000-4000-8000-000000000002','96000000-0000-4000-8001-000000000001'); raise exception 'Cross-tenant milestone insert accepted'; exception when insufficient_privilege then null; end;
 begin update public.client_onboarding_milestones set payment_status='paid',updated_by='96000000-0000-4000-8001-000000000004' where tenant_id='10000000-0000-4000-8000-000000000001'; raise exception 'Forged milestone actor accepted'; exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub','96000000-0000-4000-8001-000000000002',true);
update public.client_onboarding_milestones
set setup_status='complete',updated_by='96000000-0000-4000-8001-000000000002'
where tenant_id='10000000-0000-4000-8000-000000000001';

do $$
begin
 if not exists(select 1 from public.client_onboarding_milestones where tenant_id='10000000-0000-4000-8000-000000000001' and setup_status='complete' and payment_status='not_started') then raise exception 'Admin milestone update failed or rejected write changed state'; end if;
 if (select count(*) from public.audit_events where tenant_id='10000000-0000-4000-8000-000000000001' and entity_type='client_onboarding_milestones' and entity_id='10000000-0000-4000-8000-000000000001' and action='UPDATE' and actor_user_id='96000000-0000-4000-8001-000000000002')<>1 then raise exception 'Milestone update audit missing or malformed'; end if;
 if (select count(*) from public.audit_events where tenant_id='10000000-0000-4000-8000-000000000001' and entity_type='client_onboarding_milestones')<>2 then raise exception 'Rejected milestone write created an audit event'; end if;
end $$;

select set_config('request.jwt.claim.sub','96000000-0000-4000-8001-000000000003',true);
do $$
begin
 if (select count(*) from public.client_onboarding_milestones where tenant_id='10000000-0000-4000-8000-000000000001')<>0 then raise exception 'Dispatcher can read onboarding milestones'; end if;
 update public.client_onboarding_milestones set setup_status='in_progress',updated_by='96000000-0000-4000-8001-000000000003' where tenant_id='10000000-0000-4000-8000-000000000001';
 if found then raise exception 'Dispatcher milestone update accepted'; end if;
end $$;

select set_config('request.jwt.claim.sub','96000000-0000-4000-8001-000000000004',true);
do $$
begin
 if (select count(*) from public.client_onboarding_milestones where tenant_id='10000000-0000-4000-8000-000000000001')<>0 then raise exception 'Cross-tenant owner can read onboarding milestones'; end if;
 update public.client_onboarding_milestones set setup_status='in_progress',updated_by='96000000-0000-4000-8001-000000000004' where tenant_id='10000000-0000-4000-8000-000000000001';
 if found then raise exception 'Cross-tenant milestone update accepted'; end if;
end $$;

select set_config('request.jwt.claim.sub','96000000-0000-4000-8001-000000000001',true);
do $$
begin
 if (select count(*) from public.audit_events where tenant_id='10000000-0000-4000-8000-000000000001' and entity_type='client_onboarding_milestones')<>2 then raise exception 'Unauthorized milestone write changed audit history'; end if;
end $$;

reset role;
rollback;
