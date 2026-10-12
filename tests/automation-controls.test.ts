import { describe, expect, it } from "vitest";
import { automationControlSchema } from "@/lib/automation-controls";

const base = {
  tenantId: "11111111-1111-4111-8111-111111111111",
  capability: "sms" as const,
  requested: true,
  client_visible: true,
  owner_approved: true,
  activation_state: "ready" as const,
  test_evidence: "Fictional test call passed.",
  rollback_plan: "Pause the option and return to office review.",
  provider_notes: "Fictional provider account ready.",
};

describe("automation control validation", () => {
  it("allows requested features to be tracked before live activation", () => {
    expect(automationControlSchema.safeParse({ ...base, activation_state: "testing" }).success).toBe(true);
  });

  it("requires approval, test evidence and rollback before active status", () => {
    const parsed = automationControlSchema.safeParse({
      ...base,
      requested: false,
      owner_approved: false,
      activation_state: "active",
      test_evidence: "",
      rollback_plan: "",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.map(issue => issue.path.join("."))).toEqual(expect.arrayContaining(["requested", "owner_approved", "test_evidence", "rollback_plan"]));
    }
  });

  it("accepts active status only when all live-risk gates are present", () => {
    expect(automationControlSchema.safeParse({ ...base, activation_state: "active" }).success).toBe(true);
  });
});
