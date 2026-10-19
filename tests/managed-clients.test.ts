import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const harness = vi.hoisted(() => ({
  list: vi.fn(),
  snapshot: vi.fn(),
  rpc: vi.fn(),
  redirect: vi.fn((path: string) => { throw new Error(`NEXT_REDIRECT:${path}`); }),
  configured: true,
}));

vi.mock("@/lib/server/queries", () => ({ getManagedClientWorkspaces: harness.list }));
vi.mock("@/lib/server/onboarding-rpc", () => ({ getOnboardingSnapshot: harness.snapshot }));
vi.mock("@/lib/supabase/config", () => ({ isSupabaseConfigured: () => harness.configured }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ rpc: harness.rpc }) }));
vi.mock("next/navigation", () => ({ redirect: harness.redirect }));

import Page from "@/app/workspaces/[tenantId]/clients/page";
import { archiveManagedClientWorkspace, provisionManagedClientWorkspace } from "@/app/actions/managed-clients";

const operatorTenant = "1cb2a226-84ef-4dcd-9976-5ce87dd3e449";
const clientTenant = "20000000-0000-4000-8000-000000000001";
const requestId = "20000000-0000-4000-8000-000000000099";
const operator = {
  id: operatorTenant,
  name: "Cevanta Internal Operations",
  trade: "AI Receptionist Operations",
  timezone: "America/New_York",
  account_type: "internal",
  created_at: "2026-10-10T00:00:00.000Z",
  updated_at: "2026-10-10T00:00:00.000Z",
};

function form(overrides: Record<string, string> = {}) {
  const data = new FormData();
  data.set("request_id", requestId);
  data.set("operator_tenant_id", operatorTenant);
  data.set("name", "Northstar HVAC");
  data.set("trade", "HVAC");
  data.set("timezone", "America/New_York");
  for (const [key, value] of Object.entries(overrides)) data.set(key, value);
  return data;
}

async function renderClients(payload: unknown) {
  harness.list.mockResolvedValue(payload);
  return renderToStaticMarkup(await Page({ params: Promise.resolve({ tenantId: operatorTenant }) }));
}

beforeEach(() => {
  vi.clearAllMocks();
  harness.configured = true;
  harness.snapshot.mockResolvedValue({ status: "available", snapshot: { projection: "owner_setup", workspace: { id: clientTenant, name: "Northstar HVAC", trade: "HVAC", timezone: "America/New_York" }, flow_version: "onboarding-v1", config_revision: 3, profile: { business_contact_name: "Fictional Owner", business_email: "owner@example.invalid", business_phone: null }, services: [{ id: "30000000-0000-4000-8000-000000000001", name: "Heating", description: "Fictional service", enabled: true, position: 0, version: 1 }], weekly_hours: [], exceptions: [], booking: { mode: "request_only", lead_time_minutes: null, buffer_before_minutes: null, buffer_after_minutes: null, horizon_days: null, notes: "Office review. Service area: Lewiston and Auburn. Never promise confirmed appointments or exact pricing.", acknowledged: true }, escalation: [], resume_step: "booking", resume_version: 1, readiness: { configuration_state: "not_evaluated", manual_workspace_state: "not_evaluated", reason: "setup_policy_pending", next_action: "platform_operator", booking_state: "blocked", release_state: "not_evaluated", hostedReady: false, providerConnectionAuthorized: false } } });
  harness.rpc.mockResolvedValue({ data: { status: "saved", workspace: { id: clientTenant, name: "Northstar HVAC", trade: "HVAC", timezone: "America/New_York", account_type: "client", status: "onboarding" } }, error: null });
});

describe("managed client workspace dashboard", () => {
  it("renders the internal owner operations monitor and safe creation boundary", async () => {
    const html = await renderClients({
      operator,
      role: "owner",
      allowed: true,
      clients: [{ id: clientTenant, name: "Northstar HVAC", trade: "HVAC", timezone: "America/New_York", status: "onboarding", created_at: "2026-10-11T00:00:00.000Z", updated_at: "2026-10-11T00:00:00.000Z" }],
    });

    expect(harness.list).toHaveBeenCalledWith(operatorTenant);
    expect(harness.snapshot).toHaveBeenCalledWith(clientTenant);
    expect(html).toContain("Internal owner operations dashboard");
    expect(html).toContain("OWNER PRIORITY QUEUE");
    expect(html).toContain("Paperwork, launch, payment, and support monitor");
    expect(html).toContain("CLIENT INTAKE DETAILS");
    expect(html).toContain("What each client has filled out");
    expect(html).toContain("PRIVATE CLIENT ACCESS");
    expect(html).toContain("Create private invite");
    expect(html).toContain("The client must confirm this Cevanta account first");
    expect(html).toContain("Northstar HVAC");
    expect(html).toContain("60%");
    expect(html).toContain("3/5 setup gates complete");
    expect(html).toContain("Manual invoice/payment check required");
    expect(html).toContain("Business contact");
    expect(html).toContain("Fictional Owner");
    expect(html).toContain("Services");
    expect(html).toContain("Heating");
    expect(html).toContain("Service area");
    expect(html).toContain("Never promise rules");
    expect(html).toContain("Lewiston and Auburn");
    expect(html).toContain("Keep provider writes off");
    expect(html).toContain(`/workspaces/${clientTenant}/onboarding`);
    expect(html).toContain(`/workspaces/${clientTenant}/integrations`);
    expect(html).toContain("does not connect Retell, enable Make, send messages, write calendars, dispatch technicians, book appointments, quote work, collect payments or start billing");
    expect(html).toContain("Create client workspace");
    expect(html).toContain("Remove a client workspace");
    expect(html).toContain("Type DELETE WORKSPACE to confirm");
    expect(html).toContain("LAUNCH CONTROL");
    expect(html).toContain("Keep booking, SMS/email, calendar writes and dispatch automation off unless separately approved.");
    expect(html).not.toMatch(/service-role|secret|webhook|api key|billing started|booking confirmed/i);
  });

  it("keeps non-internal or limited roles from seeing the create form", async () => {
    const html = await renderClients({ operator: { ...operator, account_type: "client" }, role: "admin", allowed: false, clients: [] });
    expect(html).toContain("Internal access required");
    expect(html).toContain("Return to dashboard");
    expect(harness.snapshot).not.toHaveBeenCalled();
    expect(html).not.toMatch(/Create client workspace|name="name"|operator_tenant_id|request_id/);
  });
});

