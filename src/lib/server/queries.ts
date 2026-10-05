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
