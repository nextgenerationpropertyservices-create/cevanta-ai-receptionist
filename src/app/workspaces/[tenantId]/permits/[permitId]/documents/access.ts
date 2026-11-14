import { notFound } from "next/navigation";
import { requirePermitWorkspace } from "@/lib/server/permits";
import { uuidSchema } from "@/lib/server/authorization";

export const maxDocumentBytes = 2 * 1024 * 1024;
export const documentCategories = {
  application: "Application",
  plan: "Plan or supporting document",
  credential: "Contractor credential",
  photo: "Photo",
  other: "Other",
};

export async function requireDocumentPermit(tenantId: string, permitId: string) {
  if (!uuidSchema.safeParse(tenantId).success || !uuidSchema.safeParse(permitId).success) notFound();
  const { client } = await requirePermitWorkspace(tenantId);
  const { data, error } = await client.from("job_permits").select("id,title")
    .eq("tenant_id", tenantId).eq("id", permitId).maybeSingle();
  if (error || !data) notFound();
  return { client, title: String(data.title) };
}
