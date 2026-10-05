import "server-only";
import { OFFICE_ROLES } from "@/lib/contracts";
import type { ServiceLocation } from "@/lib/contracts";
import type { Job, Technician } from "@/lib/jobs-contracts";
import { requireMembership, uuidSchema } from "./authorization";
const missing = (code?: string) => code === "42P01" || code === "PGRST205" || code === "PGRST202";
export async function getJobs(tenantId: string): Promise<{ready: boolean; jobs: Job[]}> {
 const {client,user,role} = await requireMembership(tenantId);
 let query = client.from("jobs").select("*").eq("tenant_id",tenantId);
 if(role === "technician") query=query.eq("assigned_user_id",user.id);
 const result=await query.order("created_at",{ascending:false});
 if(missing(result.error?.code)) return {ready:false,jobs:[]};
 if(result.error) throw new Error("Could not load jobs.");
 return {ready:true,jobs:(result.data??[]) as Job[]};
}
export async function getJob(tenantId: string, jobId: string): Promise<{ready:boolean;job:Job|null}> {
 const {client,user,role}=await requireMembership(tenantId);
 if(!uuidSchema.safeParse(jobId).success) return {ready:true,job:null};
 let query=client.from("jobs").select("*").eq("tenant_id",tenantId).eq("id",jobId);
 if(role === "technician") query=query.eq("assigned_user_id",user.id);
 const result=await query.maybeSingle();
 if(missing(result.error?.code)) return {ready:false,job:null};
 if(result.error) throw new Error("Could not load job.");
 return {ready:true,job:result.data as Job|null};
}
export async function getTechnicians(tenantId:string): Promise<{ready:boolean;technicians:Technician[]}> {
 const {client}=await requireMembership(tenantId,OFFICE_ROLES);
 const result=await client.rpc("get_tenant_technicians",{target:tenantId});
 if(missing(result.error?.code) || result.error?.code === "42883") return {ready:false,technicians:[]};
 if(result.error) throw new Error("Could not load technician directory.");
 return {ready:true,technicians:(result.data??[]) as Technician[]};
}
export async function getJobLocations(tenantId:string): Promise<{ready:boolean;locations:ServiceLocation[]}> {
 const {client}=await requireMembership(tenantId,OFFICE_ROLES);
 const result=await client.from("service_locations").select("*").eq("tenant_id",tenantId).order("label");
 if(missing(result.error?.code)) return {ready:false,locations:[]};
 if(result.error) throw new Error("Could not load service locations.");
 return {ready:true,locations:(result.data??[]) as ServiceLocation[]};
}
