import Link from "next/link";
import { requirePermitWorkspace } from "@/lib/server/permits";
import { permitStatusLabels, type Permit } from "@/lib/permit-contracts";

export default async function PermitsPage({params}:{params:Promise<{tenantId:string}>}){
 const {tenantId}=await params;
 const {client}=await requirePermitWorkspace(tenantId);
 const {data,error}=await client.from("job_permits").select("id,title,site,jurisdiction,status,next_followup").eq("tenant_id",tenantId).order("updated_at",{ascending:false}).limit(200);
 const base=`/workspaces/${tenantId}/permits`;
 const permits=(data??[]) as Pick<Permit,"id"|"title"|"site"|"jurisdiction"|"status"|"next_followup">[];
 return <><div className="page-heading"><span className="eyebrow">PERMITDESK</span><h1>Permits</h1><p>Prepare applications and track filings inside your Cevanta workspace.</p><Link className="button" href={`${base}/new`}>New permit</Link></div>
 <section className="panel"><h2>Permit queue</h2>{error?<p role="alert">The permit queue is unavailable. Refresh and try again.</p>:permits.length===0?<p>No permits yet. Start here or use Create permit on a job to copy its details.</p>:<ul>{permits.map(p=><li key={p.id}><Link className="card-link" href={`${base}/${p.id}`}>{p.title}</Link><p className="small muted">{p.site} · {p.jurisdiction} · {permitStatusLabels[p.status]}{p.next_followup?` · Follow-up ${p.next_followup}`:""}</p></li>)}</ul>}</section></>;
}
