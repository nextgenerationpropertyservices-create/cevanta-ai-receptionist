import "server-only";
import { requireMembership } from "@/lib/server/authorization";
import { defaultOnboardingMilestones, type OnboardingMilestones } from "@/lib/onboarding-milestones";

const missing = (code?: string) => code === "42P01" || code === "PGRST205";

export async function getOnboardingMilestones(tenantIds: string[]): Promise<Map<string, OnboardingMilestones>> {
  const result = new Map<string, OnboardingMilestones>();
  if (!tenantIds.length) return result;
  const { client } = await requireMembership(tenantIds[0]);
  const response = await client.from("client_onboarding_milestones").select("tenant_id,payment_status,setup_status,test_call_status,retell_status,make_status,launch_approval_status,updated_at").in("tenant_id", tenantIds);
  if (missing(response.error?.code)) return result;
  if (response.error) throw new Error("Could not load onboarding milestones.");
  for (const tenantId of tenantIds) result.set(tenantId, defaultOnboardingMilestones());
  for (const row of response.data ?? []) {
    result.set(row.tenant_id as string, {
      payment_status: row.payment_status,
      setup_status: row.setup_status,
      test_call_status: row.test_call_status,
      retell_status: row.retell_status,
      make_status: row.make_status,
      launch_approval_status: row.launch_approval_status,
      updated_at: row.updated_at,
    });
  }
  return result;
}
