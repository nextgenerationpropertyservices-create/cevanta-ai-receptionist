import type { WorkspacePlan, WorkspacePlanSummary } from "@/lib/contracts";
import type { SupabaseClient } from "@supabase/supabase-js";

export const WORKSPACE_PLANS = ["free", "dashboard_plus", "managed_receptionist"] as const satisfies readonly WorkspacePlan[];
export const FREE_ACTIVE_LEAD_LIMIT = 50;
export const FREE_TECHNICIAN_ROSTER_LIMIT = 2;

export function isWorkspacePlan(value: unknown): value is Exclude<WorkspacePlan, "unavailable"> {
  return typeof value === "string" && WORKSPACE_PLANS.includes(value as Exclude<WorkspacePlan, "unavailable">);
}

/** Authoritative entitlement check. Missing or malformed plan is deliberately unavailable. */
export async function getAuthoritativeWorkspacePlan(client: SupabaseClient, tenantId: string): Promise<WorkspacePlan | null> {
  const result = await client.from("tenants").select("plan").eq("id", tenantId).single();
  const value = (result.data as { plan?: unknown } | null)?.plan;
  return result.error || !isWorkspacePlan(value) ? null : value;
}

export const FREE_PLAN_LOCKED_MESSAGE = "This feature is unavailable on the free plan. Upgrade your workspace to continue.";

export function buildWorkspacePlanSummary(plan: Exclude<WorkspacePlan, "unavailable">, activeLeads: number, technicianRoster: number): WorkspacePlanSummary {
  const limits = plan === "free"
    ? { activeLeads: FREE_ACTIVE_LEAD_LIMIT, technicianRoster: FREE_TECHNICIAN_ROSTER_LIMIT }
    : { activeLeads: null, technicianRoster: null };
  return {
    plan,
    limits,
    usage: { activeLeads, technicianRoster },
    remaining: {
      activeLeads: limits.activeLeads === null ? null : Math.max(0, limits.activeLeads - activeLeads),
      technicianRoster: limits.technicianRoster === null ? null : Math.max(0, limits.technicianRoster - technicianRoster),
    },
  };
}

export const FREE_ACTIVE_LEAD_LIMIT_MESSAGE = "Your free workspace includes up to 50 active leads. Archive a completed lead or upgrade to add another.";
export const FREE_TECHNICIAN_LIMIT_MESSAGE = "Your free workspace includes up to 2 technicians. Remove a roster entry or upgrade to add another.";

export function isFreePlanLimitError(error: { message?: string | null; details?: string | null } | null | undefined, identifier: "free_plan_active_lead_limit" | "free_plan_technician_limit") {
  return [error?.message, error?.details].some(value => typeof value === "string" && value.includes(identifier));
}
