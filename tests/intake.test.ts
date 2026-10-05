import { beforeEach, describe, expect, it, vi } from "vitest";
const harness = vi.hoisted(() => ({
  configured: true, user: { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" } as { id: string } | null,
  authError: null as unknown, responses: [] as { data: unknown; error: unknown }[],
  calls: [] as { table: string; method: string; args: unknown[] }[], revalidate: vi.fn(),
}));
vi.mock("@/lib/supabase/config", () => ({ isSupabaseConfigured: () => harness.configured }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({
  auth: { getUser: async () => ({ data: { user: harness.user }, error: harness.authError }) },
  from: (table: string) => {
    const response = harness.responses.shift() ?? { data: null, error: null };
    const chain = Object.fromEntries(["select", "eq", "order", "insert", "update", "single", "maybeSingle"].map(method => [method, (...args: unknown[]) => {
      harness.calls.push({ table, method, args }); return chain;
    }])) as Record<string, unknown>;
    chain.then = (resolve: (value: unknown) => unknown) => Promise.resolve(response).then(resolve);
    return chain;
  },
}) }));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`REDIRECT:${path}`); }, unstable_rethrow: (error: unknown) => { if (error instanceof Error && error.message.startsWith("REDIRECT:")) throw error; } }));
vi.mock("next/cache", () => ({ revalidatePath: harness.revalidate }));
import { createLead, updateLead } from "@/app/actions/intake";
import { getLead, getLeads } from "@/lib/server/intake-queries";
import { leadSchema } from "@/lib/intake-validation";

