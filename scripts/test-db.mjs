import { spawnSync } from "node:child_process";
const connection = process.env.DATABASE_TEST_URL;
if (!connection) {
  console.error("DATABASE_TEST_URL is required for a disposable local database.");
  process.exit(1);
}
let url;
try { url = new URL(connection); } catch {
  console.error("DATABASE_TEST_URL must be a PostgreSQL connection URL.");
  process.exit(1);
}
if (!["postgres:", "postgresql:"].includes(url.protocol) || !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
  console.error("Refusing to run fixture writes against a non-local database.");
  process.exit(1);
}
const result = spawnSync("psql", ["-X", "-v", "ON_ERROR_STOP=1", "-f", "supabase/tests/tenant_isolation.sql", "-f", "supabase/tests/intake_isolation.sql", "-f", "supabase/tests/jobs_isolation.sql", "-f", "supabase/tests/appointments_isolation.sql"], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, PGHOST: url.hostname === "[::1]" ? "::1" : url.hostname, PGPORT: url.port || "5432", PGDATABASE: decodeURIComponent(url.pathname.slice(1)), PGUSER: decodeURIComponent(url.username), PGPASSWORD: decodeURIComponent(url.password) }
});
if (result.error) {
  console.error("Database check could not start. Install psql and start local Supabase.");
  process.exit(1);
}
// Discard raw output because connection diagnostics may contain sensitive details.
console.log(result.status === 0 ? "PASS database isolation/permissions/audit assertions (rolled back)." : "FAIL database assertions; inspect locally without sharing credentials.");
process.exit(result.status ?? 1);

