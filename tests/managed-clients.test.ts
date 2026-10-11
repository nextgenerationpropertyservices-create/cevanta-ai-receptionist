import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const harness = vi.hoisted(() => ({
  list: vi.fn(),
  rpc: vi.fn(),
  redirect: vi.fn((path: string) => { throw new Error(`NEXT_REDIRECT:${path}`); }),
  configured: true,
}));

vi.mock("@/lib/server/queries", () => ({ getManagedClientWorkspaces: harness.list }));
vi.mock("@/lib/supabase/config", () => ({ isSupabaseConfigured: () => harness.configured }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ rpc: harness.rpc }) }));
vi.mock("next/navigation", () => ({ redirect: harness.redirect }));

import Page from "@/app/workspaces/[tenantId]/clients/page";
import { provisionManagedClientWorkspace } from "@/app/actions/managed-clients";

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
  harness.rpc.mockResolvedValue({ data: { status: "saved", workspace: { id: clientTenant, name: "Northstar HVAC", trade: "HVAC", timezone: "America/New_York", account_type: "client", status: "onboarding" } }, error: null });
});

describe("managed client workspace dashboard", () => {
  it("renders the internal owner workspace list and safe creation boundary", async () => {
    const html = await renderClients({
      operator,
      role: "owner",
      allowed: true,
      clients: [{ id: clientTenant, name: "Northstar HVAC", trade: "HVAC", timezone: "America/New_York", status: "onboarding", created_at: "2026-10-11T00:00:00.000Z", updated_at: "2026-10-11T00:00:00.000Z" }],
    });

    expect(harness.list).toHaveBeenCalledWith(operatorTenant);
    expect(html).toContain("Client workspaces");
    expect(html).toContain("Northstar HVAC");
    expect(html).toContain(`/workspaces/${clientTenant}/onboarding`);
    expect(html).toContain("does not invite the client, connect Retell, enable Make, send messages or start billing");
    expect(html).toContain("Create client workspace");
    expect(html).not.toMatch(/service-role|secret|webhook|api key|billing started|booking confirmed/i);
  });

  it("keeps non-internal or limited roles from seeing the create form", async () => {
    const html = await renderClients({ operator: { ...operator, account_type: "client" }, role: "admin", allowed: false, clients: [] });
    expect(html).toContain("Internal access required");
    expect(html).toContain("Return to dashboard");
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
