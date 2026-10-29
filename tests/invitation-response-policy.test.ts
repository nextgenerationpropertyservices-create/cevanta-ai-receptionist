import { describe, expect, it } from "vitest";

import nextConfig from "../next.config";

const privacyHeaders = {
  "cache-control": "private, no-store, max-age=0",
  "cdn-cache-control": "no-store",
  "vercel-cdn-cache-control": "no-store",
  pragma: "no-cache",
  expires: "0",
  "referrer-policy": "no-referrer",
  "x-robots-tag": "noindex, nofollow, noarchive",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
} as const;

const apiCsp = "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; sandbox";

function headerRecord(headers: Array<{ key: string; value: string }>): Record<string, string> {
  return Object.fromEntries(headers.map(({ key, value }) => [key.toLowerCase(), value]));
}

describe("invitation static response policy", () => {
  it("keeps the invitation rules after the global rule so route values win", async () => {
    expect(nextConfig.headers).toBeTypeOf("function");
    const rules = await nextConfig.headers!();

    expect(rules.map((rule) => rule.source)).toEqual([
      "/(.*)",
      "/invite/:path*",
      "/api/invitations/continuations",
    ]);
  });

  it("applies every static privacy header to invitation documents without a static CSP", async () => {
    const rules = await nextConfig.headers!();
    const inviteRule = rules.find((rule) => rule.source === "/invite/:path*");

    expect(inviteRule).toBeDefined();
    expect(headerRecord(inviteRule!.headers)).toEqual(privacyHeaders);
    expect(headerRecord(inviteRule!.headers)).not.toHaveProperty("content-security-policy");
  });

  it("applies the complete privacy policy and document-denying CSP to the exchange API", async () => {
    const rules = await nextConfig.headers!();
    const apiRule = rules.find((rule) => rule.source === "/api/invitations/continuations");

    expect(apiRule).toBeDefined();
    expect(headerRecord(apiRule!.headers)).toEqual({
      ...privacyHeaders,
      "content-security-policy": apiCsp,
    });
  });
});
