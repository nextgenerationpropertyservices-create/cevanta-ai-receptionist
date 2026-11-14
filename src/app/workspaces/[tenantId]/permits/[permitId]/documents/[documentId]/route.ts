import { notFound } from "next/navigation";
import { uuidSchema } from "@/lib/server/authorization";
import { maxDocumentBytes, requireDocumentPermit } from "../access";

export async function GET(_request: Request, context: { params: Promise<{ tenantId: string; permitId: string; documentId: string }> }) {
  const { tenantId, permitId, documentId } = await context.params;
  if (!uuidSchema.safeParse(documentId).success) notFound();
  const { client } = await requireDocumentPermit(tenantId, permitId);
  const { data, error } = await client.from("permit_documents").select("filename,content")
    .eq("tenant_id", tenantId).eq("permit_id", permitId).eq("id", documentId).maybeSingle();
  if (error || !data?.filename || typeof data.content !== "string" ||
    data.content.length > maxDocumentBytes * 2 + 2 || !/^\\x(?:[\da-f]{2})+$/i.test(data.content)) notFound();
  const filename = String(data.filename).replace(/[^a-zA-Z0-9_. -]/g, "_");
  return new Response(Uint8Array.from(Buffer.from(data.content.slice(2), "hex")), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
