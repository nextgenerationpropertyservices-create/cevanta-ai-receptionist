import "server-only";
import type { Tenant, Customer, Contact, ServiceLocation, Equipment } from "@/lib/contracts";
import { requireUser, requireMembership, uuidSchema } from "./authorization";

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

export async function getWorkspace(tenantId: string) {
  const { client, role } = await requireMembership(tenantId);
  const { data, error } = await client.from("tenants").select("*").eq("id", tenantId).single();
  if (error || !data) throw new Error("Workspace is unavailable.");
  return { tenant: data as Tenant, role };
}

export interface ManagedClientWorkspace { id: string; name: string; trade: string; timezone: string; status: string; created_at: string; updated_at: string }

export async function getManagedClientWorkspaces(operatorTenantId: string): Promise<{ operator: Tenant; role: string; clients: ManagedClientWorkspace[]; allowed: boolean }> {
  const { tenant, role } = await getWorkspace(operatorTenantId);
  const allowed = tenant.account_type === "internal" && (role === "owner" || role === "admin");
  if (!allowed) return { operator: tenant, role, clients: [], allowed: false };
  const { client } = await requireMembership(operatorTenantId, ["owner", "admin"]);
  const result = await client.from("managed_client_workspaces").select("status,created_at,client:client_tenant_id(id,name,trade,timezone,account_type,created_at,updated_at)").eq("operator_tenant_id", operatorTenantId).order("created_at", { ascending: false });
  if (result.error) throw new Error("Could not load client workspaces.");
  const clients = (result.data ?? []).flatMap(row => {
    const clientRow = Array.isArray(row.client) ? row.client[0] : row.client;
    if (!clientRow) return [];
    return [{ id: clientRow.id, name: clientRow.name, trade: clientRow.trade, timezone: clientRow.timezone, status: row.status, created_at: row.created_at, updated_at: clientRow.updated_at }];
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
  return { customer: customer.data as Customer, contacts: contacts.data as Contact[], locations: locations.data as ServiceLocation[], equipment: equipment.data as Equipment[] };
}
