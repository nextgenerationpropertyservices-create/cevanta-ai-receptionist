import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const h = vi.hoisted(() => ({ configured: true, request: vi.fn(), getUser: vi.fn(), update: vi.fn(), signOut: vi.fn(), verify: vi.fn(), exchange: vi.fn() }));
vi.mock("@/lib/supabase/config", () => ({ isSupabaseConfigured: () => h.configured }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth: { resetPasswordForEmail: h.request, getUser: h.getUser, updateUser: h.update, signOut: h.signOut, verifyOtp: h.verify, exchangeCodeForSession: h.exchange } }) }));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`REDIRECT:${path}`); } }));

import { requestPasswordRecovery, updateRecoveredPassword } from "@/app/actions/password-recovery";
import { GET } from "@/app/auth/recovery/route";
import { passwordRecoveryOrigin } from "@/lib/server/password-recovery-origin";

const idle = { status: "idle", message: "" } as const;
const form = (fields: Record<string, string>) => { const f = new FormData(); Object.entries(fields).forEach(([k, v]) => f.set(k, v)); return f; };
const password = "fictional password for tests";
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("NODE_ENV", "production"); vi.stubEnv("APP_ORIGIN", "https://app.example.test"); h.configured = true;
  h.request.mockResolvedValue({ error: null }); h.getUser.mockResolvedValue({ data: { user: { id: "fictional-user" } }, error: null });
  h.update.mockResolvedValue({ error: null }); h.signOut.mockResolvedValue({ error: null });
  h.verify.mockResolvedValue({ data: { user: { id: "fictional-user" }, session: {} }, error: null });
  h.exchange.mockResolvedValue({ data: { user: { id: "fictional-user" }, session: {} }, error: null });
});
afterEach(() => vi.unstubAllEnvs());

