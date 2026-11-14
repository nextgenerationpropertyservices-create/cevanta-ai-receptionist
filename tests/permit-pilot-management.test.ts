import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { expect, test } from "vitest";

test("pilot operators manage only linked tenants without inheriting access to permit records", async () => {
  const db = await PGlite.create();
  const operator = "10000000-0000-4000-8000-000000000001";
  const client = "10000000-0000-4000-8000-000000000002";
  const other = "10000000-0000-4000-8000-000000000003";
  const admin = "20000000-0000-4000-8000-000000000001";
  const contractor = "20000000-0000-4000-8000-000000000002";
  const receipt = "30000000-0000-4000-8000-000000000001";
  const as = (user: string) => db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${user}',false);`);
  const access = (target: string, enabled: boolean, permitsOnly: boolean) => db.query(
    "select public.set_permit_pilot_access($1,$2,$3,now()+interval '1 day',$4)", [operator, target, enabled, permitsOnly],
  );
  const feedback = () => db.query(
    "select public.submit_permit_pilot_feedback($1,$2,'Suggestion',4::smallint,'Fixture feedback','Fixture review',false)",
    [client, receipt],
  );
  const overview = async () => (await db.query<{ details: { workspaces: unknown[]; feedback: unknown[] } }>(
    "select public.permit_pilot_overview($1) details", [operator],
  )).rows[0].details;
  try {
    await db.exec(`create role anon nologin; create role authenticated nologin;
      create schema auth; create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb);
      create function auth.uid() returns uuid language sql stable as
      $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      grant usage on schema public,auth to anon,authenticated;
      grant execute on function auth.uid() to anon,authenticated;
      alter default privileges in schema public grant all on tables to anon,authenticated;`);
    for (const file of readdirSync("supabase/migrations").filter(file => file.endsWith(".sql")).sort()) {
      await db.exec(readFileSync(`supabase/migrations/${file}`, "utf8"));
    }
    await db.exec(`insert into auth.users(id) values('${admin}'),('${contractor}');
      insert into public.tenants(id,name,trade,account_type) values ('${operator}','Fixture operator','Software','internal'),
      ('${client}','Fixture contractor','Electrical','client'),('${other}','Fixture other','Electrical','client');
      insert into public.memberships(tenant_id,user_id,role) values('${operator}','${admin}','admin'),('${client}','${contractor}','owner');
      insert into public.managed_client_workspaces(operator_tenant_id,client_tenant_id,created_by) values('${operator}','${client}','${admin}');`);
    await as(admin);
    await expect(access(other, true, false)).rejects.toMatchObject({ code: "42501" });
    await access(client, true, true);
    expect((await overview()).workspaces).toMatchObject([{ id: client, enabled: true, permitdesk_only: true }]);
    await expect(feedback()).rejects.toMatchObject({ code: "42501" });
    await as(contractor);
    await expect(overview()).rejects.toMatchObject({ code: "42501" });
    await expect(access(client, false, false)).rejects.toMatchObject({ code: "42501" });
    await db.query("insert into public.job_permits(tenant_id,title,site,jurisdiction,scope) values($1,'Fixture','Test street','Fixture town','Fixture scope')", [client]);
    await feedback();
    await feedback();
    await expect(db.query("select * from public.permit_pilot_feedback")).rejects.toMatchObject({ code: "42501" });
    await as(admin);
    expect((await db.query("select id from public.job_permits")).rows).toEqual([]);
    expect((await overview()).feedback).toMatchObject([{ message: "Fixture feedback", allow_quote: false }]);
    await access(client, false, false);
    await as(contractor);
    await expect(feedback()).rejects.toMatchObject({ code: "42501" });
    expect((await db.query("select id from public.job_permits")).rows).toEqual([]);
    await as(admin);
    await access(client, true, false);
    await as(contractor);
    expect((await db.query("select id from public.job_permits")).rows).toHaveLength(1);
    for (const status of ["paused", "archived"]) {
      await db.exec(`reset role; update public.managed_client_workspaces set status='${status}' where client_tenant_id='${client}';`);
      await as(contractor);
      expect((await db.query("select tenant_id from public.permit_workspace_access")).rows).toEqual([]);
      expect((await db.query("select id from public.job_permits")).rows).toEqual([]);
      await expect(feedback()).rejects.toMatchObject({ code: "42501" });
      await expect(db.query("insert into public.job_permits(tenant_id,title,site,jurisdiction,scope) values($1,'Fixture','Test street','Fixture town','Fixture scope')", [client])).rejects.toMatchObject({ code: "42501" });
    }
  } finally {
    await db.close();
  }
}, 30000);
