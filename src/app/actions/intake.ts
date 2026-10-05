"use server";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { OFFICE_ROLES } from "@/lib/contracts";
import { leadSchema } from "@/lib/intake-validation";
import { requireMembership, uuidSchema } from "@/lib/server/authorization";
import type { ActionState } from "@/lib/server/action-state";

function recordId(form: FormData, field: string) {
  return uuidSchema.parse(form.get(field));
}
async function saveLead(form: FormData, editing: boolean): Promise<ActionState> {
  try {
    const tenantId = recordId(form, "tenantId");
    const { client } = await requireMembership(tenantId, OFFICE_ROLES);
    const targetId = recordId(form, editing ? "leadId" : "submissionId");
    const parsed = leadSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the form fields." };
    // Retry tokens are tenant-scoped and never overwrite an existing submission.
    if (!editing) {
      const existing = await client.from("leads").select("id").eq("tenant_id", tenantId).eq("submission_id", targetId).maybeSingle();
      if (existing.error?.code === "42P01" || existing.error?.code === "PGRST205") return { status: "error", message: "Lead intake needs its database migration before saving." };
      if (existing.error) throw new Error("Lookup failed.");
      if (existing.data) {
        revalidatePath(`/workspaces/${tenantId}/leads`);
        return { status: "success", message: "Lead already saved." };
      }
    }
    if (!editing && parsed.data.customer_id) {
      const parent = await client.from("customers").select("id").eq("tenant_id", tenantId).eq("id", parsed.data.customer_id).maybeSingle();
      if (parent.error || !parent.data) throw new Error("Invalid customer.");
    }
    const result = editing
      ? await client.from("leads").update({ name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone, description: parsed.data.description, priority: parsed.data.priority, status: parsed.data.status, follow_up_date: parsed.data.follow_up_date }).eq("tenant_id", tenantId).eq("id", targetId).select("id").single()
      : await client.from("leads").insert({ ...parsed.data, tenant_id: tenantId, submission_id: targetId }).select("id").single();
    if (!editing && result.error?.code === "23505") {
      const existing = await client.from("leads").select("id").eq("tenant_id", tenantId).eq("submission_id", targetId).maybeSingle();
      if (existing.error || !existing.data) throw new Error("Save failed.");
    } else {
      if (result.error?.code === "42P01" || result.error?.code === "PGRST205") return { status: "error", message: "Lead intake needs its database migration before saving." };
      if (result.error || !result.data) throw new Error("Save failed.");
    }
    revalidatePath(`/workspaces/${tenantId}/leads`);
    if (editing) revalidatePath(`/workspaces/${tenantId}/leads/${targetId}`);
    return { status: "success", message: "Lead saved successfully." };
  } catch (error) {
    unstable_rethrow(error);
    return { status: "error", message: "Unable to save this lead. Check your permissions and form values, then try again." };
  }
}
export async function createLead(_previous: ActionState, form: FormData): Promise<ActionState> { return saveLead(form, false); }
export async function updateLead(_previous: ActionState, form: FormData): Promise<ActionState> { return saveLead(form, true); }


