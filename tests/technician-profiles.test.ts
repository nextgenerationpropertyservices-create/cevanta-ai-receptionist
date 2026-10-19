import { describe, expect, it } from "vitest";
import { normalizeTechnicianProfile, technicianProfileSchema } from "@/lib/technician-profiles";

const tenantId = "11111111-1111-4111-8111-111111111111";
const userId = "44444444-4444-4444-8444-444444444444";

describe("technician profile validation", () => {
  it("normalizes skills, service areas, and weekly availability for dispatch matching", () => {
    const parsed = technicianProfileSchema.parse({
      tenantId,
      userId,
      skills: "No Heat, install\nMaintenance, no heat",
      service_areas: "Lewiston, Auburn\nLewiston",
      availability_monday_start: "08:00",
      availability_monday_end: "16:30",
      availability_note: "Weekdays 8-4",
    });
    expect(parsed.skills).toEqual(["no heat", "install", "maintenance"]);
    expect(parsed.service_areas).toEqual(["lewiston", "auburn"]);
    expect(parsed.availability_windows).toEqual([{ day: "monday", start: "08:00", end: "16:30" }]);
    expect(parsed.availability_note).toBe("Weekdays 8-4");
  });

  it("rejects incomplete or reversed availability windows before persistence", () => {
    expect(technicianProfileSchema.safeParse({ tenantId, userId, availability_monday_start: "08:00" }).success).toBe(false);
    expect(technicianProfileSchema.safeParse({ tenantId, userId, availability_monday_start: "16:00", availability_monday_end: "08:00" }).success).toBe(false);
  });

  it("rejects too many list items before persistence", () => {
    const parsed = technicianProfileSchema.safeParse({ tenantId, userId, skills: Array.from({ length: 21 }, (_, index) => `skill-${index}`).join(",") });
    expect(parsed.success).toBe(false);
  });

  it("defensively drops malformed stored availability windows", () => {
    const profile = normalizeTechnicianProfile({ id: "profile", tenant_id: tenantId, user_id: userId, skills: ["no heat"], service_areas: ["Lewiston", ""], availability_note: "x", availability_windows: [null, { day: "monday", start: "08:00", end: "16:00" }, { day: "monday", start: "09:00", end: "17:00" }, { day: "friday", start: "bad", end: "17:00" }], created_at: "created", updated_at: "updated" });
    expect(profile.service_areas).toEqual(["lewiston"]);
    expect(profile.availability_windows).toEqual([]);
  });

  it("rejects oversized availability notes before persistence", () => {
    const parsed = technicianProfileSchema.safeParse({ tenantId, userId, skills: "no heat", availability_note: "x".repeat(501) });
    expect(parsed.success).toBe(false);
  });

  it("combines preset and custom skills without duplicates", () => {
    const parsed = technicianProfileSchema.parse({ tenantId, userId, skill_presets: ["no heat", "maintenance"], skills: "maintenance, mini split" });
    expect(parsed.skills).toEqual(["no heat", "maintenance", "mini split"]);
  });
});
