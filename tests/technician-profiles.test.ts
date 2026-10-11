import { describe, expect, it } from "vitest";
import { technicianProfileSchema } from "@/lib/technician-profiles";

const tenantId = "11111111-1111-4111-8111-111111111111";
const userId = "44444444-4444-4444-8444-444444444444";

describe("technician profile validation", () => {
  it("normalizes skill lists for dispatch matching", () => {
    const parsed = technicianProfileSchema.parse({ tenantId, userId, skills: "No Heat, install\nMaintenance, no heat", availability_note: "Weekdays 8-4" });
    expect(parsed.skills).toEqual(["no heat", "install", "maintenance"]);
    expect(parsed.availability_note).toBe("Weekdays 8-4");
  });

  it("rejects oversized availability notes before persistence", () => {
    const parsed = technicianProfileSchema.safeParse({ tenantId, userId, skills: "no heat", availability_note: "x".repeat(501) });
    expect(parsed.success).toBe(false);
  });
});
