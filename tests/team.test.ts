import { beforeEach, describe, expect, it, vi } from "vitest";
const harness = vi.hoisted(() => ({ configured: true,
  user: { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" } as { id: string } | null,
  authError: null as unknown, responses: [] as { data: unknown; error: unknown }[],
  calls: [] as { table: string; method: string; args: unknown[] }[], revalidate: vi.fn(),
}));
const reply = () => harness.responses.shift() ?? { data: null, error: null };
vi.mock("@/lib/supabase/config", () => ({ isSupabaseConfigured: () => harness.configured }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({
  auth: { getUser: async () => ({ data: { user: harness.user }, error: harness.authError }) },
  rpc: async (name: string, args: unknown) => { harness.calls.push({ table: name, method: "rpc", args: [args] }); return reply(); },
  from: (table: string) => {
    const response = reply();
    const chain = Object.fromEntries(["select", "eq", "order", "insert", "update", "single", "maybeSingle"].map(method => [method, (...args: unknown[]) => { harness.calls.push({ table, method, args }); return chain; }])) as Record<string, unknown>;
    chain.then = (resolve: (value: unknown) => unknown) => Promise.resolve(response).then(resolve); return chain;
  },
}) }));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`REDIRECT:${path}`); }, unstable_rethrow: (error: unknown) => { if (error instanceof Error && error.message.startsWith("REDIRECT:")) throw error; } }));
vi.mock("next/cache", () => ({ revalidatePath: harness.revalidate }));
import { saveTeamMember } from "@/app/actions/team";
import { getTeamMembers } from "@/lib/server/jobs-queries";

const tenant = "11111111-1111-4111-8111-111111111111";
const idle = { status: "idle", message: "" } as const;
const form = (overrides: Record<string, string> = {}) => { const input = new FormData(); Object.entries({ tenantId: tenant, email: "Tech@Example.Invalid", role: "technician", ...overrides }).forEach(([name,value]) => input.set(name,value)); return input; };
const respond = (...data: unknown[]) => { harness.responses = data.map(value => ({ data: value, error: null })); };
beforeEach(() => { harness.configured = true; harness.user = { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" }; harness.authError = null; harness.responses = []; harness.calls = []; harness.revalidate.mockClear(); });

describe("team member management", () => {
  it("sends normalized email and role to the guarded RPC", async () => {
    respond({ role: "owner" }, { status: "saved" });
    const result = await saveTeamMember(idle, form());
    expect(result.status).toBe("success");
    expect(harness.calls).toContainEqual({ table: "manage_tenant_member", method: "rpc", args: [{ input: { tenant_id: tenant, email: "tech@example.invalid", role: "technician" } }] });
    expect(harness.revalidate).toHaveBeenCalledWith(`/workspaces/${tenant}/technicians`);
    expect(harness.revalidate).toHaveBeenCalledWith(`/workspaces/${tenant}/jobs`);
    expect(harness.revalidate).toHaveBeenCalledWith(`/workspaces/${tenant}/calendar`);
  });
  it.each(["owner", "admin"])("allows %s to read team directory through owner/admin membership", async role => {
    respond({ role }, [{ user_id: "22222222-2222-4222-8222-222222222222", email: "tech@example.invalid", display_name: "Fictional Tech", role: "technician" }]);
    const result = await getTeamMembers(tenant);
    expect(result.ready).toBe(true);
    expect(result.members[0].email).toBe("tech@example.invalid");
    expect(harness.calls).toContainEqual({ table: "get_tenant_team", method: "rpc", args: [{ target: tenant }] });
  });
  it.each(["dispatcher", "technician", "viewer"])("blocks %s before the team RPC", async role => {
    respond({ role });
    await expect(getTeamMembers(tenant)).rejects.toThrow("permission");
    expect(harness.calls.every(call => call.table === "memberships")).toBe(true);
  });
  it.each([{ email: "missing@example.invalid", role: "technician", status: "not_found" }, { email: "owner@example.invalid", role: "viewer", status: "protected_owner" }])("returns safe RPC status messages", async item => {
    respond({ role: "admin" }, { status: item.status });
    const result = await saveTeamMember(idle, form({ email: item.email, role: item.role }));
    expect(result.status).toBe("error");
    expect(result.message).not.toMatch(/provider|database|secret/i);
    expect(harness.revalidate).not.toHaveBeenCalled();
  });
  it.each(["owner", "admin", "root", ""])("rejects invalid editable role %s", async role => {
    const result = await saveTeamMember(idle, form({ role }));
    expect(result.status).toBe("error");
    expect(harness.calls.some(call => call.table === "manage_tenant_member")).toBe(false);
  });
});
