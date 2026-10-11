"use server";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { teamMemberSchema } from "@/lib/team-validation";
import { requireMembership } from "@/lib/server/authorization";
import { SETTINGS_ROLES } from "@/lib/contracts";
import type { ActionState } from "@/lib/server/action-state";

export async function saveTeamMember(_previous:ActionState,form:FormData):Promise<ActionState> {
 try {
  const parsed=teamMemberSchema.safeParse(Object.fromEntries(form));
  if(!parsed.success) return {status:"error",message:"Enter a confirmed account email and choose a role."};
  const {client}=await requireMembership(parsed.data.tenantId,SETTINGS_ROLES);
  const result=await client.rpc("manage_tenant_member",{input:{tenant_id:parsed.data.tenantId,email:parsed.data.email,role:parsed.data.role}});
  if(result.error) throw new Error("Team member save failed.");
  const status=(result.data as {status?:string}|null)?.status;
  if(status==="saved" || status==="replayed") {
   revalidatePath(`/workspaces/${parsed.data.tenantId}/technicians`);
   revalidatePath(`/workspaces/${parsed.data.tenantId}/jobs`);
   revalidatePath(`/workspaces/${parsed.data.tenantId}/calendar`);
   return {status:"success",message: parsed.data.role === "technician" ? "Technician saved and available for job assignment." : "Team member role saved."};
  }
  if(status==="not_found") return {status:"error",message:"That email must already have a confirmed Cevanta account before you can add it."};
  if(status==="protected_owner") return {status:"error",message:"Owner accounts cannot be changed from the technician screen."};
  return {status:"error",message:"Unable to save this team member. Check the email and role."};
 } catch(error) {
  unstable_rethrow(error);
  return {status:"error",message:"Unable to save this team member. Check permissions and try again."};
 }
}
