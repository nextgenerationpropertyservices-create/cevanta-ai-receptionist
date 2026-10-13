import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AUTOMATION_CONTROL_DEFINITIONS, defaultAutomationControl } from "@/lib/automation-controls";

const harness = vi.hoisted(() => ({ workspace: vi.fn(), automationControls: vi.fn() }));
vi.mock("@/lib/server/queries", () => ({ getWorkspace: harness.workspace }));
vi.mock("@/lib/server/automation-control-queries", () => ({ getAutomationControls: harness.automationControls }));

import BillingPage from "@/app/workspaces/[tenantId]/billing/page";

const tenant = "11111111-1111-4111-8111-111111111111";

beforeEach(() => {
  harness.workspace.mockResolvedValue({ tenant: { id: tenant, name: "Fictional HVAC", trade: "HVAC", timezone: "America/New_York", account_type: "client" }, role: "owner" });
  harness.automationControls.mockResolvedValue({
    ready: true,
    canManage: true,
    controls: AUTOMATION_CONTROL_DEFINITIONS.map(definition => defaultAutomationControl(tenant, definition)),
  });
});

describe("manual billing page", () => {
  it("shows restricted billing automation status for non-manager roles", async () => {
    harness.workspace.mockResolvedValueOnce({ tenant: { id: tenant, name: "Fictional HVAC", trade: "HVAC", timezone: "America/New_York", account_type: "client" }, role: "dispatcher" });
    harness.automationControls.mockResolvedValueOnce({
      ready: true,
      canManage: false,
      controls: AUTOMATION_CONTROL_DEFINITIONS.map(definition => defaultAutomationControl(tenant, definition)),
    });
    const html = renderToStaticMarkup(await BillingPage({ params: Promise.resolve({ tenantId: tenant }) }));
    expect(html).toContain("Status restricted");
    expect(html).toContain("Current approval and activation status are restricted to owners and admins.");
  });

  it("shows pilot pricing and controlled payment boundaries", async () => {
    const html = renderToStaticMarkup(await BillingPage({ params: Promise.resolve({ tenantId: tenant }) }));
    expect(html).toContain("BILLING");
    expect(html).toContain("Your Cevanta pilot billing.");
    expect(html).toContain("CURRENT PILOT PLAN");
    expect(html).toContain("$497 setup + $297/month");
    expect(html).toContain("PAYMENT STATUS");
    expect(html).toContain("Manual confirmation");
    expect(html).toContain("approved payment link or invoice outside this dashboard");
    expect(html).toContain("No credit card form is shown in Cevanta until payment collection is approved, tested and released.");
    expect(html).toContain("No automatic subscriptions");
    expect(html).toContain("Payment collection");
    expect(html).toContain("Subscription billing");
    expect(html).toContain("PAYMENT AUTOMATION OPTIONS");
    expect(html).toContain("FUTURE BILLING OPTIONS");
    expect(html).toContain(`/workspaces/${tenant}/manual`);
    expect(html).toContain(`/workspaces/${tenant}/integrations`);
    expect(html).toContain(`/workspaces/${tenant}/go-live`);
    expect(html).not.toContain("Back office");
    expect(html).not.toContain("DO THIS FOR EACH CLIENT");
    expect(html).not.toMatch(/service-role|secret|webhook|api key|card number|cvv/i);
  });
});