const tenant = "11111111-1111-4111-8111-111111111111";
const lead = "22222222-2222-4222-8222-222222222222";
const submission = "33333333-3333-4333-8333-333333333333";
const customer = "44444444-4444-4444-8444-444444444444";
const idle = { status: "idle", message: "" } as const;
const form = (overrides: Record<string, string> = {}) => {
  const input = new FormData();
  Object.entries({ tenantId: tenant, leadId: lead, submissionId: submission, name: "Fictional enquiry", description: "Synthetic request description", priority: "normal", status: "new", ...overrides }).forEach(([field, value]) => input.set(field, value));
  return input;
};
const respond = (...data: unknown[]) => { harness.responses = data.map(value => ({ data: value, error: null })); };
const writes = () => harness.calls.filter(call => ["insert", "update"].includes(call.method));
beforeEach(() => { harness.configured = true; harness.user = { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" }; harness.authError = null; harness.calls = []; harness.responses = []; });

describe("intake actual action authorization and validation", () => {
  it.each([createLead, updateLead])("preserves unauthenticated redirect", async action => {
    harness.user = null; await expect(action(idle, form())).rejects.toThrow("REDIRECT:/sign-in");
    expect(harness.calls).toEqual([]); expect(harness.revalidate).not.toHaveBeenCalled();
  });
  it("fails closed when verified-user lookup fails", async () => {
    harness.authError = { message: "synthetic-auth-error" }; await expect(createLead(idle, form())).rejects.toThrow("REDIRECT:/sign-in"); expect(harness.calls).toEqual([]);
  });
  it.each(["technician", "viewer", "root", null])("denies role %s before intake reads/writes", async role => {
    for (const action of [createLead, updateLead]) {
      respond(role ? { role } : null); harness.calls = [];
      expect((await action(idle, form())).status).toBe("error"); expect(writes()).toEqual([]);
      expect(harness.calls.every(call => call.table === "memberships")).toBe(true); expect(harness.revalidate).not.toHaveBeenCalled();
    }
  });
  it("fails closed on membership database error", async () => {
    harness.responses = [{ data: { role: "owner" }, error: { message: "synthetic-provider-detail" } }];
    const result = await createLead(idle, form()); expect(result.status).toBe("error"); expect(result.message).not.toContain("synthetic-provider-detail"); expect(writes()).toEqual([]);
  });
  it.each(["tenantId", "submissionId", "leadId"])("rejects malformed/missing %s before intake access", async field => {
    const action = field === "leadId" ? updateLead : createLead;
    for (const missing of [false, true]) {
      respond({ role: "owner" }); harness.calls = [];
      const input = form({ [field]: "bad" }); if (missing) input.delete(field);
      expect((await action(idle, input)).status).toBe("error"); expect(writes()).toEqual([]); expect(harness.calls.every(call => call.table === "memberships")).toBe(true);
    }
  });
  it.each<Record<string, string>>([{ name: " " }, { description: "" }, { description: "x".repeat(4001) }, { email: "invalid" }, { phone: "x".repeat(41) }, { status: "root" }, { priority: "root" }, { follow_up_date: "2026-02-30" }, { customer_id: "bad" }])("rejects invalid fields %j", async overrides => {
    respond({ role: "owner" }); expect((await createLead(idle, form(overrides))).status).toBe("error"); expect(writes()).toEqual([]); expect(harness.calls.every(call => call.table === "memberships")).toBe(true);
  });
  it("strips identity/privilege fields and normalizes optional values", () => {
    expect(leadSchema.parse({ name: " Synthetic ", description: " Synthetic ", priority: "normal", status: "new", tenant_id: "hostile", submission_id: "hostile", id: "hostile", role: "owner", follow_up_date: "", customer_id: "" })).toEqual({ name: "Synthetic", description: "Synthetic", priority: "normal", status: "new", email: null, phone: null, follow_up_date: null, customer_id: null });
  });
});

describe("intake create and retries", () => {
  it.each(["owner", "admin", "dispatcher"])("allows %s create with trusted tenant/token", async role => {
    respond({ role }, null, { id: lead });
    expect((await createLead(idle, form({ tenant_id: "hostile", submission_id: "hostile", id: "hostile" }))).status).toBe("success");
    expect(writes()).toEqual([{ table: "leads", method: "insert", args: [{ name: "Fictional enquiry", description: "Synthetic request description", priority: "normal", status: "new", email: null, phone: null, customer_id: null, follow_up_date: null, tenant_id: tenant, submission_id: submission }] }]);
    expect(harness.revalidate).toHaveBeenCalledExactlyOnceWith(`/workspaces/${tenant}/leads`);
  });
  it("checks linked customer in the same tenant before insert", async () => {
    respond({ role: "owner" }, null, { id: customer }, { id: lead });
    expect((await createLead(idle, form({ customer_id: customer }))).status).toBe("success");
    expect(harness.calls).toContainEqual({ table: "customers", method: "eq", args: ["tenant_id", tenant] });
    expect(harness.calls).toContainEqual({ table: "customers", method: "eq", args: ["id", customer] });
  });
  it("rejects an invisible/cross-tenant linked customer without saving", async () => {
    respond({ role: "owner" }, null, null);
    expect((await createLead(idle, form({ customer_id: customer }))).status).toBe("error"); expect(writes()).toEqual([]); expect(harness.revalidate).not.toHaveBeenCalled();
  });
  it("preflight retry returns saved without overwriting or rechecking new customer", async () => {
    respond({ role: "owner" }, { id: lead });
    expect((await createLead(idle, form({ customer_id: customer, name: "Attempted overwrite" }))).message).toBe("Lead already saved.");
    expect(writes()).toEqual([]); expect(harness.calls.some(call => call.table === "customers")).toBe(false);
    expect(harness.calls).toContainEqual({ table: "leads", method: "eq", args: ["tenant_id", tenant] });
    expect(harness.calls).toContainEqual({ table: "leads", method: "eq", args: ["submission_id", submission] });
  });
  it("handles concurrent duplicate insert through scoped token lookup, without updating", async () => {
    harness.responses = [{ data: { role: "owner" }, error: null }, { data: null, error: null }, { data: null, error: { code: "23505", message: "synthetic-provider-detail" } }, { data: { id: lead }, error: null }];
    expect((await createLead(idle, form())).status).toBe("success");
    expect(writes().map(call => call.method)).toEqual(["insert"]);
    const insertIndex = harness.calls.findIndex(call => call.method === "insert");
    expect(harness.calls.slice(insertIndex + 1)).toContainEqual({ table: "leads", method: "eq", args: ["tenant_id", tenant] });
    expect(harness.calls.slice(insertIndex + 1)).toContainEqual({ table: "leads", method: "eq", args: ["submission_id", submission] });
  });
  it.each([null, { error: true }])("does not treat an unrelated/unreadable duplicate as success %j", async duplicate => {
    harness.responses = [{ data: { role: "owner" }, error: null }, { data: null, error: null }, { data: null, error: { code: "23505" } }, { data: null, error: duplicate }];
    expect((await createLead(idle, form())).status).toBe("error"); expect(harness.revalidate).not.toHaveBeenCalled();
  });
  it.each(["42P01", "PGRST205"])("reports missing migration %s safely", async code => {
    harness.responses = [{ data: { role: "owner" }, error: null }, { data: null, error: { code, message: "synthetic-provider-detail" } }];
    expect((await createLead(idle, form())).message).toContain("database migration"); expect(writes()).toEqual([]); expect(harness.revalidate).not.toHaveBeenCalled();
  });
});

describe("intake update and queries", () => {
  it.each(["owner", "admin", "dispatcher"])("allows %s scoped business update without changing customer/token/identity", async role => {
    respond({ role }, { id: lead });
    expect((await updateLead(idle, form({ customer_id: customer, tenant_id: "hostile", submission_id: "hostile", id: "hostile", status: "contacted", follow_up_date: "2026-10-03" }))).status).toBe("success");
    expect(writes()).toEqual([{ table: "leads", method: "update", args: [{ name: "Fictional enquiry", description: "Synthetic request description", email: null, phone: null, priority: "normal", status: "contacted", follow_up_date: "2026-10-03" }] }]);
    expect(harness.calls).toContainEqual({ table: "leads", method: "eq", args: ["tenant_id", tenant] }); expect(harness.calls).toContainEqual({ table: "leads", method: "eq", args: ["id", lead] });
    expect(harness.revalidate).toHaveBeenCalledWith(`/workspaces/${tenant}/leads`); expect(harness.revalidate).toHaveBeenCalledWith(`/workspaces/${tenant}/leads/${lead}`);
  });
  it.each([null, { message: "synthetic-provider-detail" }])("handles absent/failed updates safely %j", async error => {
    harness.responses = [{ data: { role: "owner" }, error: null }, { data: null, error }];
    const result = await updateLead(idle, form()); expect(result.status).toBe("error"); expect(result.message).not.toContain("synthetic-provider-detail"); expect(harness.revalidate).not.toHaveBeenCalled();
  });
  it("queries only requested tenant for read-only members", async () => {
    respond({ role: "viewer" }, []); expect(await getLeads(tenant)).toEqual({ ready: true, leads: [] });
    expect(harness.calls).toContainEqual({ table: "leads", method: "eq", args: ["tenant_id", tenant] });
  });
  it("rejects nonmember reads before querying intake", async () => {
    respond(null); await expect(getLeads(tenant)).rejects.toThrow("permission"); expect(harness.calls.every(call => call.table === "memberships")).toBe(true);
  });
  it("returns null for malformed ID without intake query", async () => {
    respond({ role: "viewer" }); expect(await getLead(tenant, "bad")).toEqual({ ready: true, lead: null }); expect(harness.calls.every(call => call.table === "memberships")).toBe(true);
  });
  it("scopes detail lookup by tenant and lead ID", async () => {
    respond({ role: "viewer" }, null); expect(await getLead(tenant, lead)).toEqual({ ready: true, lead: null });
    expect(harness.calls).toContainEqual({ table: "leads", method: "eq", args: ["tenant_id", tenant] }); expect(harness.calls).toContainEqual({ table: "leads", method: "eq", args: ["id", lead] });
  });
  it.each(["42P01", "PGRST205"])("returns not-ready for missing database %s", async code => {
    harness.responses = [{ data: { role: "viewer" }, error: null }, { data: null, error: { code } }]; expect(await getLeads(tenant)).toEqual({ ready: false, leads: [] });
    harness.responses = [{ data: { role: "viewer" }, error: null }, { data: null, error: { code } }]; expect(await getLead(tenant, lead)).toEqual({ ready: false, lead: null });
  });
  it("fails safely on other read errors instead of misleading empty state", async () => {
    harness.responses = [{ data: { role: "viewer" }, error: null }, { data: null, error: { message: "synthetic-provider-detail" } }]; await expect(getLeads(tenant)).rejects.toThrow("Could not load leads.");
  });
});
