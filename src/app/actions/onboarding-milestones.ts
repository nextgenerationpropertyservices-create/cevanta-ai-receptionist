"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { onboardingMilestoneSchema } from "@/lib/onboarding-milestones";
import { requireMembership } from "@/lib/server/authorization";
import type { ActionState } from "@/lib/server/action-state";

const missing = (code?: string) => code === "42P01" || code === "PGRST205";

export async function saveOnboardingMilestones(_previous: ActionState, form: FormData): Promise<ActionState> {
  const tenantId = String(form.get("tenantId") ?? "");
  const parsed = onboardingMilestoneSchema.safeParse({
    payment_status: form.get("payment_status"),
    setup_status: form.get("setup_status"),
    test_call_status: form.get("test_call_status"),
    retell_status: form.get("retell_status"),
    make_status: form.get("make_status"),
    launch_approval_status: form.get("launch_approval_status"),
  });
  if (!parsed.success || !tenantId) return { status: "error", message: "Choose a valid milestone status for every gate." };
  try {
    const { client, user } = await requireMembership(tenantId, ["owner", "admin"]);
    const result = await client.from("client_onboarding_milestones").upsert({ tenant_id: tenantId, ...parsed.data, updated_by: user.id }, { onConflict: "tenant_id" }).select("tenant_id").single();
    if (missing(result.error?.code)) return { status: "error", message: "Milestones need their database migration before they can be saved." };
    if (result.error || !result.data) throw new Error("Milestone save failed.");
    revalidatePath(`/workspaces/${tenantId}`, "layout");
    return { status: "success", message: "Onboarding milestones saved. Provider automation remains gated." };
  } catch (error) {
    unstable_rethrow(error);
    return { status: "error", message: "Unable to save milestones. Check your workspace access and try again." };
  }
}
