import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";

const targetMigration = "202611030001_free_tool_users.sql";
const database = await PGlite.create();

async function setActor(actor) {
  await database.query("select set_config('request.jwt.claim.sub', $1, false)", [actor ?? ""]);
}

async function asRole(role, operation) {
  await database.exec(`set role ${role}`);
  try {
    return await operation();
  } finally {
    await database.exec("reset role");
  }
}

try {
  await database.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin;
    create schema auth;
    create table auth.users (
      id uuid primary key,
      email text,
      raw_user_meta_data jsonb not null default '{}',
      email_confirmed_at timestamptz,
      deleted_at timestamptz
    );
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public, auth to anon, authenticated, service_role;
    grant execute on function auth.uid() to anon, authenticated, service_role;
    alter default privileges in schema public grant all on tables to anon, authenticated;
  `);

  const migrations = readdirSync("supabase/migrations")
    .filter(file => file.endsWith(".sql") && file !== targetMigration)
    .sort();
  for (const file of migrations) {
    await database.exec(readFileSync("supabase/migrations/" + file, "utf8"));
  }

  const legacyOwner = "10000000-0000-4000-8000-000000000001";
  const backfillOwner = "10000000-0000-4000-8000-000000000007";
  await database.query(
    "insert into auth.users(id,email,email_confirmed_at) values($1,$2,now()),($3,$4,now())",
    [legacyOwner, "legacy-upgraded@example.invalid", backfillOwner, "existing-free@example.invalid"],
  );
  await setActor(legacyOwner);
  const legacyResult = await database.query(
    `select public.provision_owner_workspace(jsonb_build_object(
      'request_id','20000000-0000-4000-8000-000000000001',
      'name','Legacy fictional workspace','trade','HVAC','timezone','America/New_York'
    )) as result`,
  );
  if (legacyResult.rows[0].result.status !== "saved") throw new Error("legacy fixture provisioning failed");
  const legacyTenant = legacyResult.rows[0].result.workspace.id;
  await database.query("update public.tenants set plan='dashboard_plus' where id=$1", [legacyTenant]);

  await setActor(backfillOwner);
  const backfillResult = await database.query(
    `select public.provision_owner_workspace(jsonb_build_object(
      'request_id','20000000-0000-4000-8000-000000000007',
      'name','Existing fictional free workspace','trade','Roofing','timezone','America/New_York'
    )) as result`,
  );
  if (backfillResult.rows[0].result.status !== "saved") throw new Error("backfill fixture provisioning failed");
  const backfillTenant = backfillResult.rows[0].result.workspace.id;

  await setActor(null);
  await database.exec(readFileSync("supabase/migrations/" + targetMigration, "utf8"));

  await database.exec(`
    do $$
    begin
      if exists(
        select 1 from onboarding_private.workspace_provision_receipts
        where actor_user_id='10000000-0000-4000-8000-000000000001'
          and origin_plan is not null
      ) then raise exception 'legacy receipt was incorrectly classified'; end if;
      if not exists(
        select 1 from onboarding_private.workspace_provision_receipts
        where actor_user_id='10000000-0000-4000-8000-000000000007'
          and origin_plan='free'
      ) then raise exception 'current free receipt was not backfilled'; end if;
    end $$;
  `);
  let immutableOriginDenied = false;
  try {
    await database.query(
      "update onboarding_private.workspace_provision_receipts set origin_plan='dashboard_plus' where tenant_id=$1",
      [backfillTenant],
    );
  } catch (error) {
    immutableOriginDenied = error && typeof error === "object" && "code" in error && error.code === "55000";
  }
  if (!immutableOriginDenied) throw new Error("free origin provenance was mutable");

  const freeOwner = "10000000-0000-4000-8000-000000000002";
  const operator = "10000000-0000-4000-8000-000000000003";
  const outsideOwner = "10000000-0000-4000-8000-000000000004";
  const internalViewer = "10000000-0000-4000-8000-000000000005";
  const unconfirmedOperator = "10000000-0000-4000-8000-000000000006";
  await database.query(
    `insert into auth.users(id,email,email_confirmed_at) values
      ($1,'fictional-free-owner@example.invalid',now()),
      ($2,'fictional-operator@example.invalid',now()),
      ($3,'fictional-outside@example.invalid',now()),
      ($4,'fictional-viewer@example.invalid',now()),
      ($5,'fictional-unconfirmed@example.invalid',null)`,
    [freeOwner, operator, outsideOwner, internalViewer, unconfirmedOperator],
  );

  await setActor(freeOwner);
  const provisionResult = await database.query(
    `select public.provision_owner_workspace(jsonb_build_object(
      'request_id','20000000-0000-4000-8000-000000000002',
      'name','Fictional free-origin workspace','trade','Plumbing','timezone','America/New_York'
    )) as result`,
  );
  if (provisionResult.rows[0].result.status !== "saved") throw new Error("free fixture provisioning failed");
  const freeTenant = provisionResult.rows[0].result.workspace.id;

  const fixtures = await database.query(`
    insert into public.tenants(name,trade,timezone,account_type,plan)
    values('Fictional internal operator','Software','America/New_York','internal','managed_receptionist')
    returning id
  `);
  const operatorTenant = fixtures.rows[0].id;
  const outsideFixture = await database.query(`
    insert into public.tenants(name,trade,timezone,plan)
    values('Fictional outside workspace','Electrical','America/New_York','managed_receptionist')
    returning id
  `);
  const outsideTenant = outsideFixture.rows[0].id;
  await database.query(
    `insert into public.memberships(tenant_id,user_id,role) values
      ($1,$2,'owner'),($1,$3,'viewer'),($1,$4,'admin'),($5,$6,'owner')`,
    [operatorTenant, operator, internalViewer, unconfirmedOperator, outsideTenant, outsideOwner],
  );

  await database.query(
    `insert into public.audit_events(tenant_id,actor_user_id,entity_type,entity_id,action,created_at) values
      ($1,$2,'leads','30000000-0000-4000-8000-000000000001','INSERT',now()),
      ($1,$2,'customers','30000000-0000-4000-8000-000000000002','UPDATE',now()),
      ($1,$3,'jobs','30000000-0000-4000-8000-000000000003','INSERT',now()),
      ($4,$2,'appointments','30000000-0000-4000-8000-000000000004','INSERT',now())`,
    [freeTenant, freeOwner, outsideOwner, outsideTenant],
  );

  await setActor(freeOwner);
  const firstOpen = await asRole("authenticated", () =>
    database.query("select public.record_free_tool_open($1) as recorded", [freeTenant]));
  const throttledOpen = await asRole("authenticated", () =>
    database.query("select public.record_free_tool_open($1) as recorded", [freeTenant]));
  if (firstOpen.rows[0].recorded !== true || throttledOpen.rows[0].recorded !== false) {
    throw new Error("open throttling contract failed");
  }
  const foreignOpen = await asRole("authenticated", () =>
    database.query("select public.record_free_tool_open($1) as recorded", [outsideTenant]));
  if (foreignOpen.rows[0].recorded !== false) throw new Error("foreign open unexpectedly recorded");

  await database.query(
    "update free_tool_private.owner_activity set last_opened_at=now()-interval '16 minutes' where tenant_id=$1",
    [freeTenant],
  );
  const refreshedOpen = await asRole("authenticated", () =>
    database.query("select public.record_free_tool_open($1) as recorded", [freeTenant]));
  if (refreshedOpen.rows[0].recorded !== true) throw new Error("open refresh did not record");

  const beforeUpgradeOpen = refreshedOpen.rows[0].recorded;
  await database.query("update public.tenants set plan='dashboard_plus' where id=$1", [freeTenant]);
  const upgradedOpen = await asRole("authenticated", () =>
    database.query("select public.record_free_tool_open($1) as recorded", [freeTenant]));
  if (beforeUpgradeOpen !== true || upgradedOpen.rows[0].recorded !== false) {
    throw new Error("upgraded workspace unexpectedly recorded a new free-tool open");
  }

  await setActor(operator);
  const listed = await asRole("authenticated", () => database.query(
    "select * from public.list_free_tool_users($1,0)", [operatorTenant]));
  if (listed.rows.length !== 2) throw new Error("free-origin list did not include current and new free users");
  const item = listed.rows.find(row => row.workspace_id === freeTenant);
  if (!item) throw new Error("new free-origin row missing");
  if (item.workspace_id !== freeTenant || item.email !== "fictional-free-owner@example.invalid") {
    throw new Error("free-origin projection identity mismatch");
  }
  if (item.plan !== "dashboard_plus") throw new Error("upgraded free-origin workspace was excluded");
  if (!item.last_opened_at || !item.last_tool_activity_at) throw new Error("activity timestamps missing");
  if (JSON.stringify(item.tools_used) !== JSON.stringify(["crm", "leads"])) {
    throw new Error("tool aggregation was not actor and tenant scoped");
  }
  if (!listed.rows.some(row => row.workspace_id === backfillTenant)) {
    throw new Error("existing free receipt was not included");
  }

  await setActor(backfillOwner);
  const backfillOpen = await asRole("authenticated", () =>
    database.query("select public.record_free_tool_open($1) as recorded", [backfillTenant]));
  if (backfillOpen.rows[0].recorded !== true) throw new Error("backfilled free owner open was not recorded");
  await setActor(operator);
  await database.query("delete from auth.users where id=$1", [backfillOwner]);
  const deletedOwnerActivity = await database.query(
    "select count(*)::integer as count from free_tool_private.owner_activity where owner_user_id=$1",
    [backfillOwner],
  );
  if (deletedOwnerActivity.rows[0].count !== 0) throw new Error("account deletion did not cascade activity");

  for (const [actor, tenant] of [
    [freeOwner, operatorTenant],
    [outsideOwner, outsideTenant],
    [internalViewer, operatorTenant],
    [unconfirmedOperator, operatorTenant],
  ]) {
    await setActor(actor);
    let denied = false;
    try {
      await asRole("authenticated", () =>
        database.query("select * from public.list_free_tool_users($1,0)", [tenant]));
    } catch (error) {
      denied = error && typeof error === "object" && "code" in error && error.code === "42501";
    }
    if (!denied) throw new Error("unauthorized free-user projection unexpectedly succeeded");
  }

  await setActor(operator);
  let badOffsetDenied = false;
  try {
    await asRole("authenticated", () =>
      database.query("select * from public.list_free_tool_users($1,-1)", [operatorTenant]));
  } catch (error) {
    badOffsetDenied = error && typeof error === "object" && "code" in error && error.code === "42501";
  }
  if (!badOffsetDenied) throw new Error("invalid offset unexpectedly succeeded");

  await setActor(operator);
  let anonRecordDenied = false;
  let anonListDenied = false;
  try {
    await asRole("anon", () =>
      database.query("select public.record_free_tool_open($1)", [freeTenant]));
  } catch (error) {
    anonRecordDenied = error && typeof error === "object" && "code" in error && error.code === "42501";
  }
  try {
    await asRole("anon", () =>
      database.query("select * from public.list_free_tool_users($1,0)", [operatorTenant]));
  } catch (error) {
    anonListDenied = error && typeof error === "object" && "code" in error && error.code === "42501";
  }
  if (!anonRecordDenied || !anonListDenied) throw new Error("anonymous RPC execution unexpectedly succeeded");

  await database.exec("set role authenticated");
  let privateReadDenied = false;
  try {
    await database.query("select * from free_tool_private.owner_activity");
  } catch {
    privateReadDenied = true;
  }
  await database.exec("reset role");
  if (!privateReadDenied) throw new Error("private activity storage was readable");

  console.log("PASS free-origin provenance, throttled open tracking, upgraded inclusion, private storage, scoped activity, and internal operator permission assertions.");
  console.log("Embedded fixture only; hosted JWT/PostgREST and concurrent production evidence remain required.");
} catch (error) {
  console.error("FAIL free-tool-user embedded assertions; record data suppressed.");
  const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
  if (typeof code === "string" && /^[A-Z0-9]{5}$/.test(code)) console.error("SQLSTATE: " + code);
  process.exitCode = 1;
} finally {
  await database.close();
}
