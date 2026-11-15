"use server";
import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { OFFICE_ROLES } from "@/lib/contracts";
import { leadSchema } from "@/lib/intake-validation";
import { requireMembership, uuidSchema } from "@/lib/server/authorization";
import type { ActionState } from "@/lib/server/action-state";
import { FREE_ACTIVE_LEAD_LIMIT, FREE_ACTIVE_LEAD_LIMIT_MESSAGE, isFreePlanLimitError } from "@/lib/workspace-plans";

function recordId(form: FormData, field: string) {
  return uuidSchema.parse(form.get(field));
}
const activeLeadStatuses = ["new", "contacted", "scheduled"] as const;
async function preflightFreeLeadCapacity(client: Awaited<ReturnType<typeof requireMembership>>["client"], tenantId: string, targetId: string, editing: boolean, nextStatus: string) {
  if (!activeLeadStatuses.includes(nextStatus as (typeof activeLeadStatuses)[number])) return false;
  if (editing) {
    const existing = await client.from("leads").select("status").eq("tenant_id", tenantId).eq("id", targetId).maybeSingle();
    if (existing.error || !existing.data) throw new Error("Lead lookup failed.");
    if (activeLeadStatuses.includes(existing.data.status as (typeof activeLeadStatuses)[number])) return false;
  }
  const tenant = await client.from("tenants").select("plan").eq("id", tenantId).single();
  if (tenant.error || !tenant.data) throw new Error("Plan lookup failed.");
  if (tenant.data.plan !== "free") return false;
  const usage = await client.from("leads").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).in("status", [...activeLeadStatuses]);
  if (usage.error) throw new Error("Lead usage lookup failed.");
  return (usage.count ?? 0) >= FREE_ACTIVE_LEAD_LIMIT;
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
    if (await preflightFreeLeadCapacity(client, tenantId, targetId, editing, parsed.data.status)) {
      return { status: "error", message: FREE_ACTIVE_LEAD_LIMIT_MESSAGE };
    }
    const result = editing
      ? await client.from("leads").update({ name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone, description: parsed.data.description, priority: parsed.data.priority, status: parsed.data.status, follow_up_date: parsed.data.follow_up_date }).eq("tenant_id", tenantId).eq("id", targetId).select("id").single()
      : await client.from("leads").insert({ ...parsed.data, tenant_id: tenantId, submission_id: targetId }).select("id").single();
    if (isFreePlanLimitError(result.error, "free_plan_active_lead_limit")) {
      return { status: "error", message: FREE_ACTIVE_LEAD_LIMIT_MESSAGE };
    }
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
export async function deleteLead(_previous: ActionState, form: FormData): Promise<ActionState> {
  try {
    const tenantId = recordId(form, "tenantId");
    const { client } = await requireMembership(tenantId, OFFICE_ROLES);
    const leadId = recordId(form, "leadId");
    const result = await client.from("leads").delete().eq("tenant_id", tenantId).eq("id", leadId).select("id").single();
    if (result.error?.code === "42P01" || result.error?.code === "PGRST205") return { status: "error", message: "Lead intake needs its database migration before deleting." };
    if (result.error?.code === "23503") return { status: "error", message: "This lead is linked to records that must be handled first. Remove or resolve the linked job or call record first." };
    if (result.error?.code === "42501" || result.error?.code === "PGRST301") return { status: "error", message: "Lead deletion is not enabled for this workspace yet. Apply the latest database migration, then try again." };
    if (result.error || !result.data) return { status: "error", message: "Unable to delete this lead. It may already be removed or linked to records that must be handled first." };
    revalidatePath(`/workspaces/${tenantId}/leads`);
    revalidatePath(`/workspaces/${tenantId}/notifications`);
    redirect(`/workspaces/${tenantId}/leads`);
  } catch (error) {
    unstable_rethrow(error);
    return { status: "error", message: "Unable to delete this lead. Check your permissions, then try again." };
  }
}
export async function archiveLead(_previous: ActionState, form: FormData): Promise<ActionState> {
  try {
    const tenantId = recordId(form, "tenantId");
    const { client } = await requireMembership(tenantId, OFFICE_ROLES);
    const leadId = recordId(form, "leadId");
    const result = await client.from("leads").update({ status: "closed" }).eq("tenant_id", tenantId).eq("id", leadId).select("id").single();
    if (result.error?.code === "42P01" || result.error?.code === "PGRST205") return { status: "error", message: "Lead intake needs its database migration before archiving." };
    if (result.error || !result.data) return { status: "error", message: "Unable to archive this lead. It may already be removed." };
    revalidatePath(`/workspaces/${tenantId}/leads`);
    revalidatePath(`/workspaces/${tenantId}`);
    revalidatePath(`/workspaces/${tenantId}/notifications`);
    redirect(`/workspaces/${tenantId}/leads`);
  } catch (error) {
    unstable_rethrow(error);
    return { status: "error", message: "Unable to archive this lead. Check your permissions, then try again." };
  }
}
