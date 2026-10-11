import "server-only";
import { OFFICE_ROLES } from "@/lib/contracts";
import type { TechnicianProfile } from "@/lib/technician-profiles";
import { requireMembership } from "./authorization";
const missing = (code?: string) => code === "42P01" || code === "PGRST205";
export async function getTechnicianProfiles(tenantId:string): Promise<{ready:boolean;profiles:TechnicianProfile[]}> {
 const {client}=await requireMembership(tenantId,OFFICE_ROLES);
 const result=await client.from("technician_profiles").select("*").eq("tenant_id",tenantId);
 if(missing(result.error?.code)) return {ready:false,profiles:[]};
 if(result.error) throw new Error("Could not load technician profiles.");
 return {ready:true,profiles:(result.data??[]) as TechnicianProfile[]};
}
