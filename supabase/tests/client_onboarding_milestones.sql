-- CEV-ONBOARD-OPS-152A. Fictional embedded RLS checks; not live hosted JWT proof.
begin;
insert into public.client_onboarding_milestones(tenant_id,updated_by) values ('10000000-0000-4000-8000-000000000001','95000000-0000-4000-8001-000000000001');
set local role authenticated;
select set_config('request.jwt.claim.sub','95000000-0000-4000-8001-000000000001',true);
update public.client_onboarding_milestones set setup_status='complete',updated_by='95000000-0000-4000-8001-000000000001' where tenant_id='10000000-0000-4000-8000-000000000001';
do $$ begin
 if not exists(select 1 from public.client_onboarding_milestones where tenant_id='10000000-0000-4000-8000-000000000001' and setup_status='complete') then raise exception 'Owner cannot update onboarding milestones'; end if;
 begin update public.client_onboarding_milestones set updated_by='95000000-0000-4000-8001-000000000002' where tenant_id='10000000-0000-4000-8000-000000000001'; raise exception 'Forged milestone actor accepted'; exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