describe("trusted recovery origin", () => {
  it("fails closed in production without configuration", () => { vi.stubEnv("APP_ORIGIN", ""); expect(passwordRecoveryOrigin).toThrow(); });
  it("uses fixed development loopback without configuration", () => { vi.stubEnv("NODE_ENV", "development"); vi.stubEnv("APP_ORIGIN", ""); expect(passwordRecoveryOrigin()).toBe("http://127.0.0.1:3000"); });
  it.each(["http://app.example.test", "https://user:pass@app.example.test", "https://app.example.test/other", "https://app.example.test?next=evil", "https://app.example.test#fragment", "javascript:alert(1)", "http://localhost:3000"])("rejects unsafe production origin %s", value => { vi.stubEnv("APP_ORIGIN", value); expect(passwordRecoveryOrigin).toThrow(); });
});
describe("recovery request", () => {
  it("does not log email, password, token or provider payloads on failures", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      h.request.mockRejectedValue(new Error("fictional private provider payload"));
      await requestPasswordRecovery(idle, form({ email: "fictional@example.test" }));
      h.update.mockRejectedValue(new Error("fictional private provider payload"));
      await updateRecoveredPassword(idle, form({ password, confirmPassword: password }));
      h.verify.mockRejectedValue(new Error("fictional private provider payload"));
      await GET(new NextRequest("https://app.example.test/auth/recovery?token_hash=fictional_hash"));
      expect(log).not.toHaveBeenCalled(); expect(warn).not.toHaveBeenCalled(); expect(error).not.toHaveBeenCalled();
    } finally { log.mockRestore(); warn.mockRestore(); error.mockRestore(); }
  });
  it.each(["bad", "", "a".repeat(255) + "@example.test"])("rejects invalid email without provider call", async email => { expect((await requestPasswordRecovery(idle, form({ email }))).status).toBe("error"); expect(h.request).not.toHaveBeenCalled(); });
  it("returns identical generic response for success, rejection, rate limit and transport error", async () => {
    const f = form({ email: "fictional@example.test", next: "https://evil.example.test" });
    const success = await requestPasswordRecovery(idle, f);
    h.request.mockResolvedValueOnce({ error: { message: "account missing", status: 400 } }); expect(await requestPasswordRecovery(idle, f)).toEqual(success);
    h.request.mockResolvedValueOnce({ error: { status: 429 } }); expect(await requestPasswordRecovery(idle, f)).toEqual(success);
    h.request.mockRejectedValueOnce(new Error("private provider details")); expect(await requestPasswordRecovery(idle, f)).toEqual(success);
    expect(h.request).toHaveBeenCalledWith("fictional@example.test", { redirectTo: "https://app.example.test/auth/recovery" });
  });
  it("does not send when configuration unavailable", async () => { vi.stubEnv("APP_ORIGIN", ""); expect((await requestPasswordRecovery(idle, form({ email: "fictional@example.test" }))).status).toBe("error"); expect(h.request).not.toHaveBeenCalled(); });
});
describe("verified current-user password update", () => {
  it.each([null, { id: "fictional-user" }])("rejects missing user or auth error", async user => { h.getUser.mockResolvedValue({ data: { user }, error: { message: "unverified" } }); expect((await updateRecoveredPassword(idle, form({ password, confirmPassword: password }))).status).toBe("error"); expect(h.update).not.toHaveBeenCalled(); });
  it("rejects missing user even without provider error", async () => { h.getUser.mockResolvedValue({ data: { user: null }, error: null }); await updateRecoveredPassword(idle, form({ password, confirmPassword: password })); expect(h.update).not.toHaveBeenCalled(); });
  it.each([["", ""], [password, "mismatch"], ["x".repeat(257), "x".repeat(257)]])("validates passwords before update", async (value, confirm) => { expect((await updateRecoveredPassword(idle, form({ password: value, confirmPassword: confirm }))).status).toBe("error"); expect(h.update).not.toHaveBeenCalled(); });
  it("updates only current identity, preserves whitespace, signs out local and redirects", async () => {
    const value = ` ${password} `;
    await expect(updateRecoveredPassword(idle, form({ password: value, confirmPassword: value, userId: "other-user", email: "other@example.test", role: "owner" }))).rejects.toThrow("REDIRECT:/sign-in?reset=success");
    expect(h.update).toHaveBeenCalledWith({ password: value }); expect(h.signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(h.getUser.mock.invocationCallOrder[0]).toBeLessThan(h.update.mock.invocationCallOrder[0]);
  });
  it("provider rejection does not sign out or expose payload", async () => { h.update.mockResolvedValue({ error: { message: "private details" } }); const result = await updateRecoveredPassword(idle, form({ password, confirmPassword: password })); expect(result.status).toBe("error"); expect(result.message).not.toContain("private"); expect(h.signOut).not.toHaveBeenCalled(); });
  it("handles verification network failure", async () => { h.getUser.mockRejectedValue(new Error("private details")); expect((await updateRecoveredPassword(idle, form({ password, confirmPassword: password }))).status).toBe("error"); expect(h.update).not.toHaveBeenCalled(); });
  it.each([false, true])("reports confirmed update and failed sign-out honestly", async thrown => { if (thrown) h.signOut.mockRejectedValue(new Error("private")); else h.signOut.mockResolvedValue({ error: {} }); const result = await updateRecoveredPassword(idle, form({ password, confirmPassword: password })); expect(result.message).toContain("Your password changed"); expect(result.message).toContain("could not sign out"); });
});
describe("dedicated recovery callback", () => {
  const request = (query: string) => new NextRequest(`https://untrusted.example.test/auth/recovery?${query}`);
  it("verifies recovery type and ignores caller type/destination/origin", async () => { const result = await GET(request("token_hash=fictional_hash&type=signup&next=https://evil.example.test")); expect(h.verify).toHaveBeenCalledWith({ token_hash: "fictional_hash", type: "recovery" }); expect(h.exchange).not.toHaveBeenCalled(); expect(result.headers.get("location")).toBe("https://app.example.test/reset-password"); expect(result.headers.get("referrer-policy")).toBe("no-referrer"); expect(result.headers.get("cache-control")).toBe("no-store"); });
  it("also accepts a single safe PKCE recovery code", async () => { const result = await GET(request("code=fictional_code_123")); expect(h.exchange).toHaveBeenCalledWith("fictional_code_123"); expect(h.verify).not.toHaveBeenCalled(); expect(result.headers.get("location")).toBe("https://app.example.test/reset-password"); });
  it.each(["", "token_hash=a&token_hash=b", "code=a&code=b", "token_hash=fictional_hash&code=fictional_code", "token_hash=bad%20hash", "code=bad%20code", `token_hash=${"x".repeat(513)}`, `code=${"x".repeat(2049)}`])("rejects missing/invalid/ambiguous recovery callback %s", async query => { const result = await GET(request(query)); expect(h.verify).not.toHaveBeenCalled(); expect(h.exchange).not.toHaveBeenCalled(); expect(result.headers.get("location")).toBe("https://app.example.test/reset-password?error=recovery"); });
  it.each(["expired", "reused", "login_token", "transport"])("safely rejects provider %s failure", async reason => { if (reason === "transport") h.verify.mockRejectedValue(new Error(reason)); else h.verify.mockResolvedValue({ data: { user: null, session: null }, error: { message: reason } }); const result = await GET(request("token_hash=fictional_hash")); expect(result.headers.get("location")).toBe("https://app.example.test/reset-password?error=recovery"); });
  it("safely rejects PKCE exchange failure", async () => { h.exchange.mockResolvedValue({ data: { user: null, session: null }, error: { message: "private" } }); const result = await GET(request("code=fictional_code")); expect(result.headers.get("location")).toBe("https://app.example.test/reset-password?error=recovery"); });
  it("requires actual verified session", async () => { h.verify.mockResolvedValue({ data: { user: null, session: null }, error: null }); expect((await GET(request("token_hash=fictional_hash"))).headers.get("location")).toContain("error=recovery"); });
  it("fails closed with missing production origin", async () => { vi.stubEnv("APP_ORIGIN", ""); expect((await GET(request("token_hash=fictional_hash"))).status).toBe(503); expect(h.verify).not.toHaveBeenCalled(); });
});
