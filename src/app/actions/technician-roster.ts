"use server";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { SETTINGS_ROLES } from "@/lib/contracts";
import { requireMembership, uuidSchema } from "@/lib/server/authorization";
import { technicianRosterSchema } from "@/lib/technician-roster";
import type { ActionState } from "@/lib/server/action-state";
const missing=(code?:string)=>code === "42P01" || code === "PGRST205" || code === "42883";
const rawFields=(form:FormData)=>({...Object.fromEntries(form),skill_presets:form.getAll("skill_presets")});

export async function saveTechnicianRoster(_previous:ActionState,form:FormData):Promise<ActionState> {
 try {
  const parsed=technicianRosterSchema.safeParse(rawFields(form));
  if(!parsed.success) return {status:"error",message:parsed.error.issues[0]?.message ?? "Check the technician details."};
  const {client}=await requireMembership(parsed.data.tenantId,SETTINGS_ROLES);
  let linkedUserId:string|undefined;
  if(parsed.data.rosterId) {
   const existing=await client.from("technician_roster").select("linked_user_id").eq("tenant_id",parsed.data.tenantId).eq("id",parsed.data.rosterId).maybeSingle();
   if(existing.error || !existing.data) return {status:"error",message:"Technician roster entry not found."};
   linkedUserId=typeof existing.data.linked_user_id === "string" ? existing.data.linked_user_id : undefined;
  }
  const payload={display_name:parsed.data.display_name,skills:parsed.data.skills,service_areas:parsed.data.service_areas,availability_note:parsed.data.availability_note,availability_windows:parsed.data.availability_windows,...(parsed.data.email ? {email:parsed.data.email} : {})};
  const result=parsed.data.rosterId
   ? await client.from("technician_roster").update(payload).eq("tenant_id",parsed.data.tenantId).eq("id",parsed.data.rosterId).select("id").single()
   : await client.from("technician_roster").insert({...payload,email:parsed.data.email ?? null,tenant_id:parsed.data.tenantId}).select("id").single();
  if(linkedUserId) {
   const profile=await client.from("technician_profiles").update({skills:parsed.data.skills,service_areas:parsed.data.service_areas,availability_note:parsed.data.availability_note,availability_windows:parsed.data.availability_windows}).eq("tenant_id",parsed.data.tenantId).eq("user_id",linkedUserId);
   if(profile.error) throw new Error("Technician profile sync failed.");
  }  if(missing(result.error?.code)) return {status:"error",message:"Technician roster needs its database migration before saving."};
  if(result.error || !result.data) throw new Error("Technician roster save failed.");
  revalidatePath(`/workspaces/${parsed.data.tenantId}/technicians`);
  return {status:"success",message:parsed.data.rosterId ? "Technician details updated." : "Technician added to the roster. Link an email when the account is ready."};
 } catch(error) { unstable_rethrow(error); return {status:"error",message:"Unable to save this technician. Check permissions and try again."}; }
}

export async function linkTechnicianRoster(_previous:ActionState,form:FormData):Promise<ActionState> {
 try {
  const tenantId=uuidSchema.parse(form.get("tenantId"));
  const rosterId=uuidSchema.parse(form.get("rosterId"));
  const email=String(form.get("email") ?? "").trim().toLowerCase();
  if(!/^\S+@\S+\.\S+$/.test(email) || email.length>254) return {status:"error",message:"Enter the confirmed Cevanta account email."};
  const {client}=await requireMembership(tenantId,SETTINGS_ROLES);
  const result=await client.rpc("link_technician_roster",{input:{tenant_id:tenantId,roster_id:rosterId,email}});
  if(missing(result.error?.code)) return {status:"error",message:"Technician linking needs its database migration before it can be used."};
  if(result.error) throw new Error("Technician link failed.");
  const status=(result.data as {status?:string}|null)?.status;
  if(status === "linked") {
   revalidatePath(`/workspaces/${tenantId}/technicians`); revalidatePath(`/workspaces/${tenantId}/jobs`); revalidatePath(`/workspaces/${tenantId}/calendar`);
   return {status:"success",message:"Technician linked. They are now available for job assignment."};
  }
  if(status === "account_not_found") return {status:"error",message:"That email must belong to a confirmed Cevanta account first."};
  if(status === "protected_account") return {status:"error",message:"Owner and admin accounts cannot be converted into technicians."};
  if(status === "already_linked") return {status:"error",message:"That account is already linked to another technician record."};
  if(status === "not_found") return {status:"error",message:"Technician roster entry not found."};
  return {status:"error",message:"Unable to link this technician. Check the email and try again."};
 } catch(error) { unstable_rethrow(error); return {status:"error",message:"Unable to link this technician. Check permissions and try again."}; }
}