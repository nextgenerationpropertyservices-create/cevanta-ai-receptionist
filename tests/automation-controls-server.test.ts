import { beforeEach, describe, expect, it, vi } from "vitest";

const harness = vi.hoisted(() => ({
  requireMembership: vi.fn(),
  revalidate: vi.fn(),
  calls: [] as { table: string; method: string; args: unknown[] }[],
  plan: "managed_receptionist" as string | null,
}));

vi.mock("@/lib/server/authorization", () => ({ requireMembership: harness.requireMembership }));
vi.mock("next/cache", () => ({ revalidatePath: harness.revalidate }));
vi.mock("next/navigation", () => ({ unstable_rethrow: (error: unknown) => { if (error instanceof Error && error.message.startsWith("REDIRECT:")) throw error; } }));

import { saveAutomationControl } from "@/app/actions/automation-controls";
import { getAutomationControls } from "@/lib/server/automation-control-queries";

const tenant = "11111111-1111-4111-8111-111111111111";
const user = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const idle = { status: "idle", message: "" } as const;
const form = (fields: Record<string, string | boolean>) => {
  const data = new FormData();
  Object.entries(fields).forEach(([key, value]) => { if (value === true) data.set(key, "on"); else if (value !== false) data.set(key, String(value)); });
  return data;
};

function clientWithResponses(responses: unknown[]) {
  return {
    from: (table: string) => ({
      select: (...args: unknown[]) => { harness.calls.push({ table, method: "select", args }); return clientWithResponses(responses).from(table); },
      eq: (...args: unknown[]) => { harness.calls.push({ table, method: "eq", args }); return clientWithResponses(responses).from(table); },
      insert: (...args: unknown[]) => { harness.calls.push({ table, method: "insert", args }); return clientWithResponses(responses).from(table); },
      update: (...args: unknown[]) => { harness.calls.push({ table, method: "update", args }); return clientWithResponses(responses).from(table); },
      maybeSingle: async () => responses.shift(),
      single: async () => table === "tenants" ? { data: { plan: harness.plan }, error: null } : responses.shift(),
      then: (resolve: (value: unknown) => unknown) => Promise.resolve(responses.shift()).then(resolve),
    }),
  };
}

beforeEach(() => {
  harness.requireMembership.mockReset();
  harness.revalidate.mockReset();
  harness.calls = [];
  harness.plan = "managed_receptionist";
});

describe("automation-control server boundaries", () => {
  it("returns safe defaults for non-managers without reading private automation notes", async () => {
    harness.requireMembership.mockResolvedValue({ client: clientWithResponses([{ data: [], error: null }]), role: "dispatcher", user: { id: user } });
    const result = await getAutomationControls(tenant);
    expect(result.canManage).toBe(false);
    expect(result.controls).toHaveLength(7);
    expect(harness.calls).toEqual([]);
  });

  it("loads saved controls only for owner/admin roles", async () => {
    harness.requireMembership.mockResolvedValue({ client: clientWithResponses([{ data: [{ id: "control", tenant_id: tenant, capability: "sms", requested: true, client_visible: false, owner_approved: true, activation_state: "ready", test_evidence: "tested", rollback_plan: "pause it", provider_notes: "provider note", updated_at: "now" }], error: null }]), role: "owner", user: { id: user } });
    const result = await getAutomationControls(tenant);
    expect(result.canManage).toBe(true);
    expect(result.controls.find(control => control.capability === "sms")?.test_evidence).toBe("tested");
    expect(harness.calls.some(call => call.table === "workspace_automation_controls" && call.method === "select")).toBe(true);
  });

  it("rejects active status before test evidence and rollback reach the database", async () => {
    const result = await saveAutomationControl(idle, form({ tenantId: tenant, capability: "sms", requested: true, client_visible: true, owner_approved: true, activation_state: "active", test_evidence: "", rollback_plan: "", provider_notes: "" }));
    expect(result.status).toBe("error");
    expect(harness.requireMembership).not.toHaveBeenCalled();
    expect(harness.calls).toEqual([]);
  });

  it("uses update instead of upsert so immutable identity columns are not rewritten", async () => {
    harness.requireMembership.mockResolvedValue({ client: clientWithResponses([{ data: { id: "control" }, error: null }, { data: { id: "control" }, error: null }]), role: "owner", user: { id: user } });
    const result = await saveAutomationControl(idle, form({ tenantId: tenant, capability: "sms", requested: true, client_visible: true, owner_approved: false, activation_state: "testing", test_evidence: "tested", rollback_plan: "pause it", provider_notes: "provider note" }));
    expect(result.status).toBe("success");
    expect(harness.calls.some(call => call.method === "update" && JSON.stringify(call.args).includes("tenant_id"))).toBe(false);
    expect(harness.revalidate).toHaveBeenCalledWith(`/workspaces/${tenant}`, "layout");
  });

  it.each(["free", null])("blocks %s plan before automation-control mutation", async plan => {
    harness.plan = plan;
    harness.requireMembership.mockResolvedValue({ client: clientWithResponses([]), role: "owner", user: { id: user } });

    const result = await saveAutomationControl(idle, form({ tenantId: tenant, capability: "sms", requested: true, client_visible: true, owner_approved: false, activation_state: "testing", test_evidence: "tested", rollback_plan: "pause it", provider_notes: "" }));

    expect(result.status).toBe("error");
    expect(harness.calls.some(call => call.method === "insert" || call.method === "update")).toBe(false);
    expect(harness.revalidate).not.toHaveBeenCalled();
  });
});
