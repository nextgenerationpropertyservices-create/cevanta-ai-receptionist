"use server";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { SETTINGS_ROLES } from "@/lib/contracts";
import { technicianProfileSchema } from "@/lib/technician-profiles";
import { requireMembership } from "@/lib/server/authorization";
import type { ActionState } from "@/lib/server/action-state";

export async function saveTechnicianProfile(_previous:ActionState,form:FormData):Promise<ActionState> {
 try {
  const parsed=technicianProfileSchema.safeParse(Object.fromEntries(form));
  if(!parsed.success) return {status:"error",message:parsed.error.issues[0]?.message ?? "Check technician skills and availability."};
  const {tenantId,userId,skills,availability_note}=parsed.data;
  const {client}=await requireMembership(tenantId,SETTINGS_ROLES);
  const team=await client.rpc("get_tenant_team",{target:tenantId});
  if(team.error) throw new Error("Technician directory check failed.");
  const isTechnician=((team.data ?? []) as Array<{user_id:string;role:string}>).some(member=>member.user_id===userId && member.role==="technician");
  if(!isTechnician) return {status:"error",message:"Choose an active technician before saving skills."};
  const result=await client.from("technician_profiles").upsert({tenant_id:tenantId,user_id:userId,skills,availability_note},{onConflict:"tenant_id,user_id"}).select("user_id").single();
  if(result.error || !result.data) throw new Error("Technician profile save failed.");
  revalidatePath(`/workspaces/${tenantId}/technicians`);
  revalidatePath(`/workspaces/${tenantId}/jobs`);
  revalidatePath(`/workspaces/${tenantId}/calendar`);
  return {status:"success",message:"Technician skills and availability saved."};
 } catch(error) {
  unstable_rethrow(error);
  return {status:"error",message:"Unable to save technician skills. Check permissions and try again."};
 }
}

