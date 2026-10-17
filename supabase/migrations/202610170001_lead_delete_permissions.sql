begin;

create policy lead_delete on public.leads
  for delete to authenticated
  using (public.has_tenant_role(tenant_id,array['owner','admin','dispatcher']::public.app_role[]));

grant delete on public.leads to authenticated;

commit;
