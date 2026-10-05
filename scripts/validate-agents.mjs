import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "smol-toml";
import { spawnSync } from "node:child_process";
const expected = ["product_manager", "architect_data", "frontend_ux", "backend_logic", "voice_integrations", "quality_security", "devops_release"];
const directory = resolve(".codex/agents");
const files = readdirSync(directory).filter(file => file.endsWith(".toml"));
const names = new Set();
for (const file of files) {
  const agent = parse(readFileSync(resolve(directory, file), "utf8"));
  for (const key of ["name", "description", "developer_instructions"]) {
    if (typeof agent[key] !== "string" || !agent[key].trim()) throw new Error(file + ": missing " + key);
  }
  for (const key of Object.keys(agent)) {
    if (!["name", "description", "developer_instructions"].includes(key)) throw new Error(file + ": unexpected " + key);
  }
  if (names.has(agent.name)) throw new Error("Duplicate agent: " + agent.name);
  names.add(agent.name);
  console.log("PASS " + agent.name + " (" + file + ")");
  if (process.argv.includes("--native")) {
    const instructions = "You are " + agent.description + ".\n" + agent.developer_instructions;
    const native = spawnSync(process.env.CEVANTA_CODEX_BINARY || "codex", [
      "debug", "prompt-input", "-c", "developer_instructions=" + JSON.stringify(instructions),
      "Validate configuration loading only."
    ], { encoding: "utf8", shell: false, maxBuffer: 10 * 1024 * 1024 });
    if (native.status !== 0 || !native.stdout?.includes(agent.developer_instructions.split("\n")[0])) {
      throw new Error(agent.name + ": native instruction-layer check failed; inspect locally without sharing configuration output.");
    }
    console.log("PASS native instruction layer: " + agent.name);
  }
}
if (files.length !== 7 || expected.some(name => !names.has(name))) throw new Error("Expected all seven Cevanta agents");
console.log("Seven TOML definitions match the documented native schema. Native tool registration and instruction-layer loading are distinct checks.");
