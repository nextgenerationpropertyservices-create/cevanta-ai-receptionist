import "server-only";
import { SETTINGS_ROLES } from "@/lib/contracts";
import { requireMembership } from "./authorization";
import { normalizeTechnicianRoster, type TechnicianRosterEntry } from "@/lib/technician-roster";
const missing=(code?:string)=>code === "42P01" || code === "PGRST205";
export async function getTechnicianRoster(tenantId:string):Promise<{ready:boolean;roster:TechnicianRosterEntry[]}> {
 const {client}=await requireMembership(tenantId,SETTINGS_ROLES);
 const result=await client.from("technician_roster").select("*").eq("tenant_id",tenantId).order("created_at",{ascending:false});
 if(missing(result.error?.code)) return {ready:false,roster:[]};
 if(result.error) throw new Error("Could not load technician roster.");
 return {ready:true,roster:(result.data??[]).map(row=>normalizeTechnicianRoster(row as Record<string,unknown>))};
}