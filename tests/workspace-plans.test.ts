import { beforeEach, describe, expect, it, vi } from "vitest";
const queryHarness = vi.hoisted(() => ({ membership: vi.fn(), responses: [] as { data: unknown; error: unknown; count?: number | null }[], calls: [] as { table: string; method: string; args: unknown[] }[] }));
vi.mock("@/lib/server/authorization", () => ({ requireMembership: queryHarness.membership }));
import {
  FREE_ACTIVE_LEAD_LIMIT_MESSAGE,
  FREE_TECHNICIAN_LIMIT_MESSAGE,
  buildWorkspacePlanSummary,
  isFreePlanLimitError,
  isWorkspacePlan,
} from "@/lib/workspace-plans";
import { getWorkspacePlanSummary } from "@/lib/server/workspace-plan-queries";

const tenantId = "11111111-1111-4111-8111-111111111111";
beforeEach(() => {
  queryHarness.responses = [];
  queryHarness.calls = [];
  queryHarness.membership.mockImplementation(async (requested: string) => {
    if (requested !== tenantId) throw new Error("permission denied");
    return { client: { from: (table: string) => {
      const response = queryHarness.responses.shift() ?? { data: null, error: null };
      const chain = Object.fromEntries(["select", "eq", "in", "single"].map(method => [method, (...args: unknown[]) => { queryHarness.calls.push({ table, method, args }); return chain; }])) as Record<string, unknown>;
      chain.then = (resolve: (value: unknown) => unknown) => Promise.resolve(response).then(resolve);
      return chain;
    } } };
  });
});

describe("workspace plan contract", () => {
  it("builds bounded free usage without implying paid/provider readiness", () => {
    expect(buildWorkspacePlanSummary("free", 49, 2)).toEqual({
      plan: "free",
      limits: { activeLeads: 50, technicianRoster: 2 },
      usage: { activeLeads: 49, technicianRoster: 2 },
      remaining: { activeLeads: 1, technicianRoster: 0 },
    });
  });

  it.each(["dashboard_plus", "managed_receptionist"] as const)("does not apply free row limits to %s", plan => {
    expect(buildWorkspacePlanSummary(plan, 80, 12).limits).toEqual({ activeLeads: null, technicianRoster: null });
  });

  it("accepts only the documented plan identifiers", () => {
    expect(isWorkspacePlan("free")).toBe(true);
    expect(isWorkspacePlan("managed_receptionist")).toBe(true);
    expect(isWorkspacePlan("paid")).toBe(false);
  });

  it("maps only stable limit identifiers and keeps copy actionable", () => {
    expect(isFreePlanLimitError({ message: "free_plan_active_lead_limit" }, "free_plan_active_lead_limit")).toBe(true);
    expect(isFreePlanLimitError({ message: "provider secret" }, "free_plan_active_lead_limit")).toBe(false);
    expect(FREE_ACTIVE_LEAD_LIMIT_MESSAGE).toMatch(/archive|upgrade/i);
    expect(FREE_TECHNICIAN_LIMIT_MESSAGE).toMatch(/remove|upgrade/i);
  });
});

describe("workspace plan summary query", () => {
  it("returns only authenticated tenant-scoped usage", async () => {
    queryHarness.responses = [
      { data: { plan: "free" }, error: null },
      { data: null, error: null, count: 12 },
      { data: null, error: null, count: 1 },
    ];
    await expect(getWorkspacePlanSummary(tenantId)).resolves.toMatchObject({ plan: "free", usage: { activeLeads: 12, technicianRoster: 1 } });
    expect(queryHarness.membership).toHaveBeenCalledWith(tenantId);
    expect(queryHarness.calls.filter(call => call.method === "eq")).toEqual(expect.arrayContaining([
      { table: "tenants", method: "eq", args: ["id", tenantId] },
      { table: "leads", method: "eq", args: ["tenant_id", tenantId] },
      { table: "technician_roster", method: "eq", args: ["tenant_id", tenantId] },
    ]));
  });

  it("denies a cross-tenant request before plan reads", async () => {
    await expect(getWorkspacePlanSummary("22222222-2222-4222-8222-222222222222")).rejects.toThrow("permission denied");
    expect(queryHarness.calls).toEqual([]);
  });
});
