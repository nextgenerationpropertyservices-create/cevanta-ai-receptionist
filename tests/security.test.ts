import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { canManageCustomers, canManageSettings, ROLES } from "@/lib/contracts";
import { customerSchema, equipmentSchema, tenantSettingsSchema } from "@/lib/validation";

const harness = vi.hoisted(() => ({
  configured: true,
  user: { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" } as { id: string } | null,
  authError: null as unknown,
  responses: [] as { data: unknown; error: unknown }[],
  calls: [] as { table: string; method: string; args: unknown[] }[],
  revalidate: vi.fn(),
  signIn: vi.fn(),
  signUp: vi.fn(),
  rpc: vi.fn(),
}));
vi.mock("@/lib/supabase/config", () => ({ isSupabaseConfigured: () => harness.configured }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({
  auth: { getUser: async () => ({ data: { user: harness.user }, error: harness.authError }), signInWithPassword: harness.signIn, signUp: harness.signUp },
  rpc: harness.rpc,
  from: (table: string) => {
    const response = harness.responses.shift() ?? { data: null, error: null };
    const chain = Object.fromEntries(["select", "eq", "in", "order", "insert", "update", "single", "maybeSingle"].map(method => [method, (...args: unknown[]) => {
      harness.calls.push({ table, method, args });
      return chain;
    }])) as Record<string, unknown>;
    chain.then = (resolve: (value: unknown) => unknown) => Promise.resolve(response).then(resolve);
    return chain;
  },
}) }));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`REDIRECT:${path}`); }, unstable_rethrow: (error: unknown) => { if (error instanceof Error && error.message.startsWith("REDIRECT:")) throw error; } }));
vi.mock("next/cache", () => ({ revalidatePath: harness.revalidate }));

import { requireMembership, requireUser } from "@/lib/server/authorization";
import { createCustomer, createContact, updateCustomer, updateContact, createEquipment, createServiceLocation, updateServiceLocation, updateEquipment, updateTenantSettings } from "@/app/actions/workspace";
import { getCustomer, getCustomers, getWorkspaces } from "@/lib/server/queries";
import { provisionWorkspace, signIn, signUp } from "@/app/actions/auth";

const tenant = "11111111-1111-4111-8111-111111111111";
const customer = "22222222-2222-4222-8222-222222222222";
const location = "33333333-3333-4333-8333-333333333333";
const idle = { status: "idle", message: "" } as const;
const form = (fields: Record<string, string>) => { const value = new FormData(); Object.entries(fields).forEach(([key, item]) => value.set(key, item)); return value; };
const respond = (...data: unknown[]) => { harness.responses = data.map(value => ({ data: value, error: null })); };
const writes = () => harness.calls.filter(call => ["insert", "update"].includes(call.method));

