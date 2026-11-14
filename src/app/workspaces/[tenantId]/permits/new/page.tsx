import Link from "next/link";
import { notFound,redirect } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { savePermit } from "@/app/actions/permits";
import { uuidSchema } from "@/lib/server/authorization";
import { permitJobSeed,requirePermitWorkspace } from "@/lib/server/permits";
import { PermitFields } from "../permit-fields";

export default async function NewPermit({params,searchParams}:{params:Promise<{tenantId:string}>;searchParams:Promise<{job?:string;template?:string}>}){
 const {tenantId}=await params;
 const {job,template}=await searchParams;
 const {client}=await requirePermitWorkspace(tenantId);
 const base=`/workspaces/${tenantId}/permits`;
 let defaults;
 if(job!==undefined){
  if(!uuidSchema.safeParse(job).success) notFound();
  const seed=await permitJobSeed(client,tenantId,job);
  if(!seed) notFound();
  const existing=await client.from("job_permits").select("id").eq("tenant_id",tenantId).eq("job_id",job).maybeSingle();
  if(existing.data) redirect(`${base}/${existing.data.id}`);
  defaults=seed;
 }
 const templates=await client.from("permit_scope_templates").select("id,name,scope").eq("tenant_id",tenantId).order("name");
 const chosen=templates.data?.find(entry=>entry.id===template);
 if(chosen) defaults={...defaults,scope:chosen.scope};
 const profiles = await client.from("permit_ahj_overrides").select("profile").eq("tenant_id", tenantId);
 const jurisdictions = (profiles.data ?? []).flatMap(({ profile }) => typeof profile?.name === "string" ? [profile.name] : []);
 return <><Link className="back-link" href={base}>← Permits</Link><div className="page-heading"><h1>New permit</h1><p>{job?"Review the details copied from your job before saving.":"Start a permit record for this workspace."}</p></div><section className="panel">{!!templates.data?.length&&<form>{job&&<input type="hidden" name="job" value={job}/>}<label className="field"><span>Start with a scope template</span><select name="template" defaultValue={chosen?.id??""}><option value="">No template</option>{templates.data.map(entry=><option key={entry.id} value={entry.id}>{entry.name}</option>)}</select></label><button className="button secondary" type="submit">Apply template</button></form>}<ActionForm action={savePermit} hidden={{tenantId,...(job?{jobId:job}:{})}} submitLabel="Create permit"><PermitFields key={chosen?.id ?? "default"} permit={defaults} jurisdictions={jurisdictions}/></ActionForm><Link className="card-link" href={base+"/library#jurisdictions"}>Add or manage reusable jurisdictions</Link></section></>;
}
