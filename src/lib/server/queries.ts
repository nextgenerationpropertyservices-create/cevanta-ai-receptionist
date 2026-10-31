import "server-only";
import type { Tenant, Customer, Contact, ServiceLocation, Equipment } from "@/lib/contracts";
import type { Lead } from "@/lib/intake-contracts";
import type { Job } from "@/lib/jobs-contracts";
import type { Appointment } from "@/lib/appointments-contracts";
import { requireUser, requireMembership, uuidSchema } from "./authorization";
import { getOnboardingSnapshot } from "./onboarding-rpc";
import { evaluateClientOnboardingGate } from "./client-onboarding-gate";
import { redirect } from "next/navigation";

export async function getWorkspaces(): Promise<Tenant[]> {
  const { client, user } = await requireUser();
  const memberships = await client.from("memberships").select("tenant_id").eq("user_id", user.id);
  if (memberships.error) throw new Error("Could not load workspaces.");
  const ids = (memberships.data ?? []).map(item => item.tenant_id as string);
  if (!ids.length) return [];
  const result = await client.from("tenants").select("*").in("id", ids).order("name");
  if (result.error) throw new Error("Could not load workspaces.");
  return result.data as Tenant[];
}

export async function getWorkspaceRecord(tenantId: string) {
  const { client, user, role } = await requireMembership(tenantId);
  const { data, error } = await client.from("tenants").select("*").eq("id", tenantId).single();
  if (error || !data) throw new Error("Workspace is unavailable.");
  return { tenant: data as Tenant, role, client, user };
}

async function hasInternalOperatorAccess(client: Awaited<ReturnType<typeof getWorkspaceRecord>>["client"], userId: string, clientTenantId: string) {
  const memberships = await client.from("memberships").select("tenant_id").eq("user_id", userId);
  if (memberships.error) return false;
  const operatorIds = (memberships.data ?? []).map(row => row.tenant_id as string);
  if (!operatorIds.length) return false;
  const relation = await client.from("managed_client_workspaces").select("client_tenant_id").eq("client_tenant_id", clientTenantId).in("operator_tenant_id", operatorIds).maybeSingle();
  return !relation.error && !!relation.data;
}

export async function getWorkspace(tenantId: string) {
  const workspace = await getWorkspaceRecord(tenantId);
  const setup = workspace.tenant.account_type === "client" && (workspace.role === "owner" || workspace.role === "admin")
    ? await getOnboardingSnapshot(tenantId)
    : null;
  const snapshot = setup?.status === "available" && setup.snapshot.projection === "owner_setup" ? setup.snapshot : null;
  const internalOperatorAccess = workspace.tenant.account_type === "client"
    ? await hasInternalOperatorAccess(workspace.client, workspace.user.id, tenantId)
    : false;
  const gate = evaluateClientOnboardingGate(workspace.tenant, workspace.role, snapshot, internalOperatorAccess);
  if (gate.applies && (!gate.checkable || !gate.complete)) {
    redirect(`/workspaces/${tenantId}/onboarding?locked=1`);
  }
  return workspace;
}

export interface ManagedClientWorkspace { id: string; name: string; trade: string; timezone: string; plan: Tenant["plan"]; status: string; created_at: string; updated_at: string }

export async function getManagedClientWorkspaces(operatorTenantId: string): Promise<{ operator: Tenant; role: string; clients: ManagedClientWorkspace[]; allowed: boolean }> {
  const { tenant, role } = await getWorkspace(operatorTenantId);
  const allowed = tenant.account_type === "internal" && (role === "owner" || role === "admin");
  if (!allowed) return { operator: tenant, role, clients: [], allowed: false };
  const { client } = await requireMembership(operatorTenantId, ["owner", "admin"]);
  const result = await client.from("managed_client_workspaces").select("status,created_at,client:client_tenant_id(id,name,trade,timezone,account_type,plan,created_at,updated_at)").eq("operator_tenant_id", operatorTenantId).neq("status", "archived").order("created_at", { ascending: false });
  if (result.error) throw new Error("Could not load client workspaces.");
  const clients = (result.data ?? []).flatMap(row => {
    const clientRow = Array.isArray(row.client) ? row.client[0] : row.client;
    if (!clientRow) return [];
    return [{ id: clientRow.id, name: clientRow.name, trade: clientRow.trade, timezone: clientRow.timezone, plan: clientRow.plan, status: row.status, created_at: row.created_at, updated_at: clientRow.updated_at }];
  });
  return { operator: tenant, role, clients, allowed: true };
}
export async function getCustomers(tenantId: string): Promise<Customer[]> {
  const { client } = await requireMembership(tenantId);
  const { data, error } = await client.from("customers").select("*").eq("tenant_id", tenantId).order("name");
  if (error) throw new Error("Could not load customers.");
  return data as Customer[];
}

export async function getCustomer(tenantId: string, customerId: string) {
  if (!uuidSchema.safeParse(customerId).success) return null;
  const { client } = await requireMembership(tenantId);
  const customer = await client.from("customers").select("*").eq("tenant_id", tenantId).eq("id", customerId).maybeSingle();
  if (customer.error) throw new Error("Could not load customer.");
  if (!customer.data) return null;
  const [contacts, locations] = await Promise.all([
    client.from("contacts").select("*").eq("tenant_id", tenantId).eq("customer_id", customerId).order("name"),
    client.from("service_locations").select("*").eq("tenant_id", tenantId).eq("customer_id", customerId).order("label"),
  ]);
  if (contacts.error || locations.error) throw new Error("Could not load customer records.");
  const locationIds = (locations.data ?? []).map(location => location.id as string);
  const equipment = locationIds.length ? await client.from("equipment").select("*").eq("tenant_id", tenantId).in("service_location_id", locationIds).order("name") : { data: [], error: null };
  if (equipment.error) throw new Error("Could not load equipment.");
  const [leadResult, jobResult] = await Promise.all([
    client.from("leads").select("*").eq("tenant_id", tenantId).eq("customer_id", customerId).order("created_at", { ascending: false }),
    client.from("jobs").select("*").eq("tenant_id", tenantId).eq("customer_id", customerId).order("created_at", { ascending: false }),
  ]);
  const missing = (code?: string) => code === "42P01" || code === "PGRST205";
  if (leadResult.error && !missing(leadResult.error.code)) throw new Error("Could not load customer leads.");
  if (jobResult.error && !missing(jobResult.error.code)) throw new Error("Could not load customer jobs.");
  const jobs = (jobResult.data ?? []) as Job[];
  const jobIds = jobs.map(job => job.id);
  const appointmentResult = jobIds.length
    ? await client.from("appointments").select("*").eq("tenant_id", tenantId).in("job_id", jobIds).order("starts_at", { ascending: false })
    : { data: [], error: null };
  if (appointmentResult.error && !missing(appointmentResult.error.code)) throw new Error("Could not load customer appointments.");
  return {
    customer: customer.data as Customer,
    contacts: contacts.data as Contact[],
    locations: locations.data as ServiceLocation[],
    equipment: equipment.data as Equipment[],
    leads: (leadResult.data ?? []) as Lead[],
    jobs,
    appointments: (appointmentResult.data ?? []) as Appointment[],
  };
}
