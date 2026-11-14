import { NextResponse } from "next/server";
import { uuidSchema } from "@/lib/server/authorization";
import { documentCategories, maxDocumentBytes, requireDocumentPermit } from "../access";

const maxRequestBytes = 4 * 1024 * 1024;

async function readForm(request: Request) {
  const length = request.headers.get("content-length");
  if (length !== null && Number(length) > maxRequestBytes) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  const parts: ArrayBuffer[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > maxRequestBytes) {
      await reader.cancel();
      return null;
    }
    parts.push(Uint8Array.from(value).buffer);
  }
  return new Response(new Blob(parts), { headers: { "content-type": request.headers.get("content-type") ?? "" } }).formData();
}

export async function POST(request: Request, context: { params: Promise<{ tenantId: string; permitId: string }> }) {
  const url = new URL(request.url);
  if (request.headers.get("origin") !== url.origin) return new Response(null, { status: 403 });
  const { tenantId, permitId } = await context.params;
  const { client } = await requireDocumentPermit(tenantId, permitId);
  const back = (result: string) => {
    const path = new URL(`/workspaces/${tenantId}/permits/${permitId}/documents`, url);
    path.searchParams.set("result", result);
    return NextResponse.redirect(path, 303);
  };
  const form = await readForm(request).catch(() => null);
  if (!form) return back("invalid");
  const operation = form.get("operation");
  if (operation === "intake") {
    const files = form.getAll("file");
    if (!files.length || files.length > 10) return back("invalid");
    const rows = [];
    for (const file of files) {
      if (!(file instanceof File) || !file.size || file.size > maxDocumentBytes) return back("invalid");
      const filename = file.name.replace(/[\x00-\x1f\x7f/\\]/g, "_");
      if (filename.length > 150 || !/\.(pdf|jpe?g|png|webp|heic|heif|txt|csv|docx|xlsx|dwg|dxf)$/i.test(filename)) return back("invalid");
      rows.push({
        tenant_id: tenantId, permit_id: permitId, label: filename.slice(0, 120),
        category: /\.(jpe?g|png|webp|heic|heif)$/i.test(filename) ? "photo" : "other",
        filename, content: "\\x" + Buffer.from(await file.arrayBuffer()).toString("hex"),
      });
    }
    const { error } = await client.from("permit_documents").insert(rows);
    return back(error ? "failed" : "saved");
  }
  if (operation === "remove" || operation === "packet") {
    const id = uuidSchema.safeParse(form.get("documentId"));
    if (!id.success) return back("invalid");
    const change = operation === "remove"
      ? client.from("permit_documents").delete()
      : client.from("permit_documents").update({ include_in_packet: form.get("include") === "true" });
    const { data, error } = await change
      .eq("tenant_id", tenantId).eq("permit_id", permitId).eq("id", id.data).select("id").maybeSingle();
    return back(error || !data ? "failed" : operation === "remove" ? "removed" : "packet");
  }
  const label = String(form.get("label") ?? "").trim();
  const category = String(form.get("category") ?? "");
  if (!label || label.length > 120 || !Object.hasOwn(documentCategories, category)) return back("invalid");
  const file = form.get("file");
  let attachment: { filename: string; content: string } | undefined;
  if (file instanceof File && file.name) {
    const filename = file.name.replace(/[\x00-\x1f\x7f/\\]/g, "_");
    if (!file.size || file.size > maxDocumentBytes || filename.length > 150 ||
      !/\.(pdf|jpe?g|png|webp)$/i.test(filename)) return back("invalid");
    attachment = { filename, content: "\\x" + Buffer.from(await file.arrayBuffer()).toString("hex") };
  }
  const { error } = await client.from("permit_documents").insert({
    tenant_id: tenantId, permit_id: permitId, label, category,
    include_in_packet: form.get("include") === "on", ...attachment,
  });
  return back(error ? "failed" : "saved");
}
