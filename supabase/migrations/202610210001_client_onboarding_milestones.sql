-- CEV-ONBOARD-OPS-152A: persisted, owner-controlled onboarding milestones.
begin;

create table public.client_onboarding_milestones (
 tenant_id uuid primary key references public.tenants(id) on delete cascade,
 payment_status text not null default 'not_started' check (payment_status in ('not_started','pending','paid','failed')),
 setup_status text not null default 'not_started' check (setup_status in ('not_started','in_progress','complete')),
 test_call_status text not null default 'not_started' check (test_call_status in ('not_started','passed','failed')),
 retell_status text not null default 'not_connected' check (retell_status in ('not_connected','mapped','verified')),
 make_status text not null default 'not_connected' check (make_status in ('not_connected','mapped','verified')),
 launch_approval_status text not null default 'not_requested' check (launch_approval_status in ('not_requested','approved','revoked')),
 updated_by uuid references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create index client_onboarding_milestones_updated_by_idx on public.client_onboarding_milestones(updated_by);

alter table public.client_onboarding_milestones enable row level security;
create policy client_onboarding_milestones_read on public.client_onboarding_milestones
 for select to authenticated
 using (public.has_tenant_role(tenant_id,array['owner','admin']::public.app_role[]));
create policy client_onboarding_milestones_insert on public.client_onboarding_milestones
 for insert to authenticated
 with check (public.has_tenant_role(tenant_id,array['owner','admin']::public.app_role[]) and updated_by = (select auth.uid()));
create policy client_onboarding_milestones_update on public.client_onboarding_milestones
 for update to authenticated
 using (public.has_tenant_role(tenant_id,array['owner','admin']::public.app_role[]))
 with check (public.has_tenant_role(tenant_id,array['owner','admin']::public.app_role[]) and updated_by = (select auth.uid()));

revoke all on public.client_onboarding_milestones from public,anon,authenticated;
grant select on public.client_onboarding_milestones to authenticated;
grant insert(tenant_id,payment_status,setup_status,test_call_status,retell_status,make_status,launch_approval_status,updated_by) on public.client_onboarding_milestones to authenticated;
grant update(payment_status,setup_status,test_call_status,retell_status,make_status,launch_approval_status,updated_by) on public.client_onboarding_milestones to authenticated;

create trigger touch_client_onboarding_milestones_updated_at before update on public.client_onboarding_milestones for each row execute function public.touch_updated_at();
create trigger audit_client_onboarding_milestones after insert or update or delete on public.client_onboarding_milestones for each row execute function public.record_audit_event();

commit;
