import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { savePermit } from "@/app/actions/permits";
import { uuidSchema } from "@/lib/server/authorization";
import { requirePermitWorkspace } from "@/lib/server/permits";
import { permitStatusLabels,type Permit } from "@/lib/permit-contracts";
import directory from "@/lib/permit-directory.json";
import { PermitFields } from "../permit-fields";
import { PermitPdf } from "../permit-pdf";

export default async function PermitDetail({params}:{params:Promise<{tenantId:string;permitId:string}>}){
 const {tenantId,permitId}=await params;
 const {client,tenant,user}=await requirePermitWorkspace(tenantId);
 if(!uuidSchema.safeParse(permitId).success) notFound();
 const {data,error}=await client.from("job_permits").select("*").eq("tenant_id",tenantId).eq("id",permitId).maybeSingle();
 if(error) return <p className="notice" role="alert">The permit could not be loaded. Refresh and try again.</p>;
 if(!data) notFound();
 const p=data as Permit;
 const normalize=(name:string)=>name.toLowerCase().replace(/[,\s]+/g," ").trim();
 const a=directory.find(x=>normalize(x.name)===normalize(p.jurisdiction));
 const winchendon=a?.id==="ahj-ma-winchendon";
 const filingDraft=winchendon?`mailto:afronte@winchendon-ma.gov?subject=${encodeURIComponent("Electrical permit application - "+p.title)}&body=${encodeURIComponent("Hello,\n\nPlease find the signed application for the electrical work at "+p.site+" attached. Please confirm receipt.\n\nThank you.")}`:null;
 return <><Link className="back-link" href={`/workspaces/${tenantId}/permits`}>← Permits</Link><div className="page-heading"><span className="eyebrow">{permitStatusLabels[p.status]}</span><h1>{p.title}</h1><p>{p.site} · {p.jurisdiction}</p>{!tenant.permitdesk_only&&p.job_id&&<Link className="card-link" href={`/workspaces/${tenantId}/jobs/${p.job_id}`}>Open linked job ↗</Link>}</div>
 <section className="panel"><h2>File permit</h2><p>{a?.nextStep??"Confirm the official filing route with the permit office."}</p>{a&&<><a className="card-link" href={a.source} target="_blank" rel="noreferrer">Official instructions ↗</a>{"portal" in a&&a.portal&&<p><a className="card-link" href={a.portal} target="_blank" rel="noreferrer">Open permit portal ↗</a></p>}{"formUrl" in a&&a.formUrl&&<p><a className="card-link" href={a.formUrl} target="_blank" rel="noreferrer">Official form ↗</a></p>}</>}
 {winchendon&&<><PermitPdf site={p.site} scope={p.scope} firm={tenant.name} email={user.email??""}/><p>Complete and sign the downloaded form. Attach it and any required documents before sending. Nothing is sent automatically.</p>{filingDraft&&<a className="button secondary" href={filingDraft}>Open filing email</a>}</>}</section>
 <section className="panel"><h2>Permit details and filing status</h2><p>Record submission only after filing. Update the permit number when the town issues it.</p><ActionForm key={p.updated_at} action={savePermit} hidden={{tenantId,permitId,revision:p.updated_at}} submitLabel="Save permit"><PermitFields permit={p}/></ActionForm></section></>;
}
