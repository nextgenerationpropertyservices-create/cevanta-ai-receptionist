// Deliberately report names and presence only. Never print environment values.
const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
];
let missing = false;
for (const name of required) {
  const present = Boolean(process.env[name]?.trim());
  console.log(`${name}: ${present ? "present" : "missing"}`);
  missing ||= !present;
}
process.exitCode = missing ? 1 : 0;
