import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
const harness = vi.hoisted(() => ({ workspace: vi.fn(), jobs: vi.fn(), technicians: vi.fn(), appointments: vi.fn() }));
vi.mock("@/lib/server/queries", () => ({ getWorkspace: harness.workspace }));
vi.mock("@/lib/server/jobs-queries", () => ({ getJobs: harness.jobs, getTechnicians: harness.technicians }));
vi.mock("@/lib/server/appointments-queries", () => ({ getAppointments: harness.appointments }));
vi.mock("@/app/actions/appointments", () => ({ createAppointment: vi.fn(), updateAppointment: vi.fn() }));
import Calendar from "@/app/workspaces/[tenantId]/calendar/page";
const tenant = "11111111-1111-4111-8111-111111111111";
const tech = "22222222-2222-4222-8222-222222222222";
const job = { id: "33333333-3333-4333-8333-333333333333", tenant_id: tenant, submission_id: "44444444-4444-4444-8444-444444444444", lead_id: null, customer_id: null, service_location_id: null, assigned_user_id: tech, title: "Fictional heat pump repair", description: "Office review job", status: "scheduled", priority: "normal", scheduled_date: "2026-10-11", created_at: "2026-10-11T12:00:00.000Z", updated_at: "2026-10-11T12:00:00.000Z" };
const appointment = { id: "55555555-5555-4555-8555-555555555555", tenant_id: tenant, job_id: job.id, submission_id: "66666666-6666-4666-8666-666666666666", title: "Fictional heat pump repair", starts_at: "2026-10-11T14:00:00.000Z", ends_at: "2026-10-11T15:00:00.000Z", status: "scheduled", created_at: "2026-10-11T12:00:00.000Z", updated_at: "2026-10-11T12:00:00.000Z" };
beforeEach(() => {
  harness.workspace.mockResolvedValue({ tenant: { id: tenant, name: "Fictional HVAC", trade: "HVAC", timezone: "America/New_York", account_type: "client" }, role: "owner" });
  harness.jobs.mockResolvedValue({ ready: true, jobs: [job] });
  harness.technicians.mockResolvedValue({ ready: true, technicians: [{ user_id: tech, display_name: "Casey Field Tech" }] });
  harness.appointments.mockResolvedValue({ ready: true, appointments: [appointment] });
});
describe("front office calendar UI", () => {
  it("shows year month week day hour navigation and assigned technician context", async () => {
    const html = renderToStaticMarkup(await Calendar({ params: Promise.resolve({ tenantId: tenant }), searchParams: Promise.resolve({ view: "week", date: "2026-10-11" }) }));
    for (const label of ["Year", "Month", "Week", "Day", "Hour"]) expect(html).toContain(label);
    expect(html).toContain("CALENDAR MENU");
    expect(html).toContain("Casey Field Tech");
    expect(html).toContain("Fictional heat pump repair");
    expect(html).not.toMatch(/service-role|secret|webhook|api key/i);
  });
});
