import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({ getUser: vi.fn(), rpc: vi.fn(), member: vi.fn(), revalidate: vi.fn(), configured: true }));

vi.mock("@/lib/supabase/config", () => ({ isSupabaseConfigured: () => h.configured }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: h.getUser },
    rpc: h.rpc,
    from: () => ({ select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: h.member }) }) }) }),
  }),
}));
vi.mock("next/cache", () => ({ revalidatePath: h.revalidate }));
vi.mock("next/navigation", () => ({ unstable_rethrow: (error: unknown) => { if (error instanceof Error && error.message === "NEXT_CONTROL") throw error; } }));

import { saveOnboardingSettings } from "@/app/actions/onboarding-settings";

const tenant = "48000000-0000-4000-8000-000000000101";
const request = "48000000-0000-4000-8000-000000000102";
const user = "48000000-0000-4000-8000-000000000103";
const preservedContact = { business_contact_name: "Fictional Owner", business_email: "owner@example.test", business_phone: "+15555550101" };
const payload = () => ({ name: "Fictional HVAC", trade: "HVAC", timezone: "America/New_York", ...preservedContact });
const input = () => ({ tenant_id: tenant, request_id: request, expected_config_revision: 2, payload: payload() });
const saved = (revision = 3) => ({ status: "saved", entity: "setup", id: tenant, version: revision, config_revision: revision });

beforeEach(() => {
  vi.resetAllMocks();
  h.configured = true;
  h.getUser.mockResolvedValue({ data: { user: { id: user } }, error: null });
  h.member.mockResolvedValue({ data: { role: "owner" }, error: null });
  h.rpc.mockResolvedValue({ data: saved(), error: null });
});

describe("onboarding settings action", () => {
  it.each(["owner", "admin"])("allows %s through ordinary authenticated onboarding RPC behavior", async role => {
    h.member.mockResolvedValue({ data: { role }, error: null });
    const original = input();
    original.payload.name = "  Fictional HVAC  ";
    original.payload.trade = "\tHVAC\n";

    const result = await saveOnboardingSettings(original);

    expect(result.result).toEqual(saved());
    expect(h.rpc).toHaveBeenCalledWith("onboarding_configure", {
      command: "save_business_profile",
      input: { ...input(), payload: payload() },
    });
    expect(h.revalidate).toHaveBeenCalledWith(`/workspaces/${tenant}`, "layout");
    expect(original.payload.name).toBe("  Fictional HVAC  ");
  });

  it("requires preserved contact values instead of silently clearing them", async () => {
    const missingContact = { ...input(), payload: { name: "Fictional HVAC", trade: "HVAC", timezone: "America/New_York" } };

    const result = await saveOnboardingSettings(missingContact);

    expect(result.result.status).toBe("validation_error");
    expect(h.getUser).not.toHaveBeenCalled();
    expect(h.rpc).not.toHaveBeenCalled();
    expect(h.revalidate).not.toHaveBeenCalled();
  });

  it.each(["dispatcher", "technician", "viewer"])("denies %s before mutation", async role => {
    h.member.mockResolvedValue({ data: { role }, error: null });

    const result = await saveOnboardingSettings(input());

    expect(result.result).toEqual({ status: "unavailable" });
    expect(h.rpc).not.toHaveBeenCalled();
    expect(h.revalidate).not.toHaveBeenCalled();
  });

  it("denies missing or failed identity without leaking details", async () => {
    h.getUser.mockResolvedValue({ data: { user: null }, error: { message: "private auth" } });

    const result = await saveOnboardingSettings(input());

    expect(result.result).toEqual({ status: "unavailable" });
    expect(JSON.stringify(result)).not.toContain("private auth");
    expect(h.rpc).not.toHaveBeenCalled();
  });

  it.each([
    ["name", { ...input(), payload: { ...payload(), name: "" } }],
    ["trade", { ...input(), payload: { ...payload(), trade: "" } }],
    ["timezone", { ...input(), payload: { ...payload(), timezone: "US/Eastern" } }],
    ["unknown field", { ...input(), payload: { ...payload(), office_email: "private@example.test" } }],
    ["revision shape", { ...input(), expected_config_revision: "2" }],
  ])("rejects invalid %s before session or RPC", async (_label, value) => {
    const result = await saveOnboardingSettings(value);

    expect(result.result.status).toBe("validation_error");
    expect(h.getUser).not.toHaveBeenCalled();
    expect(h.rpc).not.toHaveBeenCalled();
    expect(h.revalidate).not.toHaveBeenCalled();
  });

  it.each([
    [{ status: "conflict", reason: "revision" }, "changed"],
    [{ status: "conflict", reason: "request_reuse" }, "already used"],
    [{ status: "conflict", reason: "version_exhausted" }, "cannot accept"],
    [{ status: "unavailable" }, "unavailable"],
    [{ status: "retryable_failure" }, "could not confirm"],
  ])("preserves safe failure %j without refresh", async (data, copy) => {
    h.rpc.mockResolvedValue({ data, error: null });

    const result = await saveOnboardingSettings(input());

    expect(result.result).toEqual(data);
    expect(result.message).toContain(copy);
    expect(h.revalidate).not.toHaveBeenCalled();
  });

  it.each([
    ["current no-op", saved(2)],
    ["same-request replay", { status: "replayed", entity: "setup", id: tenant, version: 3, config_revision: 3 }],
  ])("accepts %s semantics from the locked RPC", async (_label, data) => {
    h.rpc.mockResolvedValue({ data, error: null });

    const result = await saveOnboardingSettings(input());

    expect(result.result).toEqual(data);
    expect(h.revalidate).toHaveBeenCalledWith(`/workspaces/${tenant}`, "layout");
  });

  it.each([
    null,
    { ...saved(), private: "secret" },
    { ...saved(), entity: "resume" },
    { ...saved(), id: "48000000-0000-4000-8000-000000000999" },
    { ...saved(), version: 2 },
  ])("fails closed on corrupt RPC result %j", async data => {
    h.rpc.mockResolvedValue({ data, error: null });

    const result = await saveOnboardingSettings(input());

    expect(result.result).toEqual({ status: "retryable_failure" });
    expect(JSON.stringify(result)).not.toContain("secret");
    expect(h.revalidate).not.toHaveBeenCalled();
  });

  it("preserves the confirmed settings result when workspace refresh fails", async () => {
    h.revalidate.mockImplementation(() => { throw new Error("private refresh"); });

    const result = await saveOnboardingSettings(input());

    expect(result.result).toEqual(saved());
    expect(result.refreshRequired).toBe(true);
    expect(result.message).toContain("confirmed");
  });

  it("preserves framework control flow exceptions", async () => {
    h.getUser.mockRejectedValue(new Error("NEXT_CONTROL"));

    await expect(saveOnboardingSettings(input())).rejects.toThrow("NEXT_CONTROL");
  });

  it("maps Supabase configuration and gateway failures to safe retry semantics", async () => {
    h.configured = false;
    expect((await saveOnboardingSettings(input())).result).toEqual({ status: "retryable_failure" });
    expect(h.rpc).not.toHaveBeenCalled();

    h.configured = true;
    h.rpc.mockResolvedValue({ data: saved(), error: { message: "private SQL" } });
    const response = await saveOnboardingSettings(input());
    expect(response.result).toEqual({ status: "retryable_failure" });
    expect(JSON.stringify(response)).not.toContain("private SQL");
  });
});
