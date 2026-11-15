import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";

const database = await PGlite.create();
try {
  await database.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin;
    create schema auth;
    create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb not null default '{}', email_confirmed_at timestamptz, deleted_at timestamptz);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public, auth to anon, authenticated, service_role;
    grant execute on function auth.uid() to anon, authenticated, service_role;
    alter default privileges in schema public grant all on tables to anon, authenticated;
  `);
  for (const file of readdirSync("supabase/migrations").filter(file => file.endsWith(".sql")).sort()) {
    await database.exec(readFileSync("supabase/migrations/" + file, "utf8"));
  }
  await database.exec(`
    do $$
    declare
      free_tenant uuid;
      managed_tenant uuid;
      internal_tenant uuid;
      actor uuid := '11111111-1111-4111-8111-111111111111';
      connection uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
      managed_connection uuid := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
      response jsonb;
      i integer;
    begin
      insert into public.tenants(name,trade,timezone) values('Fictional free shop','Plumbing','America/New_York') returning id into free_tenant;
      insert into public.tenants(name,trade,timezone,plan) values('Fictional managed shop','HVAC','America/New_York','managed_receptionist') returning id into managed_tenant;
      insert into public.tenants(name,trade,timezone,account_type,plan) values('Fictional Cevanta operator','Software','America/New_York','internal','managed_receptionist') returning id into internal_tenant;
      insert into auth.users(id,email,email_confirmed_at) values(actor,'fictional-operator@example.invalid',now());
      insert into public.memberships(tenant_id,user_id,role) values
        (internal_tenant,actor,'owner'),(free_tenant,actor,'owner'),(managed_tenant,actor,'owner');
      insert into public.managed_client_workspaces(operator_tenant_id,client_tenant_id,created_by,status) values
        (internal_tenant,free_tenant,actor,'onboarding'),(internal_tenant,managed_tenant,actor,'onboarding');
      perform set_config('request.jwt.claim.sub',actor::text,true);
      if (select plan from public.tenants where id=free_tenant) <> 'free' then raise exception 'new tenant was not free'; end if;

      for i in 1..50 loop
        insert into public.leads(tenant_id,submission_id,name,description,status)
        values(free_tenant,gen_random_uuid(),'Fictional lead '||i,'Synthetic request','new');
      end loop;
      begin
        insert into public.leads(tenant_id,submission_id,name,description,status)
        values(free_tenant,gen_random_uuid(),'Fictional lead 51','Synthetic request','new');
        raise exception 'free active lead 51 unexpectedly passed';
      exception when sqlstate 'P0001' then
        if sqlerrm <> 'free_plan_active_lead_limit' then raise; end if;
      end;
      insert into public.leads(tenant_id,submission_id,name,description,status)
      values(free_tenant,gen_random_uuid(),'Fictional closed lead','Synthetic request','closed');
      update public.leads set status='closed' where tenant_id=free_tenant and name='Fictional lead 1';
      insert into public.leads(tenant_id,submission_id,name,description,status)
      values(free_tenant,gen_random_uuid(),'Replacement active lead','Synthetic request','new');

      insert into public.technician_roster(tenant_id,display_name) values(free_tenant,'Fictional Tech One'),(free_tenant,'Fictional Tech Two');
      begin
        insert into public.technician_roster(tenant_id,display_name) values(free_tenant,'Fictional Tech Three');
        raise exception 'free technician 3 unexpectedly passed';
      exception when sqlstate 'P0001' then
        if sqlerrm <> 'free_plan_technician_limit' then raise; end if;
      end;
      update public.technician_roster set display_name='Fictional Tech One Updated' where tenant_id=free_tenant and display_name='Fictional Tech One';
      delete from public.technician_roster where tenant_id=free_tenant and display_name='Fictional Tech Two';
      insert into public.technician_roster(tenant_id,display_name) values(free_tenant,'Fictional Tech Replacement');

      for i in 1..55 loop
        insert into public.leads(tenant_id,submission_id,name,description,status)
        values(managed_tenant,gen_random_uuid(),'Managed fictional lead '||i,'Synthetic request','new');
      end loop;
      insert into public.technician_roster(tenant_id,display_name) values(managed_tenant,'Managed Tech One'),(managed_tenant,'Managed Tech Two'),(managed_tenant,'Managed Tech Three');

      insert into integration_private.retell_connections(tenant_id,connection_id,provider_account_id,enabled)
      values(free_tenant,connection,'agent_free_fixture',true);
      response:=public.ingest_retell_call_lead(jsonb_build_object(
        'connection_id',connection,'provider_account_id','agent_free_fixture','provider_event_id','event_free_fixture',
        'provider_call_id','call_free_fixture','lead_description','Synthetic provider request'
      ));
      if response->>'status' <> 'plan_restricted' then raise exception 'free provider ingress was not restricted'; end if;
      if exists(select 1 from integration_private.retell_event_receipts where tenant_id=free_tenant) then raise exception 'restricted ingress wrote a receipt'; end if;
      if exists(select 1 from integration_private.office_notification_outbox where tenant_id=free_tenant) then raise exception 'restricted ingress wrote an outbox row'; end if;

      begin
        insert into public.workspace_automation_controls(tenant_id,capability,updated_by)
        values(free_tenant,'sms',actor);
        raise exception 'free automation control unexpectedly passed';
      exception when sqlstate 'P0001' then
        if sqlerrm <> 'free_plan_automation_restricted' then raise; end if;
      end;
      insert into public.workspace_automation_controls(tenant_id,capability,updated_by)
      values(managed_tenant,'sms',actor);
      update public.tenants set plan='free' where id=managed_tenant;
      begin
        update public.workspace_automation_controls set requested=true
        where tenant_id=managed_tenant and capability='sms';
        raise exception 'free automation control update unexpectedly passed';
      exception when sqlstate 'P0001' then
        if sqlerrm <> 'free_plan_automation_restricted' then raise; end if;
      end;
      update public.tenants set plan='managed_receptionist' where id=managed_tenant;

      begin
        response:=public.create_reactivation_campaign(jsonb_build_object('tenant_id',free_tenant));
        raise exception 'free reactivation RPC unexpectedly passed';
      exception when sqlstate '42501' then null;
      end;
      begin
        response:=public.review_reactivation_candidate(jsonb_build_object(
          'tenant_id',free_tenant,'candidate_id','22222222-2222-4222-8222-222222222222','decision','approve'
        ));
        raise exception 'free reactivation review unexpectedly passed';
      exception when sqlstate '42501' then null;
      end;
      begin
        perform * from public.schedule_reactivation_visit(
          free_tenant,'22222222-2222-4222-8222-222222222222',current_date+1,now()+interval '1 day',now()+interval '1 day 1 hour'
        );
        raise exception 'free reactivation scheduling unexpectedly passed';
      exception when sqlstate '42501' then null;
      end;
      if exists(select 1 from public.reactivation_campaigns where tenant_id=free_tenant) then raise exception 'restricted reactivation wrote a campaign'; end if;

      response:=public.retell_mapping_register(free_tenant,connection,'agent_free_mapping_fixture');
      if response->>'status' <> 'unavailable' then raise exception 'free Retell mapping was not restricted'; end if;
      if exists(select 1 from integration_private.retell_connections where tenant_id=free_tenant and provider_account_id='agent_free_mapping_fixture') then raise exception 'restricted mapping wrote a route'; end if;
      response:=public.retell_mapping_pause(free_tenant,connection);
      if response->>'status' <> 'unavailable' then raise exception 'free Retell pause was not restricted'; end if;
      if not exists(select 1 from integration_private.retell_connections where tenant_id=free_tenant and connection_id=connection and enabled) then raise exception 'restricted pause changed a route'; end if;

      response:=public.retell_mapping_register(managed_tenant,managed_connection,'agent_managed_fixture');
      if response->>'status' <> 'mapped' then raise exception 'managed Retell mapping did not pass'; end if;
      response:=public.retell_mapping_pause(managed_tenant,managed_connection);
      if response->>'status' <> 'paused' then raise exception 'managed Retell pause did not pass'; end if;
    end $$;
  `);
  console.log("PASS workspace plan defaults, limits, trusted-boundary guards, managed compatibility, and provider restriction assertions.");
  console.log("Embedded fixture only; hosted JWT/PostgREST and concurrent final-slot evidence remain required.");
} catch (error) {
  console.error("FAIL workspace plan embedded assertions; record data suppressed.");
  const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
  if (typeof code === "string" && /^[A-Z0-9]{5}$/.test(code)) console.error("SQLSTATE: " + code);
  process.exitCode = 1;
} finally {
  await database.close();
}