beforeEach(() => { process.env.APP_ORIGIN = "https://cevanta.example.invalid"; harness.configured = true; harness.user = { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" }; harness.authError = null; harness.responses = []; harness.calls = []; harness.signIn.mockReset(); harness.signUp.mockReset(); harness.rpc.mockReset(); });

describe("permission and input boundaries", () => {
  it.each(ROLES)("restricts %s according to office/settings capabilities", role => {
    expect(canManageCustomers(role)).toBe(["owner", "admin", "dispatcher"].includes(role));
    expect(canManageSettings(role)).toBe(["owner", "admin"].includes(role));
  });
  it("rejects blank, malformed, excessive and invalid timezone input", () => {
    expect(customerSchema.safeParse({ name: "   " }).success).toBe(false);
    expect(customerSchema.safeParse({ name: "Demo", email: "invalid" }).success).toBe(false);
    expect(customerSchema.safeParse({ name: "Demo", notes: "x".repeat(4001) }).success).toBe(false);
    expect(equipmentSchema.safeParse({ name: "Unit", type: "" }).success).toBe(false);
    expect(tenantSettingsSchema.safeParse({ name: "Demo", trade: "HVAC", timezone: "Mars/Unknown" }).success).toBe(false);
  });
  it("strips attempted tenant/privilege injection from validated data", () => {
    expect(customerSchema.parse({ name: " Demo ", tenant_id: "hostile", role: "owner" })).toEqual({ name: "Demo", email: null, phone: null, notes: null });
  });
});

describe("actual server authorization", () => {
  it("redirects anonymous requests before database reads", async () => { harness.user = null; await expect(requireUser()).rejects.toThrow("REDIRECT:/sign-in"); expect(harness.calls).toEqual([]); });
  it("fails closed when verified-user lookup fails", async () => { harness.authError = { message: "down" }; await expect(requireUser()).rejects.toThrow("REDIRECT:/sign-in"); });
  it("redirects missing configuration to setup", async () => { harness.configured = false; await expect(requireUser()).rejects.toThrow("REDIRECT:/setup"); });
  it("rejects malformed tenant IDs before contacting the database", async () => { await expect(requireMembership("bad")).rejects.toThrow(); expect(harness.calls).toEqual([]); });
  it.each([null, { role: "root" }, { role: "viewer" }])("rejects absent/unknown/disallowed membership %j", async membership => { respond(membership); await expect(requireMembership(tenant, ["owner"])).rejects.toThrow("permission"); });
  it("checks membership against both verified user and requested tenant", async () => {
    respond({ role: "owner" }); await requireMembership(tenant);
    expect(harness.calls).toContainEqual({ table: "memberships", method: "eq", args: ["tenant_id", tenant] });
    expect(harness.calls).toContainEqual({ table: "memberships", method: "eq", args: ["user_id", harness.user!.id] });
  });
});

describe("actual sign-in failure handling", () => {
  const credentials = () => form({ email: "qa@example.invalid", password: "synthetic-test-input" });
  const genericMessage = "Unable to sign in. Check your email and password.";
  let warning: ReturnType<typeof vi.spyOn>;
  beforeEach(() => { warning = vi.spyOn(console, "warn").mockImplementation(() => {}); });
  afterEach(() => { warning.mockRestore(); });
  it("rejects invalid input before contacting Auth", async () => {
    expect((await signIn(idle, form({ email: "invalid", password: "" }))).status).toBe("error");
    expect(harness.signIn).not.toHaveBeenCalled();
    expect(warning).not.toHaveBeenCalled();
  });
  it("rejects missing configuration without contacting Auth or logging inputs", async () => {
    harness.configured = false;
    expect((await signIn(idle, credentials())).message).toContain("Supabase setup");
    expect(harness.signIn).not.toHaveBeenCalled();
    expect(warning).not.toHaveBeenCalled();
  });
  it("keeps rejected credentials generic and logs only allowlisted metadata", async () => {
    harness.signIn.mockResolvedValueOnce({ error: { code: "invalid_credentials", status: 400, message: "synthetic-provider-detail", email: "qa@example.invalid", session: "synthetic-session-marker" } });
    expect(await signIn(idle, credentials())).toEqual({ status: "error", message: genericMessage });
    expect(warning.mock.calls).toEqual([["[auth.signIn]", { category: "invalid_credentials", status: 400 }]]);
  });
  it.each([
    ["email_not_confirmed", 400, "email_not_confirmed", "Confirm your email before signing in. Ask your administrator to check your account confirmation."],
    ["over_request_rate_limit", 429, "rate_limited", "Too many sign-in attempts. Wait a few minutes before trying again."],
    ["over_email_send_rate_limit", 429, "rate_limited", "Too many sign-in attempts. Wait a few minutes before trying again."],
    ["email_provider_disabled", 400, "email_provider_disabled", "Email sign-in is unavailable. Ask your administrator to check the authentication settings."],
    ["request_timeout", 408, "unavailable", "Sign-in is temporarily unavailable. Please try again."],
    ["synthetic-unknown-code", 503, "unavailable", "Sign-in is temporarily unavailable. Please try again."],
    ["synthetic-unknown-code", 429, "rate_limited", "Too many sign-in attempts. Wait a few minutes before trying again."],
  ])("classifies %s / %s without leaking provider contents", async (code, status, category, message) => {
    harness.signIn.mockResolvedValueOnce({ error: { code, status, message: "synthetic-provider-detail", email: "qa@example.invalid" } });
    expect(await signIn(idle, credentials())).toEqual({ status: "error", message });
    expect(warning.mock.calls).toEqual([["[auth.signIn]", { category, status }]]);
  });
  it.each([undefined, "429 synthetic-status-marker", 399, 600, 400.5, NaN, Infinity])("discards malformed or nonerror HTTP status %s and arbitrary codes", async status => {
    harness.signIn.mockResolvedValueOnce({ error: { code: "synthetic-private-code", status, message: "synthetic-provider-detail" } });
    expect(await signIn(idle, credentials())).toEqual({ status: "error", message: genericMessage });
    expect(warning.mock.calls).toEqual([["[auth.signIn]", { category: "unknown" }]]);
  });
  it("retains an unknown error's safe numeric status without retaining its code", async () => {
    harness.signIn.mockResolvedValueOnce({ error: { code: "synthetic-private-code", status: 401 } });
    expect((await signIn(idle, credentials())).message).toBe(genericMessage);
    expect(warning.mock.calls).toEqual([["[auth.signIn]", { category: "unknown", status: 401 }]]);
  });
  it("does not log or expose a primitive provider failure", async () => {
    harness.signIn.mockResolvedValueOnce({ error: "synthetic-provider-detail" });
    expect((await signIn(idle, credentials())).message).toBe(genericMessage);
    expect(warning.mock.calls).toEqual([["[auth.signIn]", { category: "unknown" }]]);
  });
  it("handles unavailable Auth without an unhandled rejection", async () => {
    harness.signIn.mockRejectedValueOnce(new Error("network failure"));
    expect((await signIn(idle, form({ email: "qa@example.invalid", password: "synthetic-test-input" }))).message).toContain("temporarily unavailable");
    expect(warning.mock.calls).toEqual([["[auth.signIn]", { category: "unavailable" }]]);
  });
  it("redirects to workspace selection after successful authentication", async () => {
    harness.signIn.mockResolvedValueOnce({ error: null });
    await expect(signIn(idle, form({ email: "qa@example.invalid", password: "synthetic-test-input" }))).rejects.toThrow("REDIRECT:/workspaces");
    expect(warning).not.toHaveBeenCalled();
  });
});

describe("self-service account and workspace provisioning", () => {
  const signupForm = (overrides: Record<string, string> = {}) => form({ email: "owner@example.invalid", password: "synthetic-password", confirmPassword: "synthetic-password", ...overrides });
  const workspaceForm = (overrides: Record<string, string> = {}) => form({
    request_id: "66666666-6666-4666-8666-666666666666",
    name: "Fictional HVAC Co",
    trade: "HVAC",
    timezone: "America/New_York",
    ...overrides,
  });
  let warning: ReturnType<typeof vi.spyOn>;
  beforeEach(() => { warning = vi.spyOn(console, "warn").mockImplementation(() => {}); });
  afterEach(() => { warning.mockRestore(); });

  it("rejects signup password mismatch before contacting Auth", async () => {
    const result = await signUp(idle, signupForm({ confirmPassword: "different-password" }));
    expect(result.status).toBe("error");
    expect(harness.signUp).not.toHaveBeenCalled();
    expect(warning).not.toHaveBeenCalled();
  });
  it("rejects missing signup configuration without contacting Auth", async () => {
    harness.configured = false;
    expect((await signUp(idle, signupForm())).message).toContain("Supabase setup");
    expect(harness.signUp).not.toHaveBeenCalled();
  });
  it("requests Supabase signup with only email, password and the configured callback", async () => {
    harness.signUp.mockResolvedValueOnce({ error: null });
    const result = await signUp(idle, signupForm({ extra_role: "owner" }));
    expect(result.status).toBe("success");
    expect(harness.signUp).toHaveBeenCalledWith({
      email: "owner@example.invalid",
      password: "synthetic-password",
      options: { emailRedirectTo: "https://cevanta.example.invalid/auth/callback" },
    });
    expect(warning).not.toHaveBeenCalled();
  });
  it.each([
    ["user_already_exists", 400, "existing_account", "If that email already has an account, sign in or use password reset."],
    ["over_email_send_rate_limit", 429, "rate_limited", "Too many signup attempts. Wait a few minutes before trying again."],
    ["email_provider_disabled", 400, "auth_unavailable", "New account signup is unavailable. Check the authentication settings before selling self-service access."],
    ["request_timeout", 408, "unavailable", "Signup is temporarily unavailable. Please try again."],
  ])("keeps signup provider failure %s safe", async (code, status, category, message) => {
    harness.signUp.mockResolvedValueOnce({ error: { code, status, message: "synthetic-provider-detail", email: "owner@example.invalid" } });
    expect(await signUp(idle, signupForm())).toEqual({ status: "error", message });
    expect(warning.mock.calls).toEqual([["[auth.signUp]", { category, status }]]);
  });
  it("rejects invalid workspace details before Auth and RPC calls", async () => {
    const result = await provisionWorkspace(idle, workspaceForm({ request_id: "bad", name: " " }));
    expect(result.status).toBe("error");
    expect(harness.rpc).not.toHaveBeenCalled();
  });
  it("requires a signed-in user before provisioning", async () => {
    harness.user = null;
    const result = await provisionWorkspace(idle, workspaceForm());
    expect(result.message).toContain("Sign in");
    expect(harness.rpc).not.toHaveBeenCalled();
  });
  it("calls the provisioning RPC with normalized business input only", async () => {
    const workspaceId = "77777777-7777-4777-8777-777777777777";
    harness.rpc.mockResolvedValueOnce({ data: { status: "saved", workspace: { id: workspaceId, name: "Fictional HVAC Co", trade: "HVAC", timezone: "America/New_York" } }, error: null });
    await expect(provisionWorkspace(idle, workspaceForm({ role: "owner", tenant_id: "hostile" }))).rejects.toThrow(`REDIRECT:/workspaces/${workspaceId}/onboarding`);
    expect(harness.rpc).toHaveBeenCalledWith("provision_owner_workspace", {
      input: {
        request_id: "66666666-6666-4666-8666-666666666666",
        name: "Fictional HVAC Co",
        trade: "HVAC",
        timezone: "America/New_York",
      },
    });
  });
  it.each([
    [{ status: "validation_error", issues: [{ path: "timezone", message: "invalid" }] }, "Fix the workspace details"],
    [{ status: "conflict", reason: "request_reuse" }, "already used"],
    [{ status: "unavailable" }, "confirmed account"],
    [{ status: "retryable_failure" }, "temporarily unavailable"],
  ])("maps provisioning response %j to a safe message", async (data, message) => {
    harness.rpc.mockResolvedValueOnce({ data, error: null });
    const result = await provisionWorkspace(idle, workspaceForm());
    expect(result.status).toBe("error");
    expect(result.message).toContain(message);
  });
  it("handles provisioning RPC failures without leaking provider details", async () => {
    harness.rpc.mockResolvedValueOnce({ data: null, error: { message: "synthetic-private-detail" } });
    const result = await provisionWorkspace(idle, workspaceForm());
    expect(result.status).toBe("error");
    expect(result.message).not.toContain("synthetic-private-detail");
    expect(warning.mock.calls).toEqual([["[workspace.provision]", { category: "rpc_error" }]]);
  });
});

describe("actual protected mutations", () => {
  it.each(["technician", "viewer"])("blocks %s from customer creation", async role => { respond({ role }); expect((await createCustomer(idle, form({ tenantId: tenant, name: "Demo" }))).status).toBe("error"); expect(writes()).toEqual([]); });
  it.each(["owner", "admin", "dispatcher", "technician", "viewer"])("blocks legacy settings writes for %s without database mutation", async role => {
    respond({ role }, { id: tenant });
    const result = await updateTenantSettings(idle, form({ tenantId: tenant, name: "Demo", trade: "HVAC", timezone: "UTC" }));
    expect(result).toEqual({ status: "error", message: "Workspace settings now save through the reviewed Setup/Settings path. Refresh Settings and save from the current form." });
    expect(harness.calls).toEqual([]);
    expect(writes()).toEqual([]);
    expect(harness.revalidate).not.toHaveBeenCalled();
  });
  it("preserves anonymous redirects through the server action", async () => { harness.user = null; await expect(createCustomer(idle, form({ tenantId: tenant, name: "Demo" }))).rejects.toThrow("REDIRECT:/sign-in"); });
  it("does not write invalid fields", async () => { respond({ role: "owner" }); expect((await createCustomer(idle, form({ tenantId: tenant, name: " " }))).status).toBe("error"); expect(writes()).toEqual([]); });
  it("rejects a customer invisible in the requested tenant", async () => {
    respond({ role: "owner" }, null);
    expect((await createServiceLocation(idle, form({ tenantId: tenant, customerId: customer, label: "Demo", address_line1: "100 Example St", city: "Demo", state: "NY", postal_code: "00000" }))).status).toBe("error");
    expect(writes()).toEqual([]);
    expect(harness.calls).toContainEqual({ table: "customers", method: "eq", args: ["tenant_id", tenant] });
  });
  it("rejects equipment attached to a different customer's location", async () => {
    respond({ role: "owner" }, { id: customer }, null);
    expect((await createEquipment(idle, form({ tenantId: tenant, customerId: customer, locationId: location, name: "Demo unit", type: "Heat pump" }))).status).toBe("error");
    expect(writes()).toEqual([]);
    expect(harness.calls).toContainEqual({ table: "service_locations", method: "eq", args: ["customer_id", customer] });
    expect(harness.calls).toContainEqual({ table: "service_locations", method: "eq", args: ["tenant_id", tenant] });
  });
  it("rejects hostile contact parent IDs without writing", async () => {
    respond({ role: "admin" }, null);
    expect((await createContact(idle, form({ tenantId: tenant, customerId: customer, name: "Fictional contact" }))).status).toBe("error");
    expect(writes()).toEqual([]);
  });
  it("creates equipment only after verifying customer and location parent chains", async () => {
    respond({ role: "admin" }, { id: customer }, { id: location }, { id: "asset" });
    expect((await createEquipment(idle, form({ tenantId: tenant, customerId: customer, locationId: location, name: "Demo unit", type: "Heat pump" }))).status).toBe("success");
    expect(writes()[0]?.args).toEqual([{ name: "Demo unit", type: "Heat pump", manufacturer: null, model: null, serial_number: null, tenant_id: tenant, service_location_id: location }]);
  });
  it("does not expose a tenant update path for legacy settings callers", async () => {
    const result = await updateTenantSettings(idle, form({ tenantId: tenant, name: "Fictional business", trade: "HVAC", timezone: "UTC" }));
    expect(result.status).toBe("error");
    expect(result.message).toContain("Setup/Settings");
    expect(harness.calls.some(call => call.table === "tenants")).toBe(false);
    expect(writes()).toEqual([]);
  });
  it("returns generic failures without database error details or cache invalidation", async () => {
    harness.responses = [{ data: { role: "owner" }, error: null }, { data: null, error: { message: "sensitive internal detail" } }];
    const result = await createCustomer(idle, form({ tenantId: tenant, name: "Demo" }));
    expect(result.status).toBe("error"); expect(result.message).not.toContain("sensitive"); expect(harness.revalidate).not.toHaveBeenCalled();
  });
  it("writes trusted tenant identity and invalidates only after success", async () => {
    respond({ role: "dispatcher" }, { id: customer });
    expect((await createCustomer(idle, form({ tenantId: tenant, tenant_id: "hostile", name: "Demo" }))).status).toBe("success");
    expect(writes()[0]?.args).toEqual([{ name: "Demo", email: null, phone: null, notes: null, tenant_id: tenant }]);
    expect(harness.revalidate).toHaveBeenCalledWith(`/workspaces/${tenant}`, "layout");
  });
});

describe("actual service location updates", () => {
  const locationForm = (overrides: Record<string, string> = {}) => form({ tenantId: tenant, customerId: customer, locationId: location, label: "Demo updated site", address_line1: "101 Example St", city: "Demo", state: "NY", postal_code: "00000", ...overrides });
  it("preserves anonymous redirects before reads or writes", async () => {
    harness.user = null;
    await expect(updateServiceLocation(idle, locationForm())).rejects.toThrow("REDIRECT:/sign-in");
    expect(harness.calls).toEqual([]);
    expect(harness.revalidate).not.toHaveBeenCalled();
  });
  it.each(["technician", "viewer", "root", null])("denies updates for membership %s", async role => {
    respond(role === null ? null : { role });
    expect((await updateServiceLocation(idle, locationForm())).status).toBe("error");
    expect(writes()).toEqual([]);
    expect(harness.calls.every(call => call.table === "memberships")).toBe(true);
    expect(harness.revalidate).not.toHaveBeenCalled();
  });
  it.each(["tenantId", "customerId", "locationId"])("rejects malformed %s before parent queries", async field => {
    respond({ role: "owner" });
    expect((await updateServiceLocation(idle, locationForm({ [field]: "invalid" }))).status).toBe("error");
    expect(writes()).toEqual([]);
    expect(harness.calls.every(call => call.table === "memberships")).toBe(true);
  });
  it.each(["tenantId", "customerId", "locationId"])("rejects missing %s without mutation", async field => {
    respond({ role: "owner" });
    const input = locationForm(); input.delete(field);
    expect((await updateServiceLocation(idle, input)).status).toBe("error");
    expect(writes()).toEqual([]);
    expect(harness.revalidate).not.toHaveBeenCalled();
  });
  it("fails closed on verified-user failure", async () => {
    harness.authError = { message: "synthetic-auth-failure" };
    await expect(updateServiceLocation(idle, locationForm())).rejects.toThrow("REDIRECT:/sign-in");
    expect(harness.calls).toEqual([]);
    expect(harness.revalidate).not.toHaveBeenCalled();
  });
  it("fails closed on membership query failure", async () => {
    harness.responses = [{ data: { role: "owner" }, error: { message: "synthetic-membership-failure" } }];
    expect((await updateServiceLocation(idle, locationForm())).status).toBe("error");
    expect(writes()).toEqual([]);
    expect(harness.calls.every(call => call.table === "memberships")).toBe(true);
  });
  it("rejects invalid business fields before parent reads or writes", async () => {
    respond({ role: "owner" });
    expect((await updateServiceLocation(idle, locationForm({ label: " " }))).status).toBe("error");
    expect(writes()).toEqual([]);
    expect(harness.calls.every(call => call.table === "memberships")).toBe(true);
  });
  it("rejects a customer not visible in the requested tenant", async () => {
    respond({ role: "owner" }, null);
    expect((await updateServiceLocation(idle, locationForm())).status).toBe("error");
    expect(writes()).toEqual([]);
    expect(harness.calls).toContainEqual({ table: "customers", method: "eq", args: ["tenant_id", tenant] });
    expect(harness.calls).toContainEqual({ table: "customers", method: "eq", args: ["id", customer] });
    expect(harness.calls.some(call => call.table === "service_locations")).toBe(false);
  });
  it("rejects a location invisible under the requested tenant and customer", async () => {
    respond({ role: "owner" }, { id: customer }, null);
    expect((await updateServiceLocation(idle, locationForm())).status).toBe("error");
    expect(writes()).toEqual([]);
    for (const [field, value] of [["tenant_id", tenant], ["customer_id", customer], ["id", location]]) {
      expect(harness.calls).toContainEqual({ table: "service_locations", method: "eq", args: [field, value] });
    }
    expect(harness.revalidate).not.toHaveBeenCalled();
  });
  it.each(["owner", "admin", "dispatcher"])("allows %s business updates with immutable identities and scoped write", async role => {
    respond({ role }, { id: customer }, { id: location }, { id: location });
    expect((await updateServiceLocation(idle, locationForm({ tenant_id: "hostile", customer_id: "hostile", id: "hostile", created_at: "hostile" }))).status).toBe("success");
    expect(writes()).toEqual([{ table: "service_locations", method: "update", args: [{ label: "Demo updated site", address_line1: "101 Example St", city: "Demo", state: "NY", postal_code: "00000" }] }]);
    const updateIndex = harness.calls.findIndex(call => call.method === "update");
    expect(harness.calls.slice(updateIndex + 1)).toEqual([
      { table: "service_locations", method: "eq", args: ["tenant_id", tenant] },
      { table: "service_locations", method: "eq", args: ["customer_id", customer] },
      { table: "service_locations", method: "eq", args: ["id", location] },
      { table: "service_locations", method: "select", args: ["id"] },
      { table: "service_locations", method: "single", args: [] },
    ]);
    expect(harness.revalidate).toHaveBeenCalledExactlyOnceWith(`/workspaces/${tenant}/customers/${customer}`);
  });
  it.each(["customer", "location", "update", "disappeared"])("fails safely when %s fails, without refreshing", async stage => {
    const failure = { data: null, error: { message: "synthetic-internal-marker" } };
    harness.responses = [
      { data: { role: "owner" }, error: null },
      stage === "customer" ? failure : { data: { id: customer }, error: null },
      stage === "location" ? failure : { data: { id: location }, error: null },
      stage === "disappeared" ? { data: null, error: null } : failure,
    ];
    const result = await updateServiceLocation(idle, locationForm());
    expect(result.status).toBe("error");
    expect(result.message).not.toContain("synthetic-internal-marker");
    expect(harness.revalidate).not.toHaveBeenCalled();
    if (stage === "customer" || stage === "location") expect(writes()).toEqual([]);
  });
});

describe("actual equipment updates", () => {
  const asset = "44444444-4444-4444-8444-444444444444";
  const assetForm = (overrides: Record<string, string> = {}) => form({ tenantId: tenant, customerId: customer, locationId: location, equipmentId: asset, name: "Demo unit", type: "Heat pump", manufacturer: "Fictional manufacturer", model: "Demo model", serial_number: "SYNTHETIC-ONLY", ...overrides });
  it.each(["anonymous", "lookup failure"])("preserves sign-in redirect on %s before database work", async state => {
    if (state === "anonymous") harness.user = null; else harness.authError = { message: "synthetic-auth-error" };
    await expect(updateEquipment(idle, assetForm())).rejects.toThrow("REDIRECT:/sign-in");
    expect(harness.calls).toEqual([]); expect(harness.revalidate).not.toHaveBeenCalled();
  });
  it.each(["technician", "viewer", "root", null])("denies equipment edits for membership %s", async role => {
    respond(role === null ? null : { role });
    expect((await updateEquipment(idle, assetForm())).status).toBe("error");
    expect(writes()).toEqual([]); expect(harness.calls.every(call => call.table === "memberships")).toBe(true);
    expect(harness.revalidate).not.toHaveBeenCalled();
  });
  it("fails closed on membership query failure", async () => {
    harness.responses = [{ data: { role: "owner" }, error: { message: "synthetic-provider-marker" } }];
    const result = await updateEquipment(idle, assetForm());
    expect(result.status).toBe("error"); expect(result.message).not.toContain("synthetic-provider-marker");
    expect(writes()).toEqual([]); expect(harness.revalidate).not.toHaveBeenCalled();
  });
  it.each(["tenantId", "customerId", "locationId", "equipmentId"])("rejects malformed and missing %s without parent reads or writes", async field => {
    for (const missing of [false, true]) {
      respond({ role: "owner" }); harness.calls = [];
      const input = assetForm({ [field]: "invalid" }); if (missing) input.delete(field);
      expect((await updateEquipment(idle, input)).status).toBe("error");
      expect(writes()).toEqual([]); expect(harness.calls.every(call => call.table === "memberships")).toBe(true);
      expect(harness.revalidate).not.toHaveBeenCalled();
    }
  });
  it.each<Record<string, string>>([{ name: " " }, { type: "" }, { model: "x".repeat(101) }, { serial_number: "x".repeat(101) }])("rejects invalid business fields %j without writes", async fields => {
    respond({ role: "owner" });
    expect((await updateEquipment(idle, assetForm(fields))).status).toBe("error");
    expect(writes()).toEqual([]); expect(harness.calls.every(call => call.table === "memberships")).toBe(true);
  });
  it.each(["customer", "location", "equipment"])("rejects invisible or cross-parent %s", async stage => {
    respond({ role: "owner" }, stage === "customer" ? null : { id: customer }, stage === "location" ? null : { id: location }, null);
    expect((await updateEquipment(idle, assetForm())).status).toBe("error");
    expect(writes()).toEqual([]); expect(harness.revalidate).not.toHaveBeenCalled();
    expect(harness.calls).toContainEqual({ table: "customers", method: "eq", args: ["tenant_id", tenant] });
    expect(harness.calls).toContainEqual({ table: "customers", method: "eq", args: ["id", customer] });
    if (stage !== "customer") for (const [field, value] of [["tenant_id", tenant], ["customer_id", customer], ["id", location]]) {
      expect(harness.calls).toContainEqual({ table: "service_locations", method: "eq", args: [field, value] });
    }
    if (stage === "equipment") for (const [field, value] of [["tenant_id", tenant], ["service_location_id", location], ["id", asset]]) {
      expect(harness.calls).toContainEqual({ table: "equipment", method: "eq", args: [field, value] });
    }
  });
  it.each(["owner", "admin", "dispatcher"])("allows %s updates using only business fields and immutable scoped identities", async role => {
    respond({ role }, { id: customer }, { id: location }, { id: asset }, { id: asset });
    expect((await updateEquipment(idle, assetForm({ tenant_id: "hostile", service_location_id: "hostile", id: "hostile", created_at: "hostile", customer_id: "hostile" }))).status).toBe("success");
    expect(writes()).toEqual([{ table: "equipment", method: "update", args: [{ name: "Demo unit", type: "Heat pump", manufacturer: "Fictional manufacturer", model: "Demo model", serial_number: "SYNTHETIC-ONLY" }] }]);
    const updateIndex = harness.calls.findIndex(call => call.method === "update");
    expect(harness.calls.slice(updateIndex + 1)).toEqual([
      { table: "equipment", method: "eq", args: ["tenant_id", tenant] },
      { table: "equipment", method: "eq", args: ["service_location_id", location] },
      { table: "equipment", method: "eq", args: ["id", asset] },
      { table: "equipment", method: "select", args: ["id"] },
      { table: "equipment", method: "single", args: [] },
    ]);
    expect(harness.revalidate).toHaveBeenCalledExactlyOnceWith(`/workspaces/${tenant}/customers/${customer}`);
  });
  it.each(["customer", "location", "equipment", "update", "disappeared"])("fails safely on %s error without refreshing", async stage => {
    const failure = { data: null, error: { message: "synthetic-provider-marker" } };
    harness.responses = [{ data: { role: "owner" }, error: null },
      stage === "customer" ? failure : { data: { id: customer }, error: null },
      stage === "location" ? failure : { data: { id: location }, error: null },
      stage === "equipment" ? failure : { data: { id: asset }, error: null },
      stage === "disappeared" ? { data: null, error: null } : failure];
    const result = await updateEquipment(idle, assetForm());
    expect(result.status).toBe("error"); expect(result.message).not.toContain("synthetic-provider-marker");
    expect(harness.revalidate).not.toHaveBeenCalled();
    if (!["update", "disappeared"].includes(stage)) expect(writes()).toEqual([]);
  });
});

describe("actual protected reads", () => {
  it("returns no workspaces for a user without membership", async () => { respond([]); expect(await getWorkspaces()).toEqual([]); expect(harness.calls.every(call => call.table === "memberships")).toBe(true); });
  it("fails closed on membership-query failure", async () => { harness.responses = [{ data: null, error: { message: "failure" } }]; await expect(getWorkspaces()).rejects.toThrow("load workspaces"); });
  it("does not query customer data for a nonmember", async () => { respond(null); await expect(getCustomers(tenant)).rejects.toThrow("permission"); expect(harness.calls.every(call => call.table === "memberships")).toBe(true); });
  it("treats a hostile or absent customer ID as unavailable", async () => { respond({ role: "viewer" }, null); expect(await getCustomer(tenant, customer)).toBeNull(); expect(harness.calls).toContainEqual({ table: "customers", method: "eq", args: ["tenant_id", tenant] }); expect(harness.calls.some(call => call.table === "equipment")).toBe(false); });
  it("propagates database failures instead of showing a misleading empty list", async () => { harness.responses = [{ data: { role: "viewer" }, error: null }, { data: null, error: { message: "failure" } }]; await expect(getCustomers(tenant)).rejects.toThrow("load customers"); });
  it("loads nested equipment using only locations returned for the requested customer", async () => {
    respond({ role: "technician" }, { id: customer }, [], [{ id: location }], []);
    expect((await getCustomer(tenant, customer))?.equipment).toEqual([]);
    for (const table of ["customers", "contacts", "service_locations", "equipment"]) {
      expect(harness.calls).toContainEqual({ table, method: "eq", args: ["tenant_id", tenant] });
    }
    expect(harness.calls).toContainEqual({ table: "equipment", method: "in", args: ["service_location_id", [location]] });
  });
});

describe("customer and contact editing",()=>{
 const contact="55555555-5555-4555-8555-555555555555";
 const input=(overrides:Record<string,string>={})=>form({tenantId:tenant,customerId:customer,contactId:contact,name:"Synthetic edit",email:"synthetic@example.invalid",phone:"",notes:"Synthetic note",job_title:"Synthetic title",...overrides});
 for(const [kind,action] of [["customer",updateCustomer],["contact",updateContact]] as const){
  it.each(["anonymous","auth error"])("preserves "+kind+" redirect on %s",async state=>{if(state==="anonymous")harness.user=null;else harness.authError={message:"synthetic-provider-detail"};await expect(action(idle,input())).rejects.toThrow("REDIRECT:/sign-in");expect(harness.calls).toEqual([]);});
  it(kind+" preserves setup redirect",async()=>{harness.configured=false;await expect(action(idle,input())).rejects.toThrow("REDIRECT:/setup");expect(harness.calls).toEqual([]);});
  it.each(["technician","viewer","root",null])("denies "+kind+" edits for %s",async role=>{respond(role?{role}:null);expect((await action(idle,input())).status).toBe("error");expect(writes()).toEqual([]);expect(harness.calls.every(call=>call.table==="memberships")).toBe(true);});
  it(kind+" fails closed on membership errors",async()=>{harness.responses=[{data:{role:"owner"},error:{message:"synthetic-provider-detail"}}];expect((await action(idle,input())).status).toBe("error");expect(writes()).toEqual([]);});
  it.each(kind==="contact"?["tenantId","customerId","contactId"]:["tenantId","customerId"])("rejects malformed/missing "+kind+" %s",async field=>{for(const missing of[false,true]){respond({role:"owner"});harness.calls=[];const value=input({[field]:"bad"});if(missing)value.delete(field);expect((await action(idle,value)).status).toBe("error");expect(writes()).toEqual([]);expect(harness.calls.every(call=>call.table==="memberships")).toBe(true);}});
  it.each<Record<string,string>>([{name:" "},{email:"invalid"},{name:"x".repeat(161)}])("rejects invalid "+kind+" business fields %j",async fields=>{respond({role:"owner"});expect((await action(idle,input(fields))).status).toBe("error");expect(writes()).toEqual([]);expect(harness.calls.every(call=>call.table==="memberships")).toBe(true);});
  it(kind+" rejects invisible tenant customer before write",async()=>{respond({role:"owner"},null);expect((await action(idle,input())).status).toBe("error");expect(writes()).toEqual([]);expect(harness.calls).toContainEqual({table:"customers",method:"eq",args:["tenant_id",tenant]});expect(harness.calls).toContainEqual({table:"customers",method:"eq",args:["id",customer]});});
  it.each(["owner","admin","dispatcher"])("allows %s "+kind+" edits with immutable identity",async role=>{
   respond({role},{id:customer},{id:contact},{id:contact});expect((await action(idle,input({id:"hostile",tenant_id:"hostile",customer_id:"hostile",created_at:"hostile",role:"owner"}))).status).toBe("success");
   expect(writes()).toEqual([{table:kind==="contact"?"contacts":"customers",method:"update",args:[kind==="contact"?{name:"Synthetic edit",email:"synthetic@example.invalid",phone:null,job_title:"Synthetic title"}:{name:"Synthetic edit",email:"synthetic@example.invalid",phone:null,notes:"Synthetic note"}]}]);
   const after=harness.calls.slice(harness.calls.findIndex(call=>call.method==="update")+1);
   expect(after).toContainEqual({table:kind==="contact"?"contacts":"customers",method:"eq",args:["tenant_id",tenant]});
   expect(after).toContainEqual({table:kind==="contact"?"contacts":"customers",method:"eq",args:["id",kind==="contact"?contact:customer]});
   if(kind==="contact")expect(after).toContainEqual({table:"contacts",method:"eq",args:["customer_id",customer]});
   expect(harness.revalidate).toHaveBeenCalledWith(`/workspaces/${tenant}/customers/${customer}`);expect(harness.revalidate).toHaveBeenCalledWith(`/workspaces/${tenant}/customers`);
  });
  it.each(["parent error","write error","disappeared"])("returns safe "+kind+" %s without refresh",async stage=>{
   const failure={data:null,error:{message:"synthetic-provider-detail"}};
   harness.responses=[{data:{role:"owner"},error:null},stage==="parent error"?failure:{data:{id:customer},error:null},...(kind==="contact"?[{data:{id:contact},error:null}]:[]),stage==="disappeared"?{data:null,error:null}:failure];
   const result=await action(idle,input());expect(result.status).toBe("error");expect(result.message).not.toContain("synthetic-provider-detail");expect(harness.revalidate).not.toHaveBeenCalled();
  });
 }
 it("rejects absent or wrong-customer contact using full chain",async()=>{respond({role:"owner"},{id:customer},null);expect((await updateContact(idle,input())).status).toBe("error");expect(writes()).toEqual([]);for(const[field,value]of[["tenant_id",tenant],["customer_id",customer],["id",contact]])expect(harness.calls).toContainEqual({table:"contacts",method:"eq",args:[field,value]});});
 it("creates contact with trusted parent and business fields",async()=>{respond({role:"dispatcher"},{id:customer},{id:contact});expect((await createContact(idle,input({tenant_id:"hostile",customer_id:"hostile"}))).status).toBe("success");expect(writes()).toEqual([{table:"contacts",method:"insert",args:[{name:"Synthetic edit",email:"synthetic@example.invalid",phone:null,job_title:"Synthetic title",tenant_id:tenant,customer_id:customer}]}]);});
});
