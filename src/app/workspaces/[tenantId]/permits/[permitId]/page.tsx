import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { savePermit, savePermitOperations } from "@/app/actions/permits";
import { uuidSchema } from "@/lib/server/authorization";
import { requirePermitWorkspace } from "@/lib/server/permits";
import { permitStatusLabels, utilityStates, inspectionStates, type Permit, type PermitOperations } from "@/lib/permit-contracts";
import directory from "@/lib/permit-directory.json";
import { PermitFields } from "../permit-fields";
import { PermitPdf } from "../permit-pdf";

export default async function PermitDetail({params}:{params:Promise<{tenantId:string;permitId:string}>}){
 const {tenantId,permitId}=await params;
 const {client,tenant,user,role}=await requirePermitWorkspace(tenantId);
 if(!uuidSchema.safeParse(permitId).success) notFound();
 const {data,error}=await client.from("job_permits").select("*").eq("tenant_id",tenantId).eq("id",permitId).maybeSingle();
 if(error) return <p className="notice" role="alert">The permit could not be loaded. Refresh and try again.</p>;
 if(!data) notFound();
 const history=(role==="owner"||role==="admin")?await client.from("audit_events").select("id,action,created_at").eq("tenant_id",tenantId).eq("entity_type","job_permits").eq("entity_id",permitId).order("created_at",{ascending:false}).limit(30):null;
 const p=data as Permit & PermitOperations;
 const normalize=(name:string)=>name.toLowerCase().replace(/[,\s]+/g," ").trim();
 const starter=directory.find(x=>normalize(x.name)===normalize(p.jurisdiction));
 const overrides=await client.from("permit_ahj_overrides").select("ahj_id,profile").eq("tenant_id",tenantId);
 const match=overrides.data?.find(entry=>entry.ahj_id===starter?.id || (typeof entry.profile?.name==="string" && normalize(entry.profile.name)===normalize(p.jurisdiction)));
 const a=match?.profile??starter;
 const safeLink=(value:unknown)=>{
  if(typeof value!=="string") return null;
  try { const url=new URL(value); return ["http:","https:"].includes(url.protocol)&&!url.username&&!url.password?url.href:null; } catch { return null; }
 };
 const source=safeLink(a?.source),portal=safeLink(a?.portal),form=safeLink(a?.formUrl);
 const winchendon=starter?.id==="ahj-ma-winchendon";
 const recipient = winchendon && !match ? "afronte@winchendon-ma.gov" : "";
 const subject = encodeURIComponent(`Permit application – ${p.title}`);
 const body = encodeURIComponent(`Hello,\n\nPlease find the signed permit application for ${p.site} attached.\n\nScope of work\n${p.scope.slice(0, 1000)}\n\nPlease confirm receipt.\n\nThank you,\n${tenant.name}`);
 const filingDraft = `mailto:${recipient}?subject=${subject}&body=${body}`;
 return <><Link className="back-link" href={`/workspaces/${tenantId}/permits`}>← Permits</Link><div className="page-heading"><span className="eyebrow">{permitStatusLabels[p.status]}</span><h1>{p.title}</h1><p>{p.site} · {p.jurisdiction}</p><Link className="button secondary" href={`/workspaces/${tenantId}/permits/${p.id}/documents`}>Documents and filing packet</Link><Link className="button secondary" href={`/workspaces/${tenantId}/permits/${p.id}/coordination`}>Inspection and utility coordination</Link>{!tenant.permitdesk_only&&p.job_id&&<Link className="card-link" href={`/workspaces/${tenantId}/jobs/${p.job_id}`}>Open linked job ↗</Link>}</div>
 <section className="panel"><h2>File permit</h2><p>{a?.nextStep??"Confirm the official filing route with the permit office."}</p>{<>{source&&<a className="card-link" href={source} target="_blank" rel="noreferrer">Official instructions ↗</a>}{portal&&<p><a className="card-link" href={portal} target="_blank" rel="noreferrer">Open permit portal ↗</a></p>}{form&&<p><a className="card-link" href={form} target="_blank" rel="noreferrer">Official form ↗</a></p>}</>}
 {winchendon&&<PermitPdf site={p.site} scope={p.scope} firm={tenant.name} email={user.email??""}/>}
 <details><summary>Prepare filing email</summary>
  <p>Use this option if your jurisdiction accepts applications by email. Confirm the permit office address, attach the signed application and supporting documents, then send it from your email account.</p>
  <div className="button-row"><a className="button secondary" href={filingDraft}>Open draft in my email app</a><Link className="card-link" href={`/workspaces/${tenantId}/permits/${p.id}/documents`}>Open filing packet</Link></div>
  <p className="small muted">After sending, record the actual submission date below.</p>
 </details></section>
 <section className="panel" id="field-intake-files">
  <h2>Field intake files</h2>
  <form action={`/workspaces/${tenantId}/permits/${p.id}/documents/manage`} method="post" encType="multipart/form-data">
   <input type="hidden" name="operation" value="intake"/>
   <label className="field"><span>Photos and supporting files</span>
    <input name="file" type="file" multiple required accept=".jpg,.jpeg,.png,.webp,.heic,.heif,.pdf,.txt,.csv,.docx,.xlsx,.dwg,.dxf"/>
   </label>
   <p className="small muted">Select up to 10 files. Each file can be up to 2 MB. Keep each batch under 4 MB.</p>
   <button className="button" type="submit">Upload to permit</button>
  </form>
 </section>
 <section className="panel"><h2>Permit details and filing status</h2><p>Record submission only after filing. Update the permit number when the town issues it.</p><ActionForm key={p.updated_at} action={savePermit} hidden={{tenantId,permitId,revision:p.updated_at}} submitLabel="Save permit"><PermitFields permit={p}/></ActionForm></section>
 <section className="panel"><h2>Utility coordination and inspection</h2>
 <ActionForm key={p.updated_at+"-operations"} action={savePermitOperations} hidden={{tenantId,permitId,revision:p.updated_at}} submitLabel="Save coordination details">
 <details><summary>Intake, milestones, and field preparation</summary>
 <label className="field"><span>Parcel reference</span><input name="parcel" maxLength={1000} defaultValue={p.parcel??""}/></label>
 <label className="field"><span>Permit coordinator</span><input name="permit_coordinator" maxLength={1000} defaultValue={p.permit_coordinator??""}/></label>
 <label className="field"><span>Blocker or next action</span><input name="blocker" maxLength={1000} defaultValue={p.blocker??""}/></label>
 <label className="field"><span>Utility provider</span><input name="utility_provider" maxLength={1000} defaultValue={p.utility_provider??""}/></label>
 <label className="field"><span>Meter spot status</span><input name="meter_spot" maxLength={1000} defaultValue={p.meter_spot??""}/></label>
 <label className="field"><span>Inspection type</span><input name="inspection_type" maxLength={1000} defaultValue={p.inspection_type??""}/></label>
 <label className="field"><span>First inspection result</span><input name="first_inspection" maxLength={1000} defaultValue={p.first_inspection??""}/></label>
 <label className="field"><span>Load reviewed by</span><input name="load_reviewer" maxLength={1000} defaultValue={p.load_reviewer??""}/></label>
 <label className="field"><span>Photo checklist</span><input name="photo_checklist" maxLength={1000} defaultValue={p.photo_checklist??""}/></label>
 <label className="field"><span>Inspection preparation</span><input name="inspection_preparation" maxLength={1000} defaultValue={p.inspection_preparation??""}/></label>
 <label className="field"><span>Reviewed existing load (VA)</span><input name="existing_va" maxLength={1000} defaultValue={p.existing_va??""}/></label>
 <label className="field"><span>Reviewed added load (VA)</span><input name="added_va" maxLength={1000} defaultValue={p.added_va??""}/></label>
 <label className="field"><span>Reviewed minimum service (A)</span><input name="minimum_service" maxLength={1000} defaultValue={p.minimum_service??""}/></label>
 <label className="field"><span>Date issued</span><input name="issued_on" type="date" defaultValue={p.issued_on??""}/></label>
 <label className="field"><span>Expiration date</span><input name="expires_on" type="date" defaultValue={p.expires_on??""}/></label>
 <label className="field"><span>Target work date</span><input name="work_on" type="date" defaultValue={p.work_on??""}/></label>
 <label className="field"><span>Disconnect date</span><input name="disconnect_on" type="date" defaultValue={p.disconnect_on??""}/></label>
 <label className="field"><span>Reconnect date</span><input name="reconnect_on" type="date" defaultValue={p.reconnect_on??""}/></label>
 </details>
 <label className="field">Utility status<select name="utility_status" defaultValue={p.utility_status}>{Object.entries(utilityStates).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
 <label className="field">Utility work order or reference<input name="utility_reference" maxLength={160} defaultValue={p.utility_reference}/></label>
 <label className="field">Inspection status<select name="inspection_status" defaultValue={p.inspection_status}>{Object.entries(inspectionStates).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
 <label className="field">Inspection date<input name="inspection_date" type="date" defaultValue={p.inspection_date??""}/></label>
 <label className="field">Inspection notes and corrections<textarea name="inspection_notes" maxLength={4000} defaultValue={p.inspection_notes}/></label>
 </ActionForm></section>{history&&<section className="panel"><h2>Permit activity</h2>{history.error?<p role="alert">Activity is unavailable.</p>:history.data?.length?<ul>{history.data.map(event=><li key={event.id}>{event.action==="INSERT"?"Permit created":"Permit updated"} · <time dateTime={event.created_at}>{new Intl.DateTimeFormat("en-US",{dateStyle:"medium",timeStyle:"short",timeZone:tenant.timezone}).format(new Date(event.created_at))}</time></li>)}</ul>:<p>No recorded activity.</p>}</section>}</>;
}
