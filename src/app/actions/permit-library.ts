"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/lib/server/action-state";
import { uuidSchema } from "@/lib/server/authorization";
import { requirePermitWorkspace } from "@/lib/server/permits";

const templateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  permit_kind: z.string().trim().max(80),
  scope: z.string().trim().min(1).max(4000),
});

const ahjIdSchema = z.string().regex(/^[a-z0-9-]{1,80}$/);
const text = z.string().trim().max(1000).default("");
const url = z.union([
  z.literal(""),
  z.url({ protocol: /^https?$/ }).max(500).refine((value) => {
    const parsed = new URL(value);
    return !parsed.username && !parsed.password;
  }),
]).default("");
const ahjSchema = z.object({
  name: z.string().trim().min(1).max(160),
  nec: text,
  channel: text,
  routeStatus: text,
  nextStep: text,
  inspectionNotes: text,
  formUrl: url,
  relatedUrl: url,
  relatedLabel: text,
  portal: url,
  payments: text,
  turn: text,
  contact: text,
  vault: text,
  source: url,
  verified: z.union([z.literal(""), z.iso.date()]).default(""),
  thresholds: text,
  plans: text,
  formats: text,
  amendments: text,
});

function result(status: "success" | "error", message: string): ActionState {
  return { status, message };
}

function refreshLibrary(tenantId: string) {
  const base = "/workspaces/" + tenantId + "/permits";
  revalidatePath(base + "/library");
  revalidatePath(base + "/new");
  revalidatePath("/workspaces/[tenantId]/permits/[permitId]", "page");
}

export async function savePermitTemplate(_previous: ActionState, form: FormData): Promise<ActionState> {
  try {
    const tenantId = uuidSchema.parse(form.get("tenantId"));
    const { client } = await requirePermitWorkspace(tenantId);
    const fields = templateSchema.safeParse(Object.fromEntries(form));
    if (!fields.success) return result("error", "Enter a template name and scope within the field limits.");
    const templateId = form.get("templateId");
    const response = templateId
      ? await client.from("permit_scope_templates").update(fields.data)
        .eq("tenant_id", tenantId).eq("id", uuidSchema.parse(templateId))
        .eq("updated_at", z.iso.datetime({ offset: true }).parse(form.get("revision")))
        .select("id").maybeSingle()
      : await client.from("permit_scope_templates").insert({ ...fields.data, tenant_id: tenantId })
        .select("id").single();
    if (response.error?.code === "23505") return result("error", "That template name is already in use.");
    if (response.error || !response.data) return result("error", "Reopen the library and check for newer changes.");
    refreshLibrary(tenantId);
    return result("success", "Scope template saved.");
  } catch (error) {
    unstable_rethrow(error);
    return result("error", "Could not save the scope template.");
  }
}

export async function savePermitJurisdiction(_previous: ActionState, form: FormData): Promise<ActionState> {
  try {
    const tenantId = uuidSchema.parse(form.get("tenantId"));
    const { client } = await requirePermitWorkspace(tenantId);
    const fields = ahjSchema.safeParse(Object.fromEntries(form));
    if (!fields.success) return result("error", "Check the jurisdiction name, verification date, and website links.");
    const ahjId = ahjIdSchema.parse(form.get("ahjId") || "custom-" + crypto.randomUUID());
    const revision = form.get("revision");
    const response = revision
      ? await client.from("permit_ahj_overrides").update({ profile: fields.data })
        .eq("tenant_id", tenantId).eq("ahj_id", ahjId)
        .eq("updated_at", z.iso.datetime({ offset: true }).parse(revision))
        .select("ahj_id").maybeSingle()
      : await client.from("permit_ahj_overrides").insert({ tenant_id: tenantId, ahj_id: ahjId, profile: fields.data })
        .select("ahj_id").single();
    if (response.error || !response.data) return result("error", "Reopen the library and check for newer changes.");
    refreshLibrary(tenantId);
    return result("success", "Jurisdiction profile saved.");
  } catch (error) {
    unstable_rethrow(error);
    return result("error", "Could not save the jurisdiction profile.");
  }
}

export async function removePermitLibraryEntry(_previous: ActionState, form: FormData): Promise<ActionState> {
  try {
    const tenantId = uuidSchema.parse(form.get("tenantId"));
    const { client } = await requirePermitWorkspace(tenantId);
    const revision = z.iso.datetime({ offset: true }).parse(form.get("revision"));
    if (form.get("confirm") !== "yes") return result("error", "Confirm the removal first.");
    const templateId = form.get("templateId");
    const response = templateId
      ? await client.from("permit_scope_templates").delete().eq("tenant_id", tenantId)
        .eq("id", uuidSchema.parse(templateId)).eq("updated_at", revision).select("id").maybeSingle()
      : await client.from("permit_ahj_overrides").delete().eq("tenant_id", tenantId)
        .eq("ahj_id", ahjIdSchema.parse(form.get("ahjId"))).eq("updated_at", revision).select("ahj_id").maybeSingle();
    if (response.error || !response.data) return result("error", "Reopen the library and check for newer changes.");
    refreshLibrary(tenantId);
    return result("success", "Library entry removed.");
  } catch (error) {
    unstable_rethrow(error);
    return result("error", "Could not remove the library entry.");
  }
}

