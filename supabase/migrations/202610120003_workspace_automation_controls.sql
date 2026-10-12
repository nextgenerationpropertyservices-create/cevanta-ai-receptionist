begin;

create table public.workspace_automation_controls (
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid not null references public.tenants(id) on delete cascade,
 capability text not null check(capability in ('sms','email','external_calendar','automatic_booking','payment_collection','subscription_billing','dispatch_automation')),
 requested boolean not null default false,
 client_visible boolean not null default true,
 owner_approved boolean not null default false,
 activation_state text not null default 'off' check(activation_state in ('off','requested','testing','ready','active','paused')),
 test_evidence text check(test_evidence is null or length(test_evidence)<=2000),
 rollback_plan text check(rollback_plan is null or length(rollback_plan)<=2000),
 provider_notes text check(provider_notes is null or length(provider_notes)<=2000),
 updated_by uuid references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(tenant_id,capability),
 check(
  activation_state <> 'active'
  or (
   requested
   and owner_approved
   and length(regexp_replace(coalesce(test_evidence,''), '\s', '', 'g')) > 0
   and length(regexp_replace(coalesce(rollback_plan,''), '\s', '', 'g')) > 0
  )
 )
);

create index workspace_automation_controls_tenant_idx on public.workspace_automation_controls(tenant_id,capability);

alter table public.workspace_automation_controls enable row level security;

create policy automation_control_read on public.workspace_automation_controls
 for select to authenticated
 using(public.has_tenant_role(tenant_id,array['owner','admin']::public.app_role[]));

create policy automation_control_insert on public.workspace_automation_controls
 for insert to authenticated
 with check(public.has_tenant_role(tenant_id,array['owner','admin']::public.app_role[]) and updated_by = (select auth.uid()));

create policy automation_control_update on public.workspace_automation_controls
 for update to authenticated
 using(public.has_tenant_role(tenant_id,array['owner','admin']::public.app_role[]))
 with check(public.has_tenant_role(tenant_id,array['owner','admin']::public.app_role[]) and updated_by = (select auth.uid()));

revoke all on public.workspace_automation_controls from public,anon,authenticated;
grant select on public.workspace_automation_controls to authenticated;
grant insert(tenant_id,capability,requested,client_visible,owner_approved,activation_state,test_evidence,rollback_plan,provider_notes,updated_by) on public.workspace_automation_controls to authenticated;
grant update(requested,client_visible,owner_approved,activation_state,test_evidence,rollback_plan,provider_notes,updated_by) on public.workspace_automation_controls to authenticated;

create trigger touch_updated_at before update on public.workspace_automation_controls for each row execute function public.touch_updated_at();
create trigger audit_change after insert or update or delete on public.workspace_automation_controls for each row execute function public.record_audit_event();

commit;


