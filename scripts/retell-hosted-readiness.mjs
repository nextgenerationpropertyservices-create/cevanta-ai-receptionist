/** Offline inventory only. No environment values, network, servers or deployment. */
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

export function inspectLocalControls(route, verifier) {
  // Source sentinels are review alarms, not a JavaScript security proof.
  return {
    productionGuardSentinel: route.includes('process.env.NODE_ENV === "production"'),
    defaultOffSentinel: route.includes('process.env.RETELL_INGRESS_PROTOTYPE !== "enabled"'),
    byteCapSentinel: verifier.includes("RETELL_MAX_BODY_BYTES = 64 * 1024") && route.includes("length > RETELL_MAX_BODY_BYTES"),
    noConsoleCallsSentinel: !/console\s*\.\s*(log|info|warn|error|debug)\s*\(/.test(route + verifier),
  };
}

export function inventory(root) {
  const read = path => readFileSync(resolve(root, path), "utf8");
  const controls = inspectLocalControls(read("src/app/api/integrations/retell/route.ts"), read("src/lib/integrations/retell-verifier.ts"));
  const candidatePaths = ["vercel.json", ".vercel/project.json", "netlify.toml", "fly.toml", "render.yaml"];
  let trackedInventoryAvailable = true;
  let tracked = [];
  try {
    tracked = execFileSync("git", ["ls-files", "--", ...candidatePaths], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim().split("\n").filter(Boolean);
  } catch { trackedInventoryAvailable = false; }
  return {
    kind: "offline_readiness_inventory", hostedReady: false, providerConnectionAuthorized: false,
    localControls: controls,
    knownHostingMetadataPresent: candidatePaths.some(path => existsSync(resolve(root, path))),
    trackedInventoryAvailable, knownTrackedHostingMetadataPresent: tracked.length > 0,
    // No arbitrary host URL or configuration contents are read or printed.
    blockers: ["owner_approval_and_separate_hosted_task_required", "hosting_destination_unverified",
      "hosted_raw_bytes_unverified", "read_deadline_unverified", "rate_and_concurrency_controls_unverified",
      "platform_log_redaction_unverified", "hosted_ci_and_restore_unverified"],
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 2) throw new Error("No arguments permitted");
    const result = inventory(fileURLToPath(new URL("../", import.meta.url)));
    console.log(JSON.stringify(result, null, 2));
    // Zero means source inventory ran successfully, never permission to deploy.
    process.exitCode = Object.values(result.localControls).every(Boolean) && result.trackedInventoryAvailable ? 0 : 1;
  } catch {
    console.error("FAIL offline readiness inventory; local source or Git prerequisite unavailable");
    process.exitCode = 1;
  }
}
