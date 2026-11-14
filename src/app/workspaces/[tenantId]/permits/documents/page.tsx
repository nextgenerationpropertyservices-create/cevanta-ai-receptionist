import Link from "next/link";
import { requirePermitWorkspace } from "@/lib/server/permits";
export default async function PermitDocumentsIndex({params}:{params:Promise<{tenantId:string}>}){
 const {tenantId}=await params; const {client}=await requirePermitWorkspace(tenantId); const base=`/workspaces/${tenantId}/permits`;
 const permits=await client.from("job_permits").select("id,title,site").eq("tenant_id",tenantId).order("updated_at",{ascending:false}).limit(200);
 const docs=await client.from("permit_documents").select("permit_id,label,category,created_at").eq("tenant_id",tenantId).order("created_at",{ascending:false}).limit(500);
 const byPermit=new Map<string,number>(); for(const doc of docs.data??[]) byPermit.set(doc.permit_id,(byPermit.get(doc.permit_id)??0)+1;
 const cards = permits.data ?? [];
 return <>
  <nav className="permitdesk-subnav" aria-label="PermitDesk"><Link href={base}>Overview</Link><Link href={base+"?view=queue"}>Permit Queue</Link><Link href={base+"?view=field"}>Field Intake</Link><Link href={base+"?view=utility"}>Utility Coordination</Link><Link href={base+"?view=inspections"}>Inspections</Link><Link href={base+"?view=closeout"}>Closeout</Link><Link href={base+"/library#jurisdictions"}>AHJ Matrix</Link><Link href={base+"/library#templates"}>Scope Templates</Link><Link aria-current="page" href={base+"/documents"}>Documents</Link></nav>
  <div className="page-heading"><span className="eyebrow">PERMITDESK</span><h1>Documents</h1><p>Review filing packets and supporting documents by permit.</p></div>
  <section className="panel">{permits.error || docs.error ? <p role="alert">Documents are unavailable. Refresh and try again.</p> : cards.length ? <div className="stat-grid">{cards.map(permit => <article className="panel" key={permit.id}><h2>{permit.title}</h2><p className="small muted">{permit.site}</p><strong>{byPermit.get(permit.id) ?? 0} document{byPermit.get(permit.id) === 1 ? "" : "s"}</strong><p><Link className="card-link" href={`${base}/${permit.id}/documents`}>Open filing packet ↗</Link></p></article>)}</div> : <p>No permits yet.</p>}</section>
 </>;
}
