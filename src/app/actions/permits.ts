"use server";
import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { permitFields, permitTracking } from "@/lib/permit-contracts";
import { uuidSchema } from "@/lib/server/authorization";
import { permitJobSeed, requirePermitWorkspace } from "@/lib/server/permits";
import type { ActionState } from "@/lib/server/action-state";

export async function savePermit(_prev:ActionState,form:FormData):Promise<ActionState>{
 try {
  const tenantId=uuidSchema.parse(form.get("tenantId"));
  const {client,tenant}=await requirePermitWorkspace(tenantId);
  const values=Object.fromEntries(form);
  const fields=permitFields.safeParse(values);
  if (!fields.success) return {status:"error",message:"Enter a project name, service address, jurisdiction, and scope within the field limits."};
  const base=`/workspaces/${tenantId}/permits`;
  if (values.permitId){
   const id=uuidSchema.parse(values.permitId);
   const revision=String(values.revision??"");
   if (!revision || !Number.isFinite(Date.parse(revision))) return {status:"error",message:"Reopen this permit before saving."};
   const tracking=permitTracking(new Intl.DateTimeFormat("en-CA",{timeZone:tenant.timezone,year:"numeric",month:"2-digit",day:"2-digit"}).format()).safeParse(values);
   if (!tracking.success) return {status:"error",message:tracking.error.issues[0]?.message??"Check filing details."};
   const t=tracking.data;
   const {data,error}=await client.from("job_permits").update({...fields.data,...t,submitted_on:t.submitted_on||null,next_followup:t.next_followup||null}).eq("tenant_id",tenantId).eq("id",id).eq("updated_at",revision).select("id").maybeSingle();
   if (error||!data) return {status:"error",message:"The permit could not be saved. Reopen it to check whether it was updated elsewhere."};
   revalidatePath(base);revalidatePath(`${base}/${id}`);
   return {status:"success",message:"Permit saved."};
  }
  const jobId=values.jobId?uuidSchema.parse(values.jobId):null;
  if(jobId&&!await permitJobSeed(client,tenantId,jobId)) return {status:"error",message:"That job is unavailable in this workspace."};
  const {data,error}=await client.from("job_permits").insert({...fields.data,tenant_id:tenantId,job_id:jobId}).select("id").single();
  if(error?.code==="23505"&&jobId){
   const existing=await client.from("job_permits").select("id").eq("tenant_id",tenantId).eq("job_id",jobId).maybeSingle();
   if(existing.data) redirect(`${base}/${existing.data.id}`);
  }
  if(error||!data) return {status:"error",message:"Unable to create the permit. Check workspace access and try again."};
  revalidatePath(base);
  redirect(`${base}/${data.id}`);
 }catch(error){
  unstable_rethrow(error);
  return {status:"error",message:"Could not save the permit. Check your access and try again."};
 }
}
