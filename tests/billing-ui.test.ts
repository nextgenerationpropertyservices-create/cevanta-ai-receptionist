import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const harness = vi.hoisted(() => ({ workspace: vi.fn() }));
vi.mock("@/lib/server/queries", () => ({ getWorkspace: harness.workspace }));

import BillingPage from "@/app/workspaces/[tenantId]/billing/page";

const tenant = "11111111-1111-4111-8111-111111111111";

beforeEach(() => {
  harness.workspace.mockResolvedValue({ tenant: { id: tenant, name: "Fictional HVAC", trade: "HVAC", timezone: "America/New_York", account_type: "client" }, role: "owner" });
});

describe("manual billing page", () => {
  it("shows pilot pricing and manual payment boundaries", async () => {
    const html = renderToStaticMarkup(await BillingPage({ params: Promise.resolve({ tenantId: tenant }) }));
    expect(html).toContain("BILLING");
    expect(html).toContain("$497 setup + $297/month");
    expect(html).toContain("Stripe payment link or invoice");
    expect(html).toContain("No credit card form or payment collection in Cevanta.");
    expect(html).toContain("No automatic subscriptions");
    expect(html).toContain("No SMS/email, external calendar write, automatic booking, payment collection or dispatch automation is triggered here.");
    expect(html).toContain(`/workspaces/${tenant}/integrations`);
    expect(html).not.toMatch(/service-role|secret|webhook|api key|card number|cvv/i);
  });
});
