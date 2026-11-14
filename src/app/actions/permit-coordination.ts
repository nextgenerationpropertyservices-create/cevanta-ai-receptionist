"use server";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { uuidSchema } from "@/lib/server/authorization";
import { requirePermitWorkspace } from "@/lib/server/permits";
import type { ActionState } from "@/lib/server/action-state";

const input = z.object({ tenantId: uuidSchema, permitId: uuidSchema, sourceMessage: z.string().trim().min(1).max(20000) });
function extract(message: string, permitTitle: string) {
 const reference = message.match(/\b(?:reference|ref|request|ticket|case)\s*(?:number|no\.?|#)?\s*[:#-]?\s*([A-Z0-9][A-Z0-9-]{2,})\b/i)?.[1] ?? "";
 const dateText = message.match(/\b(20\d{2}[-/]\d{1,2}[-/]\d{1,2})\b/)?.[1]?.replaceAll("/", "-") ?? "";
 const extractedDate = /^20\d{2}-\d{1,2}-\d{1,2}$/.test(dateText) ? dateText : null;
 const lower = message.toLowerCase();
 const suggestedStatus = /scheduled|appointment|window/.test(lower) ? "Inspection or utility window provided" : /pending|unresolved|waiting|follow.?up/.test(lower) ? "Needs office follow-up" : "Needs office review";
 const subject = `Follow-up needed for ${permitTitle}${reference ? ` (${reference})` : ""}`;
 const body = `Hello,\n\nWe are following up on ${permitTitle}${reference ? `, reference ${reference}` : ""}${extractedDate ? `, dated ${extractedDate}` : ""}. Could you confirm the current status, next required step, and expected timing?\n\nThank you.`;
 return { reference, extractedDate, suggestedStatus, subject, body };
}
export async function createPermitCoordinationNote(_previous: ActionState, form: FormData): Promise<ActionState> {
 try {
  const parsed = input.safeParse({ tenantId: form.get("tenantId"), permitId: form.get("permitId"), sourceMessage: form.get("sourceMessage") });
  if (!parsed.success) return { status: "error", message: "Paste the forwarded message before saving." };
  const { client } = await requirePermitWorkspace(parsed.data.tenantId);
  const permit = await client.from("job_permits").select("title").eq("tenant_id", parsed.data.tenantId).eq("id", parsed.data.permitId).maybeSingle();
  if (permit.error || !permit.data) return { status: "error", message: "Permit not found." };
  const data = extract(parsed.data.sourceMessage, permit.data.title);
  const saved = await client.from("permit_coordination_notes").insert({ tenant_id: parsed.data.tenantId, permit_id: parsed.data.permitId, source_message: parsed.data.sourceMessage, extracted_reference: data.reference, extracted_date: data.extractedDate, suggested_status: data.suggestedStatus, draft_subject: data.subject, draft_body: data.body }).select("id").single();
  if (saved.error) return { status: "error", message: "The coordination note could not be saved." };
  revalidatePath(`/workspaces/${parsed.data.tenantId}/permits/${parsed.data.permitId}/coordination`);
  return { status: "success", message: "Source message saved and a follow-up draft was prepared." };
 } catch (error) { unstable_rethrow(error); return { status: "error", message: "The coordination note could not be saved." }; }
}
