"use server";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { OFFICE_ROLES } from "@/lib/contracts";
import { jobSchema } from "@/lib/jobs-validation";
import { requireMembership, uuidSchema } from "@/lib/server/authorization";
import type { ActionState } from "@/lib/server/action-state";
const missing=(code?:string)=>code === "42P01" || code === "PGRST205";
async function saveJob(form:FormData,editing:boolean):Promise<ActionState> {
 try {
  const tenantId=uuidSchema.parse(form.get("tenantId"));
  const {client}=await requireMembership(tenantId,OFFICE_ROLES);
  const targetId=uuidSchema.parse(form.get(editing ? "jobId" : "submissionId"));
  const parsed=jobSchema.safeParse(Object.fromEntries(form));
  if(!parsed.success) return {status:"error",message:parsed.error.issues[0]?.message??"Check the form fields."};
  const fields=parsed.data;
  if(!editing) {
   const replay=await client.from("jobs").select("id").eq("tenant_id",tenantId).eq("submission_id",targetId).maybeSingle();
   if(missing(replay.error?.code)) return {status:"error",message:"Jobs need their database migration before saving."};
   if(replay.error) throw new Error("Lookup failed.");
   if(replay.data) {revalidatePath(`/workspaces/${tenantId}/jobs`);return {status:"success",message:"Job already saved."};}
   if(fields.lead_id) {
    const lead=await client.from("leads").select("id,customer_id").eq("tenant_id",tenantId).eq("id",fields.lead_id).maybeSingle();
    if(lead.error || !lead.data || (lead.data.customer_id && lead.data.customer_id !== fields.customer_id)) throw new Error("Invalid lead.");
    const converted=await client.from("jobs").select("id").eq("tenant_id",tenantId).eq("lead_id",fields.lead_id).maybeSingle();
    if(converted.error) throw new Error("Lookup failed.");
    if(converted.data) {revalidatePath(`/workspaces/${tenantId}/jobs`);return {status:"success",message:"Lead already has a job."};}
   }
   if(fields.customer_id) {
    const parent=await client.from("customers").select("id").eq("tenant_id",tenantId).eq("id",fields.customer_id).maybeSingle();
    if(parent.error || !parent.data) throw new Error("Invalid customer.");
   }
   if(fields.service_location_id) {
    if(!fields.customer_id) throw new Error("Customer required.");
    const parent=await client.from("service_locations").select("id").eq("tenant_id",tenantId).eq("customer_id",fields.customer_id).eq("id",fields.service_location_id).maybeSingle();
    if(parent.error || !parent.data) throw new Error("Invalid location.");
   }
  }
  if(fields.assigned_user_id) {
   const roster=await client.rpc("get_tenant_technicians",{target:tenantId});
   if(roster.error || !(roster.data??[]).some((item:{user_id:string})=>item.user_id===fields.assigned_user_id)) throw new Error("Invalid technician.");
  }
  const result=editing
   ? await client.from("jobs").update({title:fields.title,description:fields.description,status:fields.status,priority:fields.priority,scheduled_date:fields.scheduled_date,assigned_user_id:fields.assigned_user_id}).eq("tenant_id",tenantId).eq("id",targetId).select("id").single()
   : await client.from("jobs").insert({...fields,tenant_id:tenantId,submission_id:targetId}).select("id").single();
  if(!editing && result.error?.code === "23505") {
   let replay=await client.from("jobs").select("id").eq("tenant_id",tenantId).eq("submission_id",targetId).maybeSingle();
   if(replay.error) throw new Error("Lookup failed.");
   if(!replay.data && fields.lead_id) replay=await client.from("jobs").select("id").eq("tenant_id",tenantId).eq("lead_id",fields.lead_id).maybeSingle();
   if(replay.error || !replay.data) throw new Error("Save failed.");
  } else {
   if(missing(result.error?.code)) return {status:"error",message:"Jobs need their database migration before saving."};
   if(result.error || !result.data) throw new Error("Save failed.");
  }
  if(!editing && fields.lead_id) {
   const leadStatus = fields.status === "scheduled" ? "scheduled" : "contacted";
   const leadUpdate = await client.from("leads").update({status:leadStatus}).eq("tenant_id",tenantId).eq("id",fields.lead_id).select("id").single();
   if(leadUpdate.error || !leadUpdate.data) throw new Error("Lead status update failed.");
   revalidatePath(`/workspaces/${tenantId}/leads`);
   revalidatePath(`/workspaces/${tenantId}/leads/${fields.lead_id}`);
  }
  revalidatePath(`/workspaces/${tenantId}/jobs`);
  if(editing) revalidatePath(`/workspaces/${tenantId}/jobs/${targetId}`);
  return {status:"success",message:"Job saved successfully."};
 } catch(error) {
  unstable_rethrow(error);
  return {status:"error",message:"Unable to save this job. Check your permissions and form values, then try again."};
 }
}
export async function createJob(_previous:ActionState,form:FormData):Promise<ActionState>{return saveJob(form,false);}
export async function updateJob(_previous:ActionState,form:FormData):Promise<ActionState>{return saveJob(form,true);}
