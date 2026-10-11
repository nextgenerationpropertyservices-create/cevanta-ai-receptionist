import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/app/actions/auth", () => ({ signOut: vi.fn() }));

import { WorkspaceShell } from "@/components/workspace-shell";

const tenant = { id: "11111111-1111-4111-8111-111111111111", name: "Fictional HVAC", trade: "HVAC", timezone: "America/New_York", account_type: "client", created_at: "2026-10-11T12:00:00.000Z", updated_at: "2026-10-11T12:00:00.000Z" } as const;

describe("workspace shell attention badges", () => {
  it("shows lead and job attention counts in the top navigation", () => {
    const html = renderToStaticMarkup(createElement(WorkspaceShell, { tenant, role: "owner", attention: { aiLeads: 2, unassignedJobs: 3 } }, createElement("div", null, "Dashboard body")));
    expect(html).toContain("5</strong> need attention");
    expect(html).toContain("Leads");
    expect(html).toContain("Jobs");
    expect(html).toContain("2</span>");
    expect(html).toContain("3</span>");
    expect(html).not.toMatch(/service-role|secret|webhook|api key/i);
  });

  it("does not show an attention pill when there is nothing urgent", () => {
    const html = renderToStaticMarkup(createElement(WorkspaceShell, { tenant, role: "viewer" }, createElement("div", null, "Dashboard body")));
    expect(html).not.toContain("need attention");
  });
});


