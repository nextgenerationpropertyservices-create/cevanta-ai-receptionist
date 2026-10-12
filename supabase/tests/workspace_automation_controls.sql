-- CEV-AUTOMATION-105A. Fictional embedded automation-control checks, not live JWT/PostgREST proof.
begin;
insert into auth.users(id,email) values
 ('95000000-0000-4000-8001-000000000001','automation-owner@example.invalid'),
 ('95000000-0000-4000-8001-000000000002','automation-admin@example.invalid'),
 ('95000000-0000-4000-8001-000000000003','automation-dispatcher@example.invalid'),
 ('95000000-0000-4000-8001-000000000004','automation-viewer@example.invalid'),
 ('95000000-0000-4000-8001-000000000005','automation-other-owner@example.invalid');
insert into public.memberships(tenant_id,user_id,role) values
 ('10000000-0000-4000-8000-000000000001','95000000-0000-4000-8001-000000000001','owner'),
 ('10000000-0000-4000-8000-000000000001','95000000-0000-4000-8001-000000000002','admin'),
 ('10000000-0000-4000-8000-000000000001','95000000-0000-4000-8001-000000000003','dispatcher'),
 ('10000000-0000-4000-8000-000000000001','95000000-0000-4000-8001-000000000004','viewer'),
 ('10000000-0000-4000-8000-000000000002','95000000-0000-4000-8001-000000000005','owner');

set local role anon;
do $$ begin
 begin perform count(*) from public.workspace_automation_controls; raise exception 'Anon automation control read accepted'; exception when insufficient_privilege then null; end;
 begin insert into public.workspace_automation_controls(tenant_id,capability,updated_by) values('10000000-0000-4000-8000-000000000001','sms','95000000-0000-4000-8001-000000000001'); raise exception 'Anon automation control insert accepted'; exception when insufficient_privilege then null; end;
end $$;
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub','95000000-0000-4000-8001-000000000001',true);
insert into public.workspace_automation_controls(tenant_id,capability,requested,client_visible,owner_approved,activation_state,test_evidence,rollback_plan,provider_notes,updated_by)
values('10000000-0000-4000-8000-000000000001','sms',true,false,false,'testing','Fictional SMS dry run queued in test mode.','Pause SMS and return to office review.','Twilio registration pending.','95000000-0000-4000-8001-000000000001');

do $$ begin
 if (select count(*) from public.workspace_automation_controls where tenant_id='10000000-0000-4000-8000-000000000001') <> 1 then raise exception 'Owner cannot read automation controls'; end if;
 begin insert into public.workspace_automation_controls(id,tenant_id,capability,updated_by) values(gen_random_uuid(),'10000000-0000-4000-8000-000000000001','email','95000000-0000-4000-8001-000000000001'); raise exception 'Caller supplied immutable id accepted'; exception when insufficient_privilege then null; end;
 begin insert into public.workspace_automation_controls(tenant_id,capability,created_at,updated_by) values('10000000-0000-4000-8000-000000000001','email',now(),'95000000-0000-4000-8001-000000000001'); raise exception 'Caller supplied created_at accepted'; exception when insufficient_privilege then null; end;
 begin insert into public.workspace_automation_controls(tenant_id,capability,updated_at,updated_by) values('10000000-0000-4000-8000-000000000001','email',now(),'95000000-0000-4000-8001-000000000001'); raise exception 'Caller supplied updated_at accepted'; exception when insufficient_privilege then null; end;
 begin insert into public.workspace_automation_controls(tenant_id,capability,activation_state,owner_approved,test_evidence,rollback_plan,updated_by) values('10000000-0000-4000-8000-000000000001','email','active',true,'tested','rollback','95000000-0000-4000-8001-000000000001'); raise exception 'Active without requested accepted'; exception when check_violation then null; end;
 begin insert into public.workspace_automation_controls(tenant_id,capability,requested,activation_state,test_evidence,rollback_plan,updated_by) values('10000000-0000-4000-8000-000000000001','external_calendar',true,'active','tested','rollback','95000000-0000-4000-8001-000000000001'); raise exception 'Active without owner approval accepted'; exception when check_violation then null; end;
 begin insert into public.workspace_automation_controls(tenant_id,capability,requested,owner_approved,activation_state,test_evidence,rollback_plan,updated_by) values('10000000-0000-4000-8000-000000000001','automatic_booking',true,true,'active','','rollback','95000000-0000-4000-8001-000000000001'); raise exception 'Active without test evidence accepted'; exception when check_violation then null; end;
 begin insert into public.workspace_automation_controls(tenant_id,capability,requested,owner_approved,activation_state,test_evidence,rollback_plan,updated_by) values('10000000-0000-4000-8000-000000000001','payment_collection',true,true,'active','tested','','95000000-0000-4000-8001-000000000001'); raise exception 'Active without rollback accepted'; exception when check_violation then null; end;
 begin insert into public.workspace_automation_controls(tenant_id,capability,requested,owner_approved,activation_state,test_evidence,rollback_plan,updated_by) values('10000000-0000-4000-8000-000000000001','subscription_billing',true,true,'active',E'\t\t','rollback','95000000-0000-4000-8001-000000000001'); raise exception 'Active with tab-only evidence accepted'; exception when check_violation then null; end;
 begin insert into public.workspace_automation_controls(tenant_id,capability,requested,owner_approved,activation_state,test_evidence,rollback_plan,updated_by) values('10000000-0000-4000-8000-000000000001','dispatch_automation',true,true,'active','tested',E'\n\n','95000000-0000-4000-8001-000000000001'); raise exception 'Active with newline-only rollback accepted'; exception when check_violation then null; end;
 begin insert into public.workspace_automation_controls(tenant_id,capability,updated_by) values('10000000-0000-4000-8000-000000000001','not_valid','95000000-0000-4000-8001-000000000001'); raise exception 'Invalid capability accepted'; exception when check_violation then null; end;
 begin insert into public.workspace_automation_controls(tenant_id,capability,updated_by) values('10000000-0000-4000-8000-000000000001','payment_collection','95000000-0000-4000-8001-000000000002'); raise exception 'Forged updated_by accepted'; exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub','95000000-0000-4000-8001-000000000002',true);
