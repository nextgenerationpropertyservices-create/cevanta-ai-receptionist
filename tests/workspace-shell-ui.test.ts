import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/app/actions/auth", () => ({ signOut: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => "/workspaces/11111111-1111-4111-8111-111111111111/jobs" }));

import { WorkspaceShell } from "@/components/workspace-shell";

const tenant = { id: "11111111-1111-4111-8111-111111111111", name: "Fictional HVAC", trade: "HVAC", timezone: "America/New_York", account_type: "client", created_at: "2026-10-11T12:00:00.000Z", updated_at: "2026-10-11T12:00:00.000Z" } as const;

describe("workspace shell attention badges", () => {
  it("shows lead and job attention counts in the top navigation", () => {
    const html = renderToStaticMarkup(createElement(WorkspaceShell, { tenant, role: "owner", attention: { aiLeads: 2, urgentAiLeads: 1, unassignedJobs: 3, newestAiLeadId: "33333333-3333-4333-8333-333333333333" } }, createElement("div", null, "Dashboard body")));
    expect(html).toContain("5</strong> need attention");
    expect(html).toContain("Notifications");
    expect(html).toContain(`/workspaces/${tenant.id}/notifications`);
    expect(html).toContain("Leads");
    expect(html).toContain("Jobs");
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('class="active"');
    expect(html).toContain("Billing");
    expect(html).toContain("Manual");
    expect(html).toContain("Start setup");
    expect(html).toContain(`/workspaces/${tenant.id}/onboarding`);
    expect(html).toContain("Go Live");
    expect(html).toContain(`/workspaces/${tenant.id}/go-live`);
    expect(html).toContain(`/workspaces/${tenant.id}/manual`);
    expect(html).toContain("2</span>");
    expect(html).toContain("NEEDS ATTENTION");
    expect(html).toContain("2 new leads need office review, including 1 urgent or high-priority");
    expect(html).toContain(`/workspaces/${tenant.id}/leads/33333333-3333-4333-8333-333333333333`);
    expect(html).toContain("In-app only");
    expect(html).toContain("no messages, bookings, payments, calendar writes, or dispatch");
    expect(html).toContain("3</span>");
    expect(html).not.toMatch(/service-role|secret|webhook|api key/i);
  });

  it("labels the internal owner dashboard tab as Clients", () => {
    const internalTenant = { ...tenant, account_type: "internal", name: "Cevanta Internal Operations", trade: "AI Receptionist Operations" } as const;
    const html = renderToStaticMarkup(createElement(WorkspaceShell, { tenant: internalTenant, role: "owner" }, createElement("div", null, "Dashboard body")));
    expect(html).toContain("Clients");
    expect(html).toContain(`/workspaces/${tenant.id}/clients`);
    expect(html).not.toContain("Back office");
    expect(html).not.toContain("Start setup");
  });
  it("does not show an attention pill when there is nothing urgent", () => {
    const html = renderToStaticMarkup(createElement(WorkspaceShell, { tenant, role: "viewer" }, createElement("div", null, "Dashboard body")));
    expect(html).not.toContain("need attention");
    expect(html).not.toContain("NEW AI RECEPTIONIST LEAD");
  });
});
