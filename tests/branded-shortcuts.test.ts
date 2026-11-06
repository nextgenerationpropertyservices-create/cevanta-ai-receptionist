import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET, HEAD } from "@/app/links/[[...slug]]/route";
import { proxy } from "@/proxy";

const mocks = vi.hoisted(() => ({ create: vi.fn(), getUser: vi.fn() }));
vi.mock("@supabase/ssr", () => ({ createServerClient: mocks.create }));
const app = "https://cevanta-ai-receptionist.vercel.app";
const call = (slug?: string[], query = "", origin = "https://fictional.invalid") => GET(
  new Request(`${origin}/links${query}`), { params: Promise.resolve({ slug }) },
);

describe("branded public shortcuts", () => {
  it.each([
    [undefined, "https://cevanta.base44.app/"],
    [["freetools"], `${app}/free-tools`],
    [["free-tools"], `${app}/free-tools`],
    [["FreeTools"], `${app}/free-tools`],
    [["checkup"], `${app}/missed-call-checkup`],
    [["missed-call-checkup"], `${app}/missed-call-checkup`],
    [["demo"], `${app}/demo-dashboard`],
    [["demo-dashboard"], `${app}/demo-dashboard`],
    [["dashboard"], `${app}/workspaces`],
    [["pricing"], "https://cevanta.base44.app/pricing"],
    [["how-it-works"], "https://cevanta.base44.app/how-it-works"],
    [["community"], "https://www.facebook.com/groups/2285911738856668/"],
  ])("routes %j without relying on the incoming host", async (slug, target) => {
    const response = await call(slug as string[] | undefined);
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(target);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
    expect(response.headers.has("set-cookie")).toBe(false);
  });

  it.each([["unknown"], ["__proto__"], ["constructor"], ["https://fictional.invalid"], ["demo", "private"], ["workspaces"]])(
    "rejects unknown and arbitrary destinations %j", async (...segments) => {
      const response = await call(segments);
      expect(response.status).toBe(404);
      expect(response.headers.has("location")).toBe(false);
      expect(response.headers.get("cache-control")).toContain("no-store");
    },
  );

  it("forwards bounded campaign labels and drops redirect, identity and duplicate values", async () => {
    const response = await call(["freetools"], "?utm_source=facebook&utm_campaign=helpful-tips&utm_content=a&utm_content=b&utm_medium=email%40example.invalid&next=https://fictional.invalid&token=fictional&email=fictional");
    expect(response.headers.get("location")).toBe(`${app}/free-tools?utm_source=facebook&utm_campaign=helpful-tips`);
    expect((await call(["demo"], `?utm_term=${"x".repeat(101)}`)).headers.get("location")).toBe(`${app}/demo-dashboard`);
  });

  it("HEAD has the same redirect and no body, including errors", async () => {
    for (const slug of [undefined, ["dashboard"], ["unknown"]]) {
      const response = await HEAD(new Request("https://fictional.invalid/links", { method: "HEAD" }), { params: Promise.resolve({ slug }) });
      expect(response.status).toBe(slug?.[0] === "unknown" ? 404 : 302);
      expect(await response.text()).toBe("");
    }
  });
});

describe("shortcut proxy boundary", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://fictional.invalid");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "fictional-publishable-value");
    mocks.create.mockReturnValue({ auth: { getUser: mocks.getUser } });
    mocks.getUser.mockResolvedValue({ data: { user: null } });
  });
  afterEach(() => vi.unstubAllEnvs());

  it.each(["/links", "/links/", "/links/freetools", "/links/unknown"])("never accesses auth for %s", async path => {
    const request = new NextRequest(`https://fictional.invalid${path}`);
    const cookies = vi.spyOn(request.cookies, "getAll");
    const response = await proxy(request);
    expect(mocks.create).not.toHaveBeenCalled();
    expect(cookies).not.toHaveBeenCalled();
    expect(response.headers.has("set-cookie")).toBe(false);
  });

  it.each(["/links-other", "/workspaces", "/workspaces/fictional"])("preserves ordinary session handling for %s", async path => {
    await proxy(new NextRequest(`https://fictional.invalid${path}`));
    expect(mocks.create).toHaveBeenCalledOnce();
    expect(mocks.getUser).toHaveBeenCalledOnce();
  });
});
