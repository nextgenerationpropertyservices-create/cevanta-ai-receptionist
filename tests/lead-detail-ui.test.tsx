import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AI_RECEPTIONIST_MARKER } from "@/lib/ai-lead-notifications";

const harness = vi.hoisted(() => ({
  workspace: vi.fn(), lead: vi.fn(), customers: vi.fn(), jobs: vi.fn(), technicians: vi.fn(), locations: vi.fn(), updateLead: vi.fn(), createJob: vi.fn(),
}));
vi.mock("@/lib/server/queries", () => ({ getWorkspace: harness.workspace, getCustomers: harness.customers }));
vi.mock("@/lib/server/intake-queries", () => ({ getLead: harness.lead }));
vi.mock("@/lib/server/jobs-queries", () => ({ getJobs: harness.jobs, getTechnicians: harness.technicians, getJobLocations: harness.locations }));
vi.mock("@/app/actions/intake", () => ({ updateLead: harness.updateLead }));
vi.mock("@/app/actions/jobs", () => ({ createJob: harness.createJob }));

import LeadDetail from "@/app/workspaces/[tenantId]/leads/[leadId]/page";

const tenant = "11111111-1111-4111-8111-111111111111";
const leadId = "22222222-2222-4222-8222-222222222222";
const lead = {
  id: leadId,
  tenant_id: tenant,
  submission_id: "33333333-3333-4333-8333-333333333333",
  customer_id: null,
  name: "",
  email: null,
  phone: null,
  description: `${AI_RECEPTIONIST_MARKER}\nName: Jordan Example\nEmail: jordan@example.invalid\nPhone: 207-555-0188\nService: no heat\nSummary: Furnace stopped heating overnight and needs office review.`,
  priority: "urgent",
  status: "new",
  follow_up_date: null,
  created_at: "2026-10-13T12:00:00.000Z",
  updated_at: "2026-10-13T12:00:00.000Z",
};

beforeEach(() => {
  harness.workspace.mockResolvedValue({ tenant: { id: tenant, name: "Fictional HVAC", trade: "HVAC", timezone: "America/New_York", account_type: "client" }, role: "owner" });
  harness.lead.mockResolvedValue({ ready: true, lead });
  harness.customers.mockResolvedValue([]);
  harness.jobs.mockResolvedValue({ ready: true, jobs: [] });
  harness.technicians.mockResolvedValue({ ready: true, technicians: [] });
  harness.locations.mockResolvedValue({ ready: true, locations: [] });
});

describe("lead detail defaults", () => {
  it("pre-fills extracted contact details, a clean service request, and a useful job title", async () => {
    const html = renderToStaticMarkup(await LeadDetail({ params: Promise.resolve({ tenantId: tenant, leadId }) }));
    expect(html).toContain('value="Jordan Example"');
    expect(html).toContain('value="jordan@example.invalid"');
    expect(html).toContain('value="207-555-0188"');
    expect(html).toContain("Furnace stopped heating overnight and needs office review");
    expect(html).not.toContain("Name: Jordan Example");
    expect(html).not.toContain("Phone: 207-555-0188");
    expect(html).not.toContain(AI_RECEPTIONIST_MARKER);
    expect(html).toContain('value="No heat"');
    expect(html).toContain("Create job from enquiry");
  });
});
