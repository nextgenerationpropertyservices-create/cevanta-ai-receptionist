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
  await database.exec(readFileSync("supabase/tests/retell_lead_ingestion.sql", "utf8"));
  console.log("PASS Retell lead ingestion tenant mapping/dedupe/authorization assertions.");
  console.log("Auth compatibility fixture only; live provider signatures, hosted JWT/PostgREST and real Retell delivery remain required.");
} catch (error) {
  console.error("FAIL Retell lead ingestion embedded assertions; raw row/error payload suppressed.");
  const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
  if (typeof code === "string" && /^[A-Z0-9]{5}$/.test(code)) console.error("SQLSTATE: " + code);
  process.exitCode = 1;
} finally {
  await database.close();
}
