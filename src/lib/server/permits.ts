import "server-only";
import { notFound } from "next/navigation";
import { OFFICE_ROLES, type Role, type Tenant } from "@/lib/contracts";
import { getWorkspaceRecord } from "@/lib/server/queries";

type Workspace = Awaited<ReturnType<typeof getWorkspaceRecord>>;
export async function permitsEnabled(client: Workspace["client"], tenant: Tenant, role: Role) {
  if (tenant.account_type !== "client" || !OFFICE_ROLES.includes(role)) return false;
  const { data, error } = await client.from("permit_workspace_access").select("enabled,expires_at").eq("tenant_id",tenant.id).maybeSingle();
  return !error && data?.enabled === true && (data.expires_at === null || Date.parse(data.expires_at) > Date.now());
}
export async function requirePermitWorkspace(tenantId: string) {
  const workspace = await getWorkspaceRecord(tenantId);
  if (!await permitsEnabled(workspace.client,workspace.tenant,workspace.role)) notFound();
  return workspace;
}
export async function permitJobSeed(client: Workspace["client"], tenantId: string, jobId: string) {
  const { data: allowed, error: accessError } = await client.rpc("missed_call_available", { target: tenantId });
  if (accessError || allowed !== true) return null;
  const { data: job, error } = await client.from("jobs").select("id,title,description,service_location_id").eq("tenant_id",tenantId).eq("id",jobId).maybeSingle();
  if (error || !job) return null;
  if (!job.service_location_id) return { title: String(job.title), scope: String(job.description), site:"" };
  const {data: location, error: locationError} = await client.from("service_locations").select("address_line1,city,state,postal_code").eq("tenant_id",tenantId).eq("id",job.service_location_id).maybeSingle();
  if (locationError || !location) return null;
  return {title:String(job.title),scope:String(job.description),site:[location.address_line1,location.city,location.state,location.postal_code].filter(Boolean).join(", ")};
}
