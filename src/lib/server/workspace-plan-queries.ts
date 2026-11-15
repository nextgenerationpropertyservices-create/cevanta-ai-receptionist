import "server-only";
import type { WorkspacePlanSummary } from "@/lib/contracts";
import { buildWorkspacePlanSummary, isWorkspacePlan } from "@/lib/workspace-plans";
import { requireMembership } from "@/lib/server/authorization";

export async function getWorkspacePlanSummary(tenantId: string): Promise<WorkspacePlanSummary> {
  const { client } = await requireMembership(tenantId);
  const [tenantResult, leadsResult, rosterResult] = await Promise.all([
    client.from("tenants").select("plan").eq("id", tenantId).single(),
    client.from("leads").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).in("status", ["new", "contacted", "scheduled"]),
    client.from("technician_roster").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId),
  ]);
  const planValue = (tenantResult.data as { plan?: unknown } | null)?.plan;
  if (tenantResult.error || !isWorkspacePlan(planValue)) return { plan: "unavailable", limits: { activeLeads: null, technicianRoster: null }, usage: { activeLeads: 0, technicianRoster: 0 }, remaining: { activeLeads: null, technicianRoster: null } };
  if (leadsResult.error || rosterResult.error) throw new Error("Could not load workspace plan usage.");
  return buildWorkspacePlanSummary(planValue, leadsResult.count ?? 0, rosterResult.count ?? 0);
}
