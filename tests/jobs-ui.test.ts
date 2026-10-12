import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
vi.mock("@/app/actions/jobs", () => ({ updateJob: vi.fn() }));
import { DispatchBoard } from "@/app/workspaces/[tenantId]/jobs/dispatch-board";

const tenant = "11111111-1111-4111-8111-111111111111";
const job = { id: "22222222-2222-4222-8222-222222222222", tenant_id: tenant, submission_id: "33333333-3333-4333-8333-333333333333", lead_id: null, customer_id: null, service_location_id: null, assigned_user_id: null, title: "Fictional no heat call", description: "Fictional Lewiston customer needs office review before dispatch.", status: "new", priority: "urgent", scheduled_date: "2026-10-12", created_at: "2026-10-11T12:00:00.000Z", updated_at: "2026-10-11T12:00:00.000Z" } as const;
const tech = { user_id: "44444444-4444-4444-8444-444444444444", display_name: "Casey Field Tech", email: "casey@example.invalid" };
const technicianProfile = { id: "55555555-5555-4555-8555-555555555555", tenant_id: tenant, user_id: tech.user_id, skills: ["no heat", "maintenance"], service_areas: ["lewiston"], availability_windows: [{ day: "monday" as const, start: "08:00", end: "16:00" }], availability_note: "Weekdays 8-4", created_at: "2026-10-11T12:00:00.000Z", updated_at: "2026-10-11T12:00:00.000Z" };

describe("dispatch board quick assignment", () => {
  it("makes unassigned active jobs impossible to miss and suggests by skills, area, and availability", () => {
    const html = renderToStaticMarkup(createElement(DispatchBoard, { jobs: [job], technicians: [tech], technicianProfiles: [technicianProfile], tenantId: tenant, technicianView: false, writable: true }));
    expect(html).toContain("Needs tech");
    expect(html).toContain("Assign technician");
    expect(html).toContain("Casey Field Tech");
    expect(html).toContain("Suggested tech: Casey Field Tech");
    expect(html).toContain("skill: no heat");
    expect(html).toContain("area: lewiston");
    expect(html).toContain("available 08:00-16:00");
    expect(html).toContain("Suggestion only — office must confirm availability before booking or dispatch.");
    expect(html).toContain("Weekdays 8-4");
    expect(html).toContain("Save assignment");
    expect(html).not.toMatch(/service-role|secret|webhook|api key/i);
  });
  it("keeps technician view read-only without assignment controls", () => {
    const html = renderToStaticMarkup(createElement(DispatchBoard, { jobs: [{...job, assigned_user_id: tech.user_id}], technicians: [tech], tenantId: tenant, technicianView: true, writable: false }));
    expect(html).toContain("Assigned to you");
    expect(html).not.toContain("Assign technician");
    expect(html).not.toContain("Save assignment");
  });
});
