import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import config from "../next.config";

const require = createRequire(import.meta.url);
const bytes = require("next/dist/compiled/bytes") as { parse(value: string): number };

describe("onboarding framework transport configuration (not HTTP execution)", () => {
  it("sets a finite raw cap using the installed framework byte parser", () => {
    expect(config.experimental?.serverActions).toEqual({ bodySizeLimit: "1mb" });
    expect(bytes.parse("1mb")).toBe(1048576);
  });
  it("does not add action-origin exemptions or weaken existing browser headers", async () => {
    const actions = config.experimental?.serverActions;
    expect(actions && typeof actions === "object" ? actions.allowedOrigins : undefined).toBeUndefined();
    expect(config.allowedDevOrigins).toEqual(["127.0.0.1"]);
    expect(config.poweredByHeader).toBe(false);
    const headers = await config.headers!();
    expect(headers[0].headers).toContainEqual({ key: "X-Content-Type-Options", value: "nosniff" });
    expect(headers[0].headers).toContainEqual({ key: "X-Frame-Options", value: "DENY" });
  });
  it("leaves room for the largest fictional service text set and framing", () => {
    // 100 services, maximum code-point lengths, four-byte Unicode; plain JSON
    // estimate only. Actual React serialization/multipart still needs HTTP proof.
    const items = Array.from({ length: 100 }, (_, position) => ({ id: null, name: "😀".repeat(120), description: "😀".repeat(2000), enabled: true, position }));
    expect(Buffer.byteLength(JSON.stringify({ items }), "utf8") + 20 * 1024).toBeLessThan(1048576);
  });
  it("alarms if installed framework limit enforcement/413 path disappears", () => {
    // Implementation inventory complements config tests; not a simulated POST.
    const source = readFileSync(require.resolve("next/dist/server/app-render/action-handler"), "utf8");
    expect(source).toContain("serverActions.bodySizeLimit");
    expect(source).toContain("bodySizeLimitBytes");
    expect(source).toContain("ApiError(413");
    expect(source).toContain("Body exceeded");
  });
});
