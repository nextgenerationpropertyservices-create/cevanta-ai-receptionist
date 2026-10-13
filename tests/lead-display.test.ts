import { describe, expect, it } from "vitest";
import { getLeadDisplayDetails, leadWithDisplayDefaults } from "@/lib/lead-display";
import { AI_RECEPTIONIST_MARKER } from "@/lib/ai-lead-notifications";
import type { Lead } from "@/lib/intake-contracts";

const baseLead: Lead = {
  id: "11111111-1111-4111-8111-111111111111",
  tenant_id: "22222222-2222-4222-8222-222222222222",
  submission_id: "33333333-3333-4333-8333-333333333333",
  customer_id: null,
  name: "",
  email: null,
  phone: null,
  description: `${AI_RECEPTIONIST_MARKER}\nName: Jordan Example\nEmail: jordan@example.invalid\nPhone: 207-555-0188\nService: no heat\nSummary: Furnace stopped heating overnight and the office should review availability.`,
  priority: "urgent",
  status: "new",
  follow_up_date: null,
  created_at: "2026-10-13T12:00:00.000Z",
  updated_at: "2026-10-13T12:00:00.000Z",
};

describe("lead display defaults", () => {
  it("extracts contact fields, keeps service request to summary only, and builds a job title", () => {
    const display = getLeadDisplayDetails(baseLead);
    expect(display.name).toBe("Jordan Example");
    expect(display.email).toBe("jordan@example.invalid");
    expect(display.phone).toBe("207-555-0188");
    expect(display.serviceRequest).toBe("Furnace stopped heating overnight and the office should review availability.");
    expect(display.serviceRequest).not.toContain("Phone:");
    expect(display.serviceRequest).not.toContain(AI_RECEPTIONIST_MARKER);
    expect(display.jobTitle).toBe("No heat");
  });

  it("does not overwrite stored contact fields when they already exist", () => {
    const display = leadWithDisplayDefaults({ ...baseLead, name: "Stored Name", email: "stored@example.invalid", phone: "+15550001111" });
    expect(display.name).toBe("Stored Name");
    expect(display.email).toBe("stored@example.invalid");
    expect(display.phone).toBe("+15550001111");
    expect(display.description).toContain("Furnace stopped heating");
  });
});
