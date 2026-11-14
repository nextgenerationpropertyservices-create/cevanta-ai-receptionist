import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { expect, test } from "vitest";

test("permit attachments require active access to their exact tenant and parent", async () => {
  const db = await PGlite.create();
  const company = "10000000-0000-4000-8000-000000000001";
  const otherCompany = "10000000-0000-4000-8000-000000000002";
  const owner = "20000000-0000-4000-8000-000000000001";
  const otherOwner = "20000000-0000-4000-8000-000000000002";
  const permit = "30000000-0000-4000-8000-000000000001";
  try {
    await db.exec(`create role anon nologin; create role authenticated nologin;
      create schema auth; create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb);
      create function auth.uid() returns uuid language sql stable as
      $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      grant usage on schema public,auth to anon,authenticated;
      grant execute on function auth.uid() to anon,authenticated;`);
    for (const file of readdirSync("supabase/migrations").filter((name) => name.endsWith(".sql")).sort()) {
      await db.exec(readFileSync("supabase/migrations/" + file, "utf8"));
    }
    await db.exec(`insert into auth.users(id) values ('${owner}'), ('${otherOwner}');
      insert into public.tenants(id,name,trade,account_type) values
        ('${company}','Fixture company','Electrical','client'),
        ('${otherCompany}','Other fixture company','Electrical','client');
      insert into public.memberships(tenant_id,user_id,role) values
        ('${company}','${owner}','owner'), ('${otherCompany}','${otherOwner}','owner');
      insert into public.permit_workspace_access(tenant_id,enabled) values ('${company}',true), ('${otherCompany}',true);
      insert into public.job_permits(id,tenant_id,title,site,jurisdiction,scope)
        values ('${permit}','${company}','Fixture permit','Test street','Winchendon, MA','Fixture scope');`);
    const signIn = (user: string) => db.exec(`set role authenticated;select set_config('request.jwt.claim.sub','${user}',false);`);
    const insert = (tenant: string, content: string) => db.query(
      "insert into public.permit_documents(tenant_id,permit_id,label,category,filename,content,include_in_packet) values($1,$2,'Fixture document','application','test.pdf',$3::text::bytea,true)",
      [tenant, permit, content],
    );
    const list = async () => (await db.query("select encode(content,'hex') as content, include_in_packet from public.permit_documents")).rows;
    await signIn(owner);
    await insert(company, "\\x25504446");
    expect(await list()).toEqual([{ content: "25504446", include_in_packet: true }]);
    await db.exec("update public.permit_documents set include_in_packet=false");
    expect(await list()).toEqual([{ content: "25504446", include_in_packet: false }]);
    await expect(db.exec("update public.permit_documents set content=null")).rejects.toMatchObject({ code: "42501" });
    await expect(insert(company, "\\x" + "25".repeat(2 * 1024 * 1024 + 1))).rejects.toMatchObject({ code: "23514" });
    await signIn(otherOwner);
    expect(await list()).toEqual([]);
    await expect(insert(otherCompany, "\\x25")).rejects.toMatchObject({ code: "42501" });
    await expect(insert(company, "\\x25")).rejects.toMatchObject({ code: "42501" });
    await db.exec("delete from public.permit_documents");
    await signIn(owner);
    expect(await list()).toHaveLength(1);
    await db.exec(`reset role; update public.permit_workspace_access set expires_at=now()-interval '1 second' where tenant_id='${company}';`);
    await signIn(owner);
    expect(await list()).toEqual([]);
    await expect(insert(company, "\\x25")).rejects.toMatchObject({ code: "42501" });
    await db.exec("reset role; set role anon");
    await expect(list()).rejects.toMatchObject({ code: "42501" });
  } finally {
    await db.close();
  }
}, 30_000);
