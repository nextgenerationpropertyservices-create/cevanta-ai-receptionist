/** Fictional, loopback-only no-writer development smoke. No CLI destinations accepted. */
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const root = fileURLToPath(new URL("../", import.meta.url));
const cli = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
const secret = "fictional-retell-http-smoke-not-a-provider-key";
const body = Buffer.from(' { "event": "call_analyzed", "call": { "call_id": "call_fictional_http_27", "agent_id": "agent_fictional_http_27", "agent_version": 1, "ignored": "fictional café" } }\n');
const sign = (at) => `v=${at},d=${createHmac("sha256", secret).update(body).update(String(at)).digest("hex")}`;

async function freePort() {
  const listener = createServer();
  listener.listen(0, "127.0.0.1");
  await once(listener, "listening");
  const port = listener.address().port;
  await new Promise((resolve, reject) => listener.close(error => error ? reject(error) : resolve()));
  return port;
}

async function main() {
  assert.equal(process.argv.length, 2, "This smoke accepts no arguments or external destination.");
  const port = await freePort();
  // Do not inherit provider tokens or private app configuration from the shell.
  const env = {};
  for (const name of ["PATH", "Path", "SystemRoot", "SYSTEMROOT", "WINDIR", "TEMP", "TMP", "HOME", "USERPROFILE", "APPDATA", "LOCALAPPDATA", "COMSPEC", "PATHEXT"]) {
    if (process.env[name]) env[name] = process.env[name];
  }
  Object.assign(env, {
    NODE_ENV: "development", NEXT_TELEMETRY_DISABLED: "1",
    RETELL_INGRESS_PROTOTYPE: "enabled", RETELL_INGRESS_TEST_SECRET: secret,
    NEXT_PUBLIC_SUPABASE_URL: "https://fictional-http-smoke.invalid",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "fictional-http-smoke-publishable-value",
  });
  const child = spawn(process.execPath, [cli, "dev", "--hostname", "127.0.0.1", "--port", String(port)], {
    cwd: root, env, stdio: ["ignore", "pipe", "pipe"], windowsHide: true,
    detached: process.platform !== "win32",
  });
  let exited = false;
  let ready = false;
  let startFailed = false;
  let outputTail = "";
  const exit = new Promise(resolve => child.once("exit", () => { exited = true; resolve(); }));
  child.on("error", () => { startFailed = true; });
  // Never forward framework output: it may mention private local environment files.
  for (const stream of [child.stdout, child.stderr]) stream.on("data", chunk => {
    outputTail = (outputTail + chunk.toString()).slice(-4096);
    ready ||= /Ready in/.test(outputTail);
  });
  const endpoint = `http://127.0.0.1:${port}/api/integrations/retell`;
  try {
    const deadline = Date.now() + 60000;
    while (!ready) {
      assert(!startFailed && !exited, "Task-owned development server could not start (check port or existing Next dev lock privately).");
      assert(Date.now() < deadline, "Task-owned development server readiness timed out.");
      await delay(100);
    }
    assert(!exited, "Development server exited before smoke.");
    console.log("PASS task-owned loopback server ready; mode development; fictional configuration");
    async function post(bytes, signature, expectedStatus, expectedResult, label) {
      const response = await fetch(endpoint, {
        method: "POST", redirect: "error", signal: AbortSignal.timeout(60000),
        headers: { "content-type": "application/json", "x-retell-signature": signature, cookie: "fictional-session=fictional-value" },
        body: bytes,
      });
      assert.equal(response.status, expectedStatus, `${label}: unexpected HTTP status`);
      assert.equal(response.headers.has("set-cookie"), false, `${label}: session cookie emitted`);
      // Boolean comparison avoids printing an unexpected response body in errors.
      const json = await response.json();
      assert(JSON.stringify(json) === JSON.stringify({ status: expectedResult, persisted: false, bookingCreated: false }), `${label}: unexpected safe result`);
      console.log(`PASS ${label}: HTTP ${expectedStatus}; ${expectedResult}; persisted=false; bookingCreated=false; no Set-Cookie`);
    }
    // Compile using an invalid signature first so startup time cannot age the positive signature.
    await post(body, "fictional-invalid-signature", 401, "rejected", "missing-valid-signature");
    const now = Date.now();
    await post(body, sign(now), 200, "verified_not_persisted", "exact signed whitespace/Unicode bytes");
    await post(Buffer.concat([body, Buffer.from(" ")]), sign(Date.now()), 401, "rejected", "altered body");
    await post(body, sign(Date.now() - 10 * 60 * 1000), 401, "rejected", "stale signature");
  } finally {
    if (!exited && child.pid) {
      if (process.platform === "win32") {
        const stop = spawn(`${process.env.SystemRoot ?? "C:/Windows"}/System32/taskkill.exe`, ["/PID", String(child.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
        const [code] = await once(stop, "exit");
        assert(code === 0 || exited, `Task-owned Windows process-tree stop failed (exit ${code}).`);
      } else {
        process.kill(-child.pid, "SIGTERM");
      }
      await Promise.race([exit, delay(10000).then(() => { throw new Error("Task-owned server shutdown timed out."); })]);
    }
    assert(exited || startFailed, "Server shutdown not confirmed.");
    // Confirm the port is closed; never send a second request after shutdown.
    const listener = createServer();
    listener.listen(port, "127.0.0.1");
    await once(listener, "listening");
    await new Promise(resolve => listener.close(resolve));
    console.log("PASS task-owned server stopped; loopback port released");
  }
}

main().catch(error => {
  // Suppress raw exception detail from network/framework responses.
  console.error(`FAIL local fictional smoke: ${error instanceof assert.AssertionError ? error.message.split("\n")[0] : "startup, HTTP, or cleanup failed; inspect local prerequisites privately"}`);
  process.exitCode = 1;
});
