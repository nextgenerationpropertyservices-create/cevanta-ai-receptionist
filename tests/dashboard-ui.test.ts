import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const harness = vi.hoisted(() => ({
  workspace: vi.fn(), leads: vi.fn(), jobs: vi.fn(), appointments: vi.fn(), technicians: vi.fn(),
}));
vi.mock("@/lib/server/queries", () => ({ getWorkspace: harness.workspace }));
vi.mock("@/lib/server/intake-queries", () => ({ getLeads: harness.leads }));
vi.mock("@/lib/server/jobs-queries", () => ({ getJobs: harness.jobs, getTechnicians: harness.technicians }));
vi.mock("@/lib/server/appointments-queries", () => ({ getAppointments: harness.appointments }));

import Dashboard from "@/app/workspaces/[tenantId]/page";

const tenant = "11111111-1111-4111-8111-111111111111";
const techId = "44444444-4444-4444-8444-444444444444";
const aiLead = {
  id: "22222222-2222-4222-8222-222222222222", tenant_id: tenant, submission_id: "33333333-3333-4333-8333-333333333333", customer_id: null,
  name: "Fictional AI Caller", email: "caller@example.invalid", phone: "+15550000009",
  description: "AI receptionist call for office review. Service: leaking water heater. Summary: fictional dry run.",
  priority: "high", status: "new", follow_up_date: null, created_at: "2026-10-05T13:00:00.000Z", updated_at: "2026-10-05T13:00:00.000Z",
};
const job = { id: "55555555-5555-4555-8555-555555555555", tenant_id: tenant, submission_id: "66666666-6666-4666-8666-666666666666", lead_id: null, customer_id: null, service_location_id: null, assigned_user_id: techId, title: "Water heater diagnostic", description: "Check system and report findings.", status: "scheduled", priority: "high", scheduled_date: "2026-10-11", created_at: "2026-10-11T12:00:00.000Z", updated_at: "2026-10-11T12:00:00.000Z" };
const unassignedJob = { ...job, id: "77777777-7777-4777-8777-777777777777", assigned_user_id: null, title: "Emergency leak call", priority: "urgent", status: "new", scheduled_date: null };
const appointment = { id: "88888888-8888-4888-8888-888888888888", tenant_id: tenant, job_id: job.id, submission_id: "99999999-9999-4999-8999-999999999999", title: "Water heater diagnostic", starts_at: "2099-10-11T14:00:00.000Z", ends_at: "2099-10-11T16:00:00.000Z", status: "scheduled", created_at: "2026-10-11T12:00:00.000Z", updated_at: "2026-10-11T12:00:00.000Z" };

beforeEach(() => {
  harness.workspace.mockResolvedValue({ tenant: { id: tenant, name: "Fictional Plumbing", trade: "Plumbing", timezone: "America/New_York", account_type: "client" }, role: "owner" });
  harness.leads.mockResolvedValue({ ready: true, leads: [] });
  harness.jobs.mockResolvedValue({ ready: true, jobs: [] });
  harness.appointments.mockResolvedValue({ ready: true, appointments: [] });
  harness.technicians.mockResolvedValue({ ready: true, technicians: [{ user_id: techId, display_name: "Casey Field Tech" }] });
});

async function html(leads = [aiLead]) {
  harness.leads.mockResolvedValue({ ready: true, leads });
  harness.jobs.mockResolvedValue({ ready: true, jobs: [job, unassignedJob] });
  harness.appointments.mockResolvedValue({ ready: true, appointments: [appointment] });
  return renderToStaticMarkup(await Dashboard({ params: Promise.resolve({ tenantId: tenant }) }));
}

describe("workspace overview front office dashboard", () => {
  it("makes new AI leads and dispatch problems hard to miss", async () => {
    const output = await html();
    expect(output).toContain("FRONT OFFICE COMMAND CENTER");
    expect(output).toContain("Make every call, lead, and job impossible to miss.");
    expect(output).toContain("1 new AI lead needs office review");
    expect(output).toContain("1 urgent/high-priority AI lead");
    expect(output).toContain("1 open job unassigned");
    expect(output).toContain(`/workspaces/${tenant}/leads/${aiLead.id}`);
  });

  it("shows ROI, field team workload, and calendar pulse from existing data", async () => {
    const output = await html();
    expect(output).toContain("RECOVERED LOSS SNAPSHOT");
    expect(output).toContain("Estimated recovered revenue");
    expect(output).toContain("Field team");
    expect(output).toContain("Casey Field Tech");
    expect(output).toContain("Water heater diagnostic");
    expect(output).toContain("Open full calendar");
    expect(output).not.toMatch(/service-role|secret|webhook|api key/i);
  });

  it("keeps the high-alert lead review hidden after AI leads are handled", async () => {
    const output = await html([{ ...aiLead, status: "contacted" }]);
    expect(output).not.toContain("new AI lead needs office review");
    expect(output).not.toContain("Review newest lead");
  });
});




