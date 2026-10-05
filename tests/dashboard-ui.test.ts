import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const harness = vi.hoisted(() => ({
  workspace: vi.fn(), customers: vi.fn(), leads: vi.fn(),
}));
vi.mock("@/lib/server/queries", () => ({ getWorkspace: harness.workspace, getCustomers: harness.customers }));
vi.mock("@/lib/server/intake-queries", () => ({ getLeads: harness.leads }));

import Dashboard from "@/app/workspaces/[tenantId]/page";

const tenant = "11111111-1111-4111-8111-111111111111";
const aiLead = {
  id: "22222222-2222-4222-8222-222222222222", tenant_id: tenant, submission_id: "33333333-3333-4333-8333-333333333333", customer_id: null,
  name: "Fictional AI Caller", email: "caller@example.invalid", phone: "+15550000009",
  description: "AI receptionist call for office review. Service: no cooling. Summary: fictional dry run.",
  priority: "high", status: "new", follow_up_date: null, created_at: "2026-10-05T13:00:00.000Z", updated_at: "2026-10-05T13:00:00.000Z",
};

beforeEach(() => {
  harness.workspace.mockResolvedValue({ tenant: { id: tenant, name: "Fictional HVAC", trade: "HVAC", timezone: "America/New_York" }, role: "owner" });
  harness.customers.mockResolvedValue([]);
  harness.leads.mockResolvedValue({ ready: true, leads: [] });
});

async function html(leads = [aiLead]) {
  harness.leads.mockResolvedValue({ ready: true, leads });
  return renderToStaticMarkup(await Dashboard({ params: Promise.resolve({ tenantId: tenant }) }));
}

describe("workspace overview AI receptionist notice", () => {
  it("shows a review notice for new AI receptionist leads", async () => {
    const output = await html();
    expect(output).toContain("AI receptionist lead needs review");
    expect(output).toContain("1 new call lead is waiting in the lead inbox.");
    expect(output).toContain(`/workspaces/${tenant}/leads/${aiLead.id}`);
  });

  it("hides the review notice after the AI lead is handled", async () => {
    const output = await html([{ ...aiLead, status: "contacted" }]);
    expect(output).not.toContain("AI receptionist lead needs review");
    expect(output).not.toContain("Review newest AI lead");
  });
});

