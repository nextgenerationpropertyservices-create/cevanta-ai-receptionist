import { PGlite } from "@electric-sql/pglite";
import { readFileSync,readdirSync } from "node:fs";
import { expect,test } from "vitest";

test("permit library restricts reads and writes to active entitled office members",async()=>{
 const db=await PGlite.create();
 try {
  await db.exec(`create role anon nologin; create role authenticated nologin;
  create schema auth; create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb);
  create function auth.uid() returns uuid language sql stable as
  $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
  grant usage on schema public,auth to anon,authenticated;
  grant execute on function auth.uid() to anon,authenticated;
  alter default privileges in schema public grant all on tables to anon,authenticated;`);
  for (const file of readdirSync("supabase/migrations").filter(f=>f.endsWith(".sql")).sort()) await db.exec(readFileSync("supabase/migrations/"+file,"utf8"));
  const tenant = "10000000-0000-4000-8000-000000000001";
  const other = "10000000-0000-4000-8000-000000000002";
  const owner = "20000000-0000-4000-8000-000000000001";
  const viewer = "20000000-0000-4000-8000-000000000002";
  await db.exec(`insert into auth.users(id) values('${owner}'),('${viewer}');
    insert into public.tenants(id,name,trade,account_type) values ('${tenant}','Fixture A','Electrical','client'),('${other}','Fixture B','Electrical','client');
    insert into public.memberships(tenant_id,user_id,role) values('${tenant}','${owner}','owner'),('${tenant}','${viewer}','viewer');
    insert into public.permit_workspace_access(tenant_id,enabled) values('${tenant}',true),('${other}',true);`);
  const signIn = (user: string) => db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${user}',false)`);
  const createTemplate = (id: string) => db.exec(`insert into public.permit_scope_templates(tenant_id,name,scope) values('${id}','Fixture scope','Fixture description')`);
  const createProfile = (id: string, portal: string) => db.exec(`insert into public.permit_ahj_overrides(tenant_id,ahj_id,profile) values('${id}','fixture-town','{"name":"Fixture Town","portal":"${portal}"}')`);
  await signIn(owner);
  await createTemplate(tenant);
  await createProfile(tenant, "https://example.org");
  await expect(createTemplate(other)).rejects.toMatchObject({ code: "42501" });
  await expect(createProfile(other, "https://example.org")).rejects.toMatchObject({ code: "42501" });
  await expect(db.exec(`update public.permit_ahj_overrides set profile='{"name":"Fixture Town","portal":"javascript:unsafe"}'`)).rejects.toMatchObject({ code: "23514" });
  await signIn(viewer);
  expect((await db.query("select id from public.permit_scope_templates")).rows).toEqual([]);
  expect((await db.query("select id from public.permit_ahj_overrides")).rows).toEqual([]);
  await expect(createTemplate(tenant)).rejects.toMatchObject({ code: "42501" });
  await db.exec(`reset role; update public.permit_workspace_access set expires_at=now()-interval '1 second' where tenant_id='${tenant}'`);
  await signIn(owner);
  expect((await db.query("select id from public.permit_scope_templates")).rows).toEqual([]);
  expect((await db.query("select id from public.permit_ahj_overrides")).rows).toEqual([]);
 } finally {
   await db.close();
 }
}, 30000);
