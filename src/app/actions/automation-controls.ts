"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { automationControlSchema, AUTOMATION_CONTROL_DEFINITIONS } from "@/lib/automation-controls";
import { requireAutomationControlManager } from "@/lib/server/automation-control-queries";
import type { ActionState } from "@/lib/server/action-state";
import { getAuthoritativeWorkspacePlan, FREE_PLAN_LOCKED_MESSAGE } from "@/lib/workspace-plans";

const missing = (code?: string) => code === "42P01" || code === "PGRST205";

export async function saveAutomationControl(_previous: ActionState, form: FormData): Promise<ActionState> {
  try {
    const parsed = automationControlSchema.safeParse({
      tenantId: form.get("tenantId"),
      capability: form.get("capability"),
      requested: form.get("requested") === "on",
      client_visible: form.get("client_visible") === "on",
      owner_approved: form.get("owner_approved") === "on",
      activation_state: form.get("activation_state"),
      test_evidence: String(form.get("test_evidence") ?? ""),
      rollback_plan: String(form.get("rollback_plan") ?? ""),
      provider_notes: String(form.get("provider_notes") ?? ""),
    });
    if (!parsed.success) {
      return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the automation settings." };
    }
    const input = parsed.data;
    const definition = AUTOMATION_CONTROL_DEFINITIONS.find(item => item.capability === input.capability);
    if (!definition) return { status: "error", message: "Unknown automation option." };
    const { client, user } = await requireAutomationControlManager(input.tenantId);
    const plan = await getAuthoritativeWorkspacePlan(client, input.tenantId);
    if (plan === null || plan === "free") return { status: "error", message: FREE_PLAN_LOCKED_MESSAGE };
    const mutablePayload = {
      requested: input.requested,
      client_visible: input.client_visible,
      owner_approved: input.owner_approved,
      activation_state: input.activation_state,
      test_evidence: input.test_evidence || null,
      rollback_plan: input.rollback_plan || null,
      provider_notes: input.provider_notes || null,
      updated_by: user.id,
    };
    const existing = await client
      .from("workspace_automation_controls")
      .select("id")
      .eq("tenant_id", input.tenantId)
      .eq("capability", input.capability)
      .maybeSingle();
    if (missing(existing.error?.code)) {
      return { status: "error", message: "Automation controls need their database migration before saving." };
    }
    if (existing.error) throw new Error("Save failed.");
    const result = existing.data
      ? await client
        .from("workspace_automation_controls")
        .update(mutablePayload)
        .eq("id", existing.data.id)
        .eq("tenant_id", input.tenantId)
        .select("id")
        .single()
      : await client
        .from("workspace_automation_controls")
        .insert({ tenant_id: input.tenantId, capability: input.capability, ...mutablePayload })
        .select("id")
        .single();
    if (missing(result.error?.code)) {
      return { status: "error", message: "Automation controls need their database migration before saving." };
    }
    if (result.error || !result.data) throw new Error("Save failed.");
    revalidatePath(`/workspaces/${input.tenantId}`, "layout");
    return { status: "success", message: `${definition.label} settings saved. Live provider actions still require the matching tested integration path.` };
  } catch (error) {
    unstable_rethrow(error);
    return { status: "error", message: "Unable to save automation settings. Check your access and try again." };
  }
}
