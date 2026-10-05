import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { config, proxy } from "@/proxy";
import { POST } from "@/app/api/integrations/retell/route";

const mocks = vi.hoisted(() => ({ create: vi.fn(), getUser: vi.fn() }));
vi.mock("@supabase/ssr", () => ({ createServerClient: mocks.create }));

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://fictional-project.invalid");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "fictional-publishable-test-value");
  vi.stubEnv("RETELL_INGRESS_PROTOTYPE", "");
  mocks.create.mockReturnValue({ auth: { getUser: mocks.getUser } });
  mocks.getUser.mockResolvedValue({ data: { user: null } });
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

const matches = (url: string) => unstable_doesMiddlewareMatch({ config, nextConfig: {}, url });
const request = (path: string) => new NextRequest(`http://localhost${path}`, {
  method: "POST", body: ' { "fictional": "café" }\n',
  headers: { "content-type": "application/json", cookie: "fictional-session=fictional-value" },
});

describe("narrow machine ingress proxy exclusion", () => {
  it.each(["/api/integrations/retell", "/api/integrations/retell/", "/api/integrations/retell?fictional=1"])("excludes only the ingress endpoint: %s", async path => {
    expect(matches(path)).toBe(false);
    const incoming = request(path);
    const cookieRead = vi.spyOn(incoming.cookies, "getAll");
    const cookieWrite = vi.spyOn(incoming.cookies, "set");
    const response = await proxy(incoming);
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.getUser).not.toHaveBeenCalled();
    expect(cookieRead).not.toHaveBeenCalled();
    expect(cookieWrite).not.toHaveBeenCalled();
    expect(response.headers.has("set-cookie")).toBe(false);
  });

  it.each(["/workspaces", "/api/integrations/retell-other", "/api/integrations/retell/child", "/api/integrations/other"])("retains configured user/session behavior: %s", async path => {
    expect(matches(path)).toBe(true);
    await proxy(request(path));
    expect(mocks.create).toHaveBeenCalledOnce();
    expect(mocks.getUser).toHaveBeenCalledOnce();
  });

  it.each(["/", "/sign-in", "/forgot-password", "/auth/callback", "/auth/recovery"])("lets public auth entry pages render without hosted auth lookup: %s", async path => {
    expect(matches(path)).toBe(true);
    await proxy(request(path));
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.getUser).not.toHaveBeenCalled();
  });

  it("preserves normal session refresh cookies", async () => {
    mocks.create.mockImplementation((_url, _key, options) => {
      expect(options.cookies.getAll()).toEqual([{ name: "fictional-session", value: "fictional-value" }]);
      options.cookies.setAll([{ name: "fictional-session", value: "fictional-refreshed", options: { httpOnly: true } }]);
      return { auth: { getUser: mocks.getUser } };
    });
    const incoming = request("/workspaces");
    const response = await proxy(incoming);
    expect(incoming.cookies.get("fictional-session")?.value).toBe("fictional-refreshed");
    expect(response.cookies.get("fictional-session")?.value).toBe("fictional-refreshed");
    expect(mocks.getUser).toHaveBeenCalledOnce();
  });

  it.each(["/api/integrations/retell", "/workspaces"])("does not read, lock, consume or change body bytes: %s", async path => {
    const incoming = request(path);
    const body = incoming.body;
    const readers = ["text", "json", "arrayBuffer", "formData", "blob", "clone"] as const;
    const calls = readers.map(name => vi.spyOn(incoming, name));
    const streamRead = vi.spyOn(body!, "getReader");
    await proxy(incoming);
    expect(incoming.body).toBe(body);
    expect(incoming.bodyUsed).toBe(false);
    expect(body?.locked).toBe(false);
    for (const call of calls) expect(call).not.toHaveBeenCalled();
    expect(streamRead).not.toHaveBeenCalled();
    expect(Buffer.from(await incoming.arrayBuffer())).toEqual(Buffer.from(' { "fictional": "café" }\n'));
  });

  it.each(["default-off", "production"])("leaves route fail-closed: %s", async mode => {
    if (mode === "production") {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("RETELL_INGRESS_PROTOTYPE", "enabled");
      vi.stubEnv("RETELL_INGRESS_TEST_SECRET", "fictional-secret");
    }
    const incoming = request("/api/integrations/retell");
    await proxy(incoming);
    const response = await POST(incoming);
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ status: "disabled", persisted: false, bookingCreated: false });
    expect(incoming.bodyUsed).toBe(false);
    expect(mocks.create).not.toHaveBeenCalled();
  });
});

