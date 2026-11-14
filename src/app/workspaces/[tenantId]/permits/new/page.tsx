import Link from "next/link";
import { notFound,redirect } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { savePermit } from "@/app/actions/permits";
import { uuidSchema } from "@/lib/server/authorization";
import { permitJobSeed,requirePermitWorkspace } from "@/lib/server/permits";
import { PermitFields } from "../permit-fields";

export default async function NewPermit({params,searchParams}:{params:Promise<{tenantId:string}>;searchParams:Promise<{job?:string}>}){
 const {tenantId}=await params;
 const {job}=await searchParams;
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
 return <><Link className="back-link" href={base}>← Permits</Link><div className="page-heading"><h1>New permit</h1><p>{job?"Review the details copied from your job before saving.":"Start a permit record for this workspace."}</p></div><section className="panel"><ActionForm action={savePermit} hidden={{tenantId,...(job?{jobId:job}:{})}} submitLabel="Create permit"><PermitFields permit={defaults}/></ActionForm></section></>;
}
