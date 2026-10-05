import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
const database = await PGlite.create();
try {
  // Compatibility fixture only: real Supabase Auth/JWT/PostgREST are not running.
  await database.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create schema auth;
    create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb not null default '{}'::jsonb);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public, auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated;
  `);
  for (const file of readdirSync("supabase/migrations").filter(file => file.endsWith(".sql")).sort()) {
    await database.exec(readFileSync("supabase/migrations/" + file, "utf8"));
    console.log("PASS embedded PostgreSQL migration: " + file);
  }
  await database.exec(readFileSync("supabase/seed.sql", "utf8"));
  console.log("PASS fictional seed");
  await database.exec(readFileSync("supabase/tests/tenant_isolation.sql", "utf8"));
  console.log("PASS embedded PostgreSQL RLS, role, parent, identity and atomic audit assertions.");
  console.log("Auth is a compatibility fixture. Live Supabase JWT/PostgREST/browser verification remains required.");
} catch (error) {
  console.error("FAIL embedded SQL assertions: " + (error instanceof Error ? error.message : "unknown database error"));
  process.exitCode = 1;
} finally {
  await database.close();
}

