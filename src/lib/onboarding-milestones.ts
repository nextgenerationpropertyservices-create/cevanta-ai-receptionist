import { z } from "zod";

export const milestoneStatuses = {
  payment: ["not_started", "pending", "paid", "failed"],
  setup: ["not_started", "in_progress", "complete"],
  testCall: ["not_started", "passed", "failed"],
  retell: ["not_connected", "mapped", "verified"],
  make: ["not_connected", "mapped", "verified"],
  launch: ["not_requested", "approved", "revoked"],
} as const;

export const onboardingMilestoneSchema = z.object({
  payment_status: z.enum(milestoneStatuses.payment),
  setup_status: z.enum(milestoneStatuses.setup),
  test_call_status: z.enum(milestoneStatuses.testCall),
  retell_status: z.enum(milestoneStatuses.retell),
  make_status: z.enum(milestoneStatuses.make),
  launch_approval_status: z.enum(milestoneStatuses.launch),
}).strict();

export type OnboardingMilestones = z.infer<typeof onboardingMilestoneSchema> & { updated_at: string | null };
export type OnboardingMilestoneInput = z.infer<typeof onboardingMilestoneSchema>;

export const defaultOnboardingMilestones = (): OnboardingMilestones => ({
  payment_status: "not_started",
  setup_status: "not_started",
  test_call_status: "not_started",
  retell_status: "not_connected",
  make_status: "not_connected",
  launch_approval_status: "not_requested",
  updated_at: null,
});

export function milestoneLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, character => character.toUpperCase());
}
