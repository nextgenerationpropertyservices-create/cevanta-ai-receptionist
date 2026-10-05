import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { POST } from "@/app/api/integrations/retell/route";
const readinessModule = "../scripts/retell-hosted-readiness.mjs";
const { inspectLocalControls } = await import(readinessModule) as {
  inspectLocalControls: (route: string, verifier: string) => Record<string, boolean>;
};

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

describe("offline hosted readiness fail-closed controls", () => {
  it.each([undefined, "", "enabled", "true"])("production rejects opt-in %s before body reads", async optIn => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("RETELL_INGRESS_PROTOTYPE", optIn);
    vi.stubEnv("RETELL_INGRESS_TEST_SECRET", "fictional-hosted-readiness-key");
    const request = new Request("http://localhost/api/integrations/retell", { method: "POST", body: "fictional-sensitive-sentinel" });
    const response = await POST(request);
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ status: "disabled", persisted: false, bookingCreated: false });
    expect(request.bodyUsed).toBe(false);
    expect(response.headers.has("set-cookie")).toBe(false);
  });
  it.each([undefined, "", "true"])("development remains off unless explicitly opted in: %s", async optIn => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("RETELL_INGRESS_PROTOTYPE", optIn);
    const response = await POST(new Request("http://localhost/api/integrations/retell", { method: "POST", body: "fictional" }));
    expect(response.status).toBe(404);
  });
  it("does not echo or console-log a fictional sensitive failure body", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("RETELL_INGRESS_PROTOTYPE", "enabled");
    vi.stubEnv("RETELL_INGRESS_TEST_SECRET", "fictional-hosted-readiness-key");
    const logs = ["log", "info", "warn", "error", "debug"] as const;
    const spies = logs.map(name => vi.spyOn(console, name));
    const response = await POST(new Request("http://localhost/api/integrations/retell", {
      method: "POST", headers: { "content-type": "application/json", "x-retell-signature": "fictional-invalid" },
      body: JSON.stringify({ transcript: "fictional-sensitive-sentinel" }),
    }));
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ status: "rejected", persisted: false, bookingCreated: false });
    for (const spy of spies) expect(spy).not.toHaveBeenCalled();
  });
  it("detects loss of production/default-off/byte-cap sentinels and new console calls", () => {
    const route = readFileSync("src/app/api/integrations/retell/route.ts", "utf8");
    const verifier = readFileSync("src/lib/integrations/retell-verifier.ts", "utf8");
    expect(Object.values(inspectLocalControls(route, verifier)).every(Boolean)).toBe(true);
    expect(inspectLocalControls(route.replace('process.env.NODE_ENV === "production"', "false"), verifier).productionGuardSentinel).toBe(false);
    expect(inspectLocalControls(route.replace('process.env.RETELL_INGRESS_PROTOTYPE !== "enabled"', "false"), verifier).defaultOffSentinel).toBe(false);
    expect(inspectLocalControls(route, verifier.replace("64 * 1024", "Infinity")).byteCapSentinel).toBe(false);
    expect(inspectLocalControls(`${route}\nconsole.log('fictional');`, verifier).noConsoleCallsSentinel).toBe(false);
  });
});
