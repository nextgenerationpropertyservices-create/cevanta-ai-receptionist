import "server-only";
import { AUTOMATION_CONTROL_DEFINITIONS, defaultAutomationControl, type AutomationControl, type AutomationCapability, type AutomationState } from "@/lib/automation-controls";
import { SETTINGS_ROLES } from "@/lib/contracts";
import { requireMembership } from "@/lib/server/authorization";

const missing = (code?: string) => code === "42P01" || code === "PGRST205";

interface AutomationControlRow {
  id: string;
  tenant_id: string;
  capability: AutomationCapability;
  requested: boolean;
  client_visible: boolean;
  owner_approved: boolean;
  activation_state: AutomationState;
  test_evidence: string | null;
  rollback_plan: string | null;
  provider_notes: string | null;
  updated_at: string | null;
}

export async function getAutomationControls(tenantId: string): Promise<{ ready: boolean; controls: AutomationControl[]; canManage: boolean }> {
  const { client, role } = await requireMembership(tenantId);
  const defaults = AUTOMATION_CONTROL_DEFINITIONS.map(definition => defaultAutomationControl(tenantId, definition));
  const canManage = SETTINGS_ROLES.includes(role);
  if (!canManage) return { ready: true, controls: defaults, canManage };
  const result = await client.from("workspace_automation_controls").select("*").eq("tenant_id", tenantId);
  if (missing(result.error?.code)) return { ready: false, controls: defaults, canManage };
  if (result.error) throw new Error("Could not load automation controls.");
  const rows = new Map((result.data as AutomationControlRow[]).map(row => [row.capability, row]));
  const controls = defaults.map(control => {
    const row = rows.get(control.capability);
    return row ? {
      ...control,
      id: row.id,
      requested: row.requested,
      client_visible: row.client_visible,
      owner_approved: row.owner_approved,
      activation_state: row.activation_state,
      test_evidence: row.test_evidence ?? "",
      rollback_plan: row.rollback_plan ?? "",
      provider_notes: row.provider_notes ?? "",
      updated_at: row.updated_at,
    } : control;
  });
  return { ready: true, controls, canManage };
}

export async function requireAutomationControlManager(tenantId: string) {
  return requireMembership(tenantId, SETTINGS_ROLES);
}
