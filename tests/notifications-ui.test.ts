import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const harness = vi.hoisted(() => ({ workspace: vi.fn(), leads: vi.fn(), jobs: vi.fn(), technicians: vi.fn(), appointments: vi.fn() }));
vi.mock("@/lib/server/queries", () => ({ getWorkspace: harness.workspace }));
vi.mock("@/lib/server/intake-queries", () => ({ getLeads: harness.leads }));
vi.mock("@/lib/server/jobs-queries", () => ({ getJobs: harness.jobs, getTechnicians: harness.technicians }));
vi.mock("@/lib/server/appointments-queries", () => ({ getAppointments: harness.appointments }));

import Notifications from "@/app/workspaces/[tenantId]/notifications/page";
import { AI_RECEPTIONIST_MARKER } from "@/lib/ai-lead-notifications";

const tenant = "11111111-1111-4111-8111-111111111111";
const tech = "22222222-2222-4222-8222-222222222222";
const lead = { id: "33333333-3333-4333-8333-333333333333", tenant_id: tenant, submission_id: "44444444-4444-4444-8444-444444444444", customer_id: null, name: "Fictional Prospect", email: null, phone: null, description: `${AI_RECEPTIONIST_MARKER} Fictional customer needs no-heat office review.`, priority: "urgent", status: "new", follow_up_date: null, created_at: "2026-10-11T12:00:00.000Z", updated_at: "2026-10-11T12:00:00.000Z" };
const job = { id: "55555555-5555-4555-8555-555555555555", tenant_id: tenant, submission_id: "66666666-6666-4666-8666-666666666666", lead_id: null, customer_id: null, service_location_id: null, assigned_user_id: null, title: "Fictional no heat job", description: "Needs manual office assignment.", status: "new", priority: "high", scheduled_date: "2026-10-11", created_at: "2026-10-11T12:00:00.000Z", updated_at: "2026-10-11T12:00:00.000Z" };
const appointment = { id: "77777777-7777-4777-8777-777777777777", tenant_id: tenant, job_id: job.id, submission_id: "88888888-8888-4888-8888-888888888888", title: "Fictional service visit", starts_at: `${new Date().toISOString().slice(0,10)}T15:00:00.000Z`, ends_at: `${new Date().toISOString().slice(0,10)}T16:00:00.000Z`, status: "scheduled", created_at: "2026-10-11T12:00:00.000Z", updated_at: "2026-10-11T12:00:00.000Z" };

beforeEach(() => {
  harness.workspace.mockResolvedValue({ tenant: { id: tenant, name: "Fictional HVAC", trade: "HVAC", timezone: "America/New_York", account_type: "client" }, role: "owner" });
  harness.leads.mockResolvedValue({ ready: true, leads: [lead] });
  harness.jobs.mockResolvedValue({ ready: true, jobs: [job] });
  harness.technicians.mockResolvedValue({ ready: true, technicians: [{ user_id: tech, display_name: "Casey Field Tech" }] });
  harness.appointments.mockResolvedValue({ ready: true, appointments: [appointment] });
});

describe("notification center", () => {
  it("shows in-app lead, job, and schedule attention without external writes", async () => {
    const html = renderToStaticMarkup(await Notifications({ params: Promise.resolve({ tenantId: tenant }) }));
    expect(html).toContain("NOTIFICATION CENTER");
    expect(html).toContain("New AI leads");
    expect(html).toContain("Urgent AI lead");
    expect(html).toContain("Fictional Prospect");
    expect(html).toContain("Unassigned job");
    expect(html).toContain("Fictional no heat job");
    expect(html).toContain("Visits today");
    expect(html).toContain("SMS, email and external calendar writes are controlled options");
    expect(html).toContain("Automatic booking remains off");
    expect(html).toContain(`/workspaces/${tenant}/integrations`);
    expect(html).not.toMatch(/service-role|secret|webhook|api key/i);
  });
});

