"use server";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import type { ConfigurationCommand, ConfigurationResult, InvitationAcceptanceResult } from "@/lib/onboarding-contracts";
import { configureOnboarding, saveOnboardingResume, acceptOnboardingInvitation, getOnboardingSnapshot } from "@/lib/server/onboarding-rpc";
import { starterServicesForTrade } from "@/lib/client-onboarding-blueprint";

type Outcome = ConfigurationResult | InvitationAcceptanceResult;
function message(result: Outcome): string {
  switch(result.status) {
    case "saved": return "Setup information saved.";
    case "accepted": return "Workspace access confirmed.";
    case "already_accepted": return "Workspace access is already confirmed.";
    case "replayed": return "Your earlier save is confirmed. Refresh to see the latest information.";
    case "validation_error": return "Check the setup fields and try again.";
    case "unavailable": return "This workspace or invitation is unavailable. Check your account and access.";
    case "membership_conflict": return "Your existing workspace role differs from this invitation. Ask your administrator for help.";
    case "conflict": return result.reason === "revision" ? "Setup changed. Refresh before saving your edits." : result.reason === "request_reuse" ? "This request was already used for different information. Refresh before trying again." : "This record cannot accept further changes. Ask your administrator for help.";
    default: return "We could not confirm the result. Retry with the same request before starting a new save.";
  }
}
function finish<T extends Outcome>(result:T,tenant?:string) {
  let refreshRequired=false;
  if (["saved","accepted","already_accepted","replayed"].includes(result.status) && tenant) {
    try { revalidatePath(`/workspaces/${tenant}`,"layout"); }
    catch(error) { unstable_rethrow(error); refreshRequired=true; }
  }
  return {result,message:refreshRequired ? "Your save is confirmed. Refresh the workspace to see the latest information." : message(result),refreshRequired};
}
export async function saveOnboardingConfiguration(command:ConfigurationCommand,input:unknown) {
  const result=await configureOnboarding(command,input);
  const tenant=(result.status === "saved" || result.status === "replayed") && result.entity === "setup" ? result.id : (input && typeof input === "object" && "tenant_id" in input && typeof input.tenant_id === "string" ? input.tenant_id : undefined);
  return finish(result,tenant?.toLowerCase());
}
export async function saveOnboardingProgress(input:unknown) {
  const result=await saveOnboardingResume(input);
  const tenant=input && typeof input === "object" && "tenant_id" in input && typeof input.tenant_id === "string" ? input.tenant_id : undefined;
  return finish(result,tenant?.toLowerCase());
}

export type StarterTemplateResult =
  | { status: "saved" | "replayed"; service_count: number }
  | { status: "already_configured" | "unavailable" | "retryable_failure" };

/**
 * Applies only the safe service starter list for a new workspace. It refuses
 * to replace a list the client has already started and does not touch provider
 * credentials, calendars, messaging, booking, or activation controls.
 */
export async function applyIndustryStarterTemplate(tenantId: string): Promise<StarterTemplateResult> {
  const snapshotResponse = await getOnboardingSnapshot(tenantId);
  if (snapshotResponse.status !== "available" || snapshotResponse.snapshot.projection !== "owner_setup") {
    return { status: snapshotResponse.status === "retryable_failure" ? "retryable_failure" : "unavailable" };
  }
  const snapshot = snapshotResponse.snapshot;
  if (snapshot.services.length > 0) return { status: "already_configured" };
  const services = starterServicesForTrade(snapshot.workspace.trade);
  const result = await configureOnboarding("replace_services", {
    tenant_id: snapshot.workspace.id,
    request_id: crypto.randomUUID(),
    expected_config_revision: snapshot.config_revision,
    payload: { items: services },
  });
  if (result.status === "saved" || result.status === "replayed") return { status: result.status, service_count: services.length };
  if (result.status === "retryable_failure") return { status: "retryable_failure" };
  return { status: "unavailable" };
}
export async function acceptOnboardingAccess(input:unknown) {
  const result=await acceptOnboardingInvitation(input);
  return finish(result,"workspace" in result ? result.workspace.id : undefined);
}

export type SheetSyncResult =
  | { status: "sent"; sync_key: string }
  | { status: "not_configured" | "unavailable" | "failed" };

/**
 * Sends one complete, owner-approved intake snapshot to the inactive/approved
 * Make webhook. The webhook URL is server-only; it is never sent to the
 * browser. This is intentionally explicit so saving individual setup sections
 * cannot create duplicate spreadsheet rows.
 */
export async function syncOnboardingToSheet(tenantId: string): Promise<SheetSyncResult> {
  const endpoint = process.env.CEVANTA_CLIENT_INTAKE_WEBHOOK_URL;
  if (!endpoint) return { status: "not_configured" };
  if (!/^https:\/\/hook\.[a-z0-9-]+\.make\.com\//i.test(endpoint)) return { status: "failed" };

  const response = await getOnboardingSnapshot(tenantId);
  if (response.status !== "available" || response.snapshot.projection !== "owner_setup") {
    return { status: "unavailable" };
  }
  const snapshot = response.snapshot;
  const sync_key = `${snapshot.workspace.id}:${snapshot.config_revision}`;
  const submitted_at = new Date().toISOString();
  const payload = {
    submitted_at,
    sync_key,
    client_business: snapshot.workspace.name,
    trade: snapshot.workspace.trade,
    contact_name: snapshot.profile?.business_contact_name ?? "",
    contact_email: snapshot.profile?.business_email ?? "",
    contact_phone: snapshot.profile?.business_phone ?? "",
    timezone: snapshot.workspace.timezone,
    service_area: "",
    services: snapshot.services.filter(item => item.enabled).map(item => item.name).join("; "),
    business_hours: snapshot.weekly_hours.map(day => `${day.weekday}:${day.closed ? "closed" : day.intervals.map(interval => `${interval.start_minute}-${interval.end_minute}`).join(",")}`).join(" | "),
    emergency_rules: "Office review required; no dispatch promise.",
    escalation_contacts: snapshot.escalation.filter(item => item.enabled).map(item => `${item.label}: ${item.contact_name}${item.email ? ` (${item.email})` : ""}${item.phone ? ` ${item.phone}` : ""}`).join("; "),
    call_handling_rules: snapshot.booking?.notes ?? "Capture requests for office review.",
    never_promise_rules: "No confirmed appointments, prices, payment, SMS, email, calendar writes, or dispatch unless separately approved and tested.",
    retell_agent: "",
    make_scenario: "Cevanta Client Intake → Google Sheet",
    setup_status: "Submitted for review",
    notes: "Sent from the owner Setup page. Review before enabling any live provider writes.",
  };

  try {
    const result = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    return result.ok ? { status: "sent", sync_key } : { status: "failed" };
  } catch {
    return { status: "failed" };
  }
}

