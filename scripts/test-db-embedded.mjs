import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
const database = await PGlite.create();
try {
  // Compatibility fixture only: real Supabase Auth/JWT/PostgREST are not running.
  await database.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin;
    create schema auth;
    create table auth.users (
      id uuid primary key,
      email text,
      raw_user_meta_data jsonb not null default '{}'::jsonb,
      email_confirmed_at timestamptz,
      deleted_at timestamptz
    );
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public, auth to anon, authenticated, service_role;
    grant execute on function auth.uid() to anon, authenticated, service_role;
    alter default privileges in schema public grant all on tables to anon, authenticated;
  `);
  for (const file of readdirSync("supabase/migrations").filter(file => file.endsWith(".sql")).sort()) {
    await database.exec(readFileSync("supabase/migrations/" + file, "utf8"));
    console.log("PASS embedded PostgreSQL migration: " + file);
  }
  await database.exec(readFileSync("supabase/seed.sql", "utf8"));
  console.log("PASS fictional seed");
  await database.exec(readFileSync("supabase/tests/tenant_isolation.sql", "utf8"));
  await database.exec(readFileSync("supabase/tests/technician_profiles.sql", "utf8"));
  await database.exec(readFileSync("supabase/tests/workspace_automation_controls.sql", "utf8"));
  await database.exec(readFileSync("supabase/tests/client_onboarding_milestones.sql", "utf8"));
  await database.exec(readFileSync("supabase/tests/retell_mapping_commands.sql", "utf8"));
  await database.exec(readFileSync("supabase/tests/invitation_continuations.sql", "utf8"));
  console.log("PASS embedded PostgreSQL RLS, technician profile, automation control, milestone audit, Retell mapping, invitation continuation, role, parent, identity and atomic audit assertions.");
  console.log("Auth is a compatibility fixture. Live Supabase JWT/PostgREST/browser verification remains required.");
} catch (error) {
  console.error("FAIL embedded SQL assertions: " + (error instanceof Error ? error.message : "unknown database error"));
  process.exitCode = 1;
} finally {
  await database.close();
}
