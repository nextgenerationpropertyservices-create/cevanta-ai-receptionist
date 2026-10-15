import { describe, expect, it } from "vitest";
import { evaluateClientOnboardingGate } from "@/lib/server/client-onboarding-gate";
import type { OwnerOnboardingSnapshot } from "@/lib/onboarding-contracts";

const tenant = { account_type: "client" as const };
const base = {
  projection: "owner_setup" as const,
  workspace: { id: "11111111-1111-4111-8111-111111111111", name: "Northstar HVAC", trade: "HVAC", timezone: "America/New_York" },
  flow_version: "onboarding-v1" as const,
  config_revision: 1,
  profile: { business_contact_name: "Fictional Owner", business_email: "owner@example.invalid", business_phone: null },
  services: [{ id: "22222222-2222-4222-8222-222222222222", name: "Fictional maintenance", description: "", enabled: true as const, position: 0, version: 1 }],
  weekly_hours: Array.from({ length: 7 }, (_, weekday) => ({ weekday, closed: weekday > 5, intervals: weekday > 5 ? [] : [{ start_minute: 480, end_minute: 1020 }] })),
  exceptions: [],
  booking: { mode: "request_only" as const, lead_time_minutes: null, buffer_before_minutes: null, buffer_after_minutes: null, horizon_days: null, notes: "Never promise a confirmed appointment.", acknowledged: true },
  escalation: [{ id: "33333333-3333-4333-8333-333333333333", label: "Office", contact_name: "Fictional Manager", email: "manager@example.invalid", phone: null, enabled: true as const, position: 0, version: 1 }],
  resume_step: "profile" as const,
  resume_version: 1,
  readiness: { configuration_state: "not_evaluated" as const, manual_workspace_state: "not_evaluated" as const, reason: "setup_policy_pending" as const, next_action: "platform_operator" as const, booking_state: "blocked" as const, release_state: "not_evaluated" as const, hostedReady: false as const, providerConnectionAuthorized: false as const },
} satisfies OwnerOnboardingSnapshot;

describe("client onboarding gate", () => {
  it("blocks an incomplete client owner and identifies missing setup", () => {
    const result = evaluateClientOnboardingGate(tenant, "owner", { ...base, profile: null, services: [], weekly_hours: [], booking: null, escalation: [] });
    expect(result).toMatchObject({ applies: true, checkable: true, complete: false });
    expect(result.missing).toEqual(["an office contact", "at least one service", "weekly hours", "call and request rules", "an escalation contact"]);
  });

  it("allows a completed client setup", () => {
    expect(evaluateClientOnboardingGate(tenant, "owner", base)).toMatchObject({ applies: true, checkable: true, complete: true, missing: [] });
  });

  it("fails closed when setup cannot be verified", () => {
    expect(evaluateClientOnboardingGate(tenant, "owner", null)).toMatchObject({ applies: true, checkable: false, complete: false });
  });

  it("does not gate internal workspaces or limited roles", () => {
    expect(evaluateClientOnboardingGate({ account_type: "internal" }, "owner", null).applies).toBe(false);
    expect(evaluateClientOnboardingGate(tenant, "dispatcher", null).applies).toBe(false);
  });
});