update public.workspace_automation_controls
set owner_approved=true, activation_state='ready', test_evidence='Admin verified fictional test call and provider dry run.', rollback_plan='Pause feature and disable provider writer.', updated_by='95000000-0000-4000-8001-000000000002'
where tenant_id='10000000-0000-4000-8000-000000000001' and capability='sms';

do $$ begin
 if (select count(*) from public.workspace_automation_controls where tenant_id='10000000-0000-4000-8000-000000000001') <> 1 then raise exception 'Admin cannot read automation controls'; end if;
 begin update public.workspace_automation_controls set updated_by='95000000-0000-4000-8001-000000000001' where tenant_id='10000000-0000-4000-8000-000000000001' and capability='sms'; raise exception 'Forged update actor accepted'; exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub','95000000-0000-4000-8001-000000000003',true);
do $$ begin
 if (select count(*) from public.workspace_automation_controls where tenant_id='10000000-0000-4000-8000-000000000001') <> 0 then raise exception 'Dispatcher can read private automation control notes'; end if;
 begin update public.workspace_automation_controls set activation_state='active', updated_by='95000000-0000-4000-8001-000000000003' where tenant_id='10000000-0000-4000-8000-000000000001' and capability='sms'; if found then raise exception 'Dispatcher automation write accepted'; end if; exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub','95000000-0000-4000-8001-000000000004',true);
do $$ begin
 if (select count(*) from public.workspace_automation_controls where tenant_id='10000000-0000-4000-8000-000000000001') <> 0 then raise exception 'Viewer can read private automation control notes'; end if;
 begin update public.workspace_automation_controls set activation_state='active', updated_by='95000000-0000-4000-8001-000000000004' where tenant_id='10000000-0000-4000-8000-000000000001' and capability='sms'; if found then raise exception 'Viewer automation write accepted'; end if; exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub','95000000-0000-4000-8001-000000000005',true);
do $$ begin
 if (select count(*) from public.workspace_automation_controls where tenant_id='10000000-0000-4000-8000-000000000001') <> 0 then raise exception 'Cross-tenant owner can read automation controls'; end if;
 begin update public.workspace_automation_controls set activation_state='paused', updated_by='95000000-0000-4000-8001-000000000005' where tenant_id='10000000-0000-4000-8000-000000000001' and capability='sms'; if found then raise exception 'Cross-tenant automation write accepted'; end if; exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub','95000000-0000-4000-8001-000000000001',true);
update public.workspace_automation_controls set activation_state='active', updated_by='95000000-0000-4000-8001-000000000001'
where tenant_id='10000000-0000-4000-8000-000000000001' and capability='sms';

do $$ begin
 if not exists(select 1 from public.audit_events where tenant_id='10000000-0000-4000-8000-000000000001' and entity_type='workspace_automation_controls' and action='INSERT') then raise exception 'Automation insert audit missing'; end if;
 if not exists(select 1 from public.audit_events where tenant_id='10000000-0000-4000-8000-000000000001' and entity_type='workspace_automation_controls' and action='UPDATE') then raise exception 'Automation update audit missing'; end if;
end $$;
reset role;
rollback;
