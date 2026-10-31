import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const harness = vi.hoisted(() => ({
  workspaces: vi.fn(),
  configured: true,
}));

vi.mock("@/lib/server/queries", () => ({ getWorkspaces: harness.workspaces }));
vi.mock("@/lib/supabase/config", () => ({ isSupabaseConfigured: () => harness.configured }));
vi.mock("@/app/actions/auth", () => ({ provisionWorkspace: vi.fn(), signOut: vi.fn() }));

import Page from "@/app/workspaces/page";

describe("workspace picker", () => {
  it("makes the internal owner/client dashboard easy to identify", async () => {
    harness.configured = true;
    harness.workspaces.mockResolvedValue([
      { id: "1cb2a226-84ef-4dcd-9976-5ce87dd3e449", name: "Cevanta Internal Operations", trade: "AI Receptionist Operations", timezone: "America/New_York", account_type: "internal", plan: "managed_receptionist", created_at: "2026-10-11T00:00:00.000Z", updated_at: "2026-10-11T00:00:00.000Z" },
      { id: "b5943d94-d6c4-4b15-bd41-5cedffc42708", name: "Northstar HVAC", trade: "HVAC", timezone: "America/New_York", account_type: "client", plan: "free", created_at: "2026-10-11T00:00:00.000Z", updated_at: "2026-10-11T00:00:00.000Z" },
    ]);

    const html = renderToStaticMarkup(await Page());
    expect(html).toContain("Cevanta Internal Operations");
    expect(html).toContain("Internal owner dashboard");
    expect(html).toContain("Manage clients");
    expect(html).toContain("Open clients dashboard");
    expect(html).toContain("Pick up where you left off");
    expect(html).toContain("Internal dashboard");
    expect(html).toContain("Client workspaces");
    expect(html).toContain("What each page is for");
    expect(html).toContain("Example: a no-cooling call is marked urgent");
    expect(html).toContain("Northstar HVAC");
    expect(html).toContain("Client workspace");
    expect(html).toContain("Free tools");
    expect(html).toContain("workspace-section-internal");
    expect(html.indexOf("workspace-section-internal")).toBeLessThan(html.indexOf("workspace-welcome"));
    expect(html).not.toMatch(/service-role|secret|webhook|api key/i);
  });

  it("keeps the first-run action clear when no workspaces exist", async () => {
    harness.configured = true;
    harness.workspaces.mockResolvedValue([]);
    const html = renderToStaticMarkup(await Page());
    expect(html).toContain("Create your free workspace");
    expect(html).toContain("Create free workspace");
    expect(html).toContain("No credit card is required");
    expect(html).toContain("Business name");
    expect(html).toContain("Technicians");
  });
});
