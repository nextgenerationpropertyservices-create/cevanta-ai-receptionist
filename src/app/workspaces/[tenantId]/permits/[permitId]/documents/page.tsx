import Link from "next/link";
import { documentCategories, requireDocumentPermit } from "./access";

const results: Record<string, string> = {
  invalid: "Enter a title and choose a PDF or image no larger than 2 MB.",
  failed: "The change could not be saved. Refresh and try again.",
  saved: "Document added.",
  removed: "Document removed.",
  packet: "Filing packet list updated.",
};

export default async function PermitDocuments({
  params, searchParams,
}: {
  params: Promise<{ tenantId: string; permitId: string }>;
  searchParams: Promise<{ result?: string }>;
}) {
  const { tenantId, permitId } = await params;
  const { result } = await searchParams;
  const { client, title } = await requireDocumentPermit(tenantId, permitId);
  const base = `/workspaces/${tenantId}/permits/${permitId}`;
  const manage = base + "/documents/manage";
  const { data, error } = await client.from("permit_documents").select("id,label,category,filename,include_in_packet")
    .eq("tenant_id", tenantId).eq("permit_id", permitId).order("created_at", { ascending: true });
  const packet = data?.filter((document) => document.include_in_packet);
  return <>
    <Link className="back-link" href={base}>← Back to permit</Link>
    <div className="page-heading"><h1>Permit documents</h1><p>{title}</p></div>
    {result && Object.hasOwn(results, result) && <p className="notice" role="status">{results[result]}</p>}
    <section className="panel">
      <h2>Add a document</h2>
      <p>Upload a PDF or image up to 2 MB, or add a reference to an item your office keeps separately.</p>
      <form method="post" action={manage} encType="multipart/form-data">
        <label className="field"><span>Document title</span><input name="label" required maxLength={120} /></label>
        <label className="field"><span>Category</span><select name="category">
          {Object.entries(documentCategories).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select></label>
        <label className="field"><span>Attachment (optional)</span><input name="file" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" /></label>
        <p><label><input type="checkbox" name="include" /> Include in filing packet list</label></p>
        <button className="button" type="submit">Add document</button>
      </form>
    </section>
    <section className="panel">
      <h2>Saved documents</h2>
      {error ? <p role="alert">Documents could not be loaded. Refresh and try again.</p> : data?.length ? <ul>
        {data.map((document) => <li key={document.id}>
          <strong>{document.label}</strong> · {documentCategories[document.category as keyof typeof documentCategories]} · {document.filename ?
            <a href={`${base}/documents/${document.id}`}>Download {document.filename}</a> : "Reference only"}
          <form method="post" action={manage}>
            <input type="hidden" name="operation" value="packet" />
            <input type="hidden" name="documentId" value={document.id} />
            <input type="hidden" name="include" value={String(!document.include_in_packet)} />
            <button className="button secondary" type="submit">{document.include_in_packet ? "Remove from packet" : "Add to packet"}</button>
          </form>
          <form method="post" action={manage}>
            <input type="hidden" name="operation" value="remove" />
            <input type="hidden" name="documentId" value={document.id} />
            <button className="button secondary" type="submit" aria-label={`Remove ${document.label}`}>Remove</button>
          </form>
        </li>)}
      </ul> : <p>No documents added yet.</p>}
    </section>
    {!error && <section className="panel">
      <h2>Filing packet list</h2>
      <p>Review this list against the permit office’s instructions. Download each required file and assemble the packet for manual filing.</p>
      {packet?.length ? <ul>{packet.map((document) => <li key={document.id}>{document.label} · {document.filename ?
        <a href={`${base}/documents/${document.id}`}>Download</a> : "Collect separately"}</li>)}</ul> : <p>No documents selected for filing.</p>}
    </section>}
  </>;
}
