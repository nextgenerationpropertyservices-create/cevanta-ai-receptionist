import "server-only";
import type { Lead } from "@/lib/intake-contracts";
import { requireMembership, uuidSchema } from "./authorization";

export async function getLeads(tenantId: string): Promise<{ ready: boolean; leads: Lead[] }> {
  const { client } = await requireMembership(tenantId);
  const result = await client.from("leads").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false });
  if (result.error?.code === "42P01" || result.error?.code === "PGRST205") return { ready: false, leads: [] };
  if (result.error) throw new Error("Could not load leads.");
  return { ready: true, leads: (result.data ?? []) as Lead[] };
}
export async function getLead(tenantId: string, leadId: string): Promise<{ ready: boolean; lead: Lead | null }> {
  const { client } = await requireMembership(tenantId);
  if (!uuidSchema.safeParse(leadId).success) return { ready: true, lead: null };
  const result = await client.from("leads").select("*").eq("tenant_id", tenantId).eq("id", leadId).maybeSingle();
  if (result.error?.code === "42P01" || result.error?.code === "PGRST205") return { ready: false, lead: null };
  if (result.error) throw new Error("Could not load lead.");
  return { ready: true, lead: result.data as Lead | null };
}