describe("managed client workspace action", () => {
  it("submits normalized details to the managed client RPC and redirects to setup", async () => {
    await expect(provisionManagedClientWorkspace({ status: "idle", message: "" }, form({ name: "  Northstar HVAC  " }))).rejects.toThrow(`NEXT_REDIRECT:/workspaces/${clientTenant}/onboarding`);
    expect(harness.rpc).toHaveBeenCalledWith("provision_managed_client_workspace", { input: { request_id: requestId, operator_tenant_id: operatorTenant, name: "Northstar HVAC", trade: "HVAC", timezone: "America/New_York" } });
  });

  it("rejects invalid form data before contacting Supabase", async () => {
    const result = await provisionManagedClientWorkspace({ status: "idle", message: "" }, form({ timezone: "Mars/Base" }));
    expect(result.status).toBe("error");
    expect(result.message).toContain("Fix the client workspace details");
    expect(harness.rpc).not.toHaveBeenCalled();
  });

  it.each([
    [{ status: "validation_error", issues: [{ field: "name", code: "required", message: "private detail" }] }, "Fix the client workspace details"],
    [{ status: "conflict", reason: "request_reuse" }, "already used with different details"],
    [{ status: "unavailable" }, "Only Cevanta internal owner/admin access"],
    [{ status: "retryable_failure" }, "temporarily unavailable"],
  ])("maps safe RPC result %j", async (data, expected) => {
    harness.rpc.mockResolvedValue({ data, error: null });
    const result = await provisionManagedClientWorkspace({ status: "idle", message: "" }, form());
    expect(result.status).toBe("error");
    expect(result.message).toContain(expected);
    expect(JSON.stringify(result)).not.toContain("private detail");
  });

  it("fails closed when Supabase is not configured or returns a corrupt response", async () => {
    harness.configured = false;
    expect((await provisionManagedClientWorkspace({ status: "idle", message: "" }, form())).message).toContain("Complete Supabase setup");
    harness.configured = true;
    harness.rpc.mockResolvedValue({ data: { status: "saved", workspace: { id: clientTenant, account_type: "internal" } }, error: null });
    const result = await provisionManagedClientWorkspace({ status: "idle", message: "" }, form());
    expect(result.status).toBe("error");
    expect(result.message).toContain("temporarily unavailable");
  });
});

describe("managed client workspace removal", () => {
  function archiveForm(overrides: Record<string, string> = {}) {
    const data = new FormData();
    data.set("operatorTenantId", operatorTenant);
    data.set("clientTenantId", clientTenant);
    data.set("confirmation", "DELETE WORKSPACE");
    for (const [key, value] of Object.entries(overrides)) data.set(key, value);
    return data;
  }

  it("archives only after the exact confirmation and redirects to the client list", async () => {
    harness.rpc.mockResolvedValue({ data: { status: "archived" }, error: null });
    await expect(archiveManagedClientWorkspace({ status: "idle", message: "" }, archiveForm())).rejects.toThrow(`NEXT_REDIRECT:/workspaces/${operatorTenant}/clients`);
    expect(harness.rpc).toHaveBeenCalledWith("archive_managed_client_workspace", { input: { operator_tenant_id: operatorTenant, client_tenant_id: clientTenant, confirmation: "DELETE WORKSPACE" } });
  });

  it("fails closed when the confirmation is not exact", async () => {
    const result = await archiveManagedClientWorkspace({ status: "idle", message: "" }, archiveForm({ confirmation: "delete workspace" }));
    expect(result.status).toBe("error");
    expect(result.message).toContain("DELETE WORKSPACE");
    expect(harness.rpc).not.toHaveBeenCalled();
  });

  it.each([
    [{ status: "unavailable" }, "Only an internal owner or admin"],
    [{ status: "validation_error" }, "DELETE WORKSPACE exactly"],
    [{ status: "retryable_failure" }, "temporarily unavailable"],
  ])("maps safe removal result %j", async (data, expected) => {
    harness.rpc.mockResolvedValue({ data, error: null });
    const result = await archiveManagedClientWorkspace({ status: "idle", message: "" }, archiveForm());
    expect(result.status).toBe("error");
    expect(result.message).toContain(expected);
  });
});

