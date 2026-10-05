import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { parse } from "smol-toml";
const [role, ...promptParts] = process.argv.slice(2);
const roles = ["product_manager", "architect_data", "frontend_ux", "backend_logic", "voice_integrations", "quality_security", "devops_release"];
if (!roles.includes(role) || !promptParts.length) {
  console.error("Usage: pnpm agent <role> <task instructions or task-file reference>");
  process.exit(1);
}
const definition = parse(readFileSync(resolve(".codex/agents", role + ".toml"), "utf8"));
const result = spawnSync(process.env.CEVANTA_CODEX_BINARY || "codex", [
  "exec", "--strict-config", "--sandbox", "workspace-write",
  "-c", "developer_instructions=" + JSON.stringify("You are " + definition.description + ".\n" + definition.developer_instructions),
  promptParts.join(" ")
], { stdio: "inherit", shell: false });
if (result.error) {
  console.error("Codex could not start. Check the Codex CLI installation and task file.");
  process.exit(1);
}
process.exit(result.status ?? 1);
