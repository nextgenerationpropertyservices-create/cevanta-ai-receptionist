import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
const database = await PGlite.create();
try {
  await database.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create schema auth;
    create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb not null default '{}', email_confirmed_at timestamptz, deleted_at timestamptz);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public, auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated;
  `);
  for (const file of readdirSync("supabase/migrations").filter(file => file.endsWith(".sql")).sort()) {
    await database.exec(readFileSync("supabase/migrations/" + file, "utf8"));
  }
  await database.exec(readFileSync("supabase/tests/workspace_provisioning.sql", "utf8"));
  console.log("PASS workspace provisioning authorization/idempotency assertions.");
  console.log("Auth compatibility fixture only; live Supabase JWT/PostgREST/browser verification remains required.");
} catch (error) {
  console.error("FAIL workspace provisioning embedded assertions; raw row/error payload suppressed.");
  const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
  if (typeof code === "string" && /^[A-Z0-9]{5}$/.test(code)) console.error("SQLSTATE: " + code);
  process.exitCode = 1;
} finally {
  await database.close();
}