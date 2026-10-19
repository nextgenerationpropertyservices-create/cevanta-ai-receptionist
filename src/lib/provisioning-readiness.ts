import type { AutomationControl } from "@/lib/automation-controls";
import type { OwnerOnboardingSnapshot } from "@/lib/onboarding-contracts";

export type ProvisioningGateState = "ready" | "needs_setup" | "manual_required" | "blocked";
export type RetellRouteReadiness = "active" | "paused" | "not_mapped" | "not_configured" | "unavailable";

export interface ProvisioningGate {
  key: string;
  label: string;
  state: ProvisioningGateState;
  summary: string;
  nextAction: string;
}

export interface ProvisioningReadiness {
  gates: ProvisioningGate[];
  readyCount: number;
  totalCount: number;
  overallState: "setup_needed" | "operator_needed" | "activation_blocked";
  safeSummary: string;
}

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function hasWeeklyHours(snapshot: OwnerOnboardingSnapshot) {
  return snapshot.weekly_hours.some(day => !day.closed && day.intervals.length > 0);
}

function hasOfficeContact(snapshot: OwnerOnboardingSnapshot) {
  return Boolean(snapshot.profile && hasText(snapshot.profile.business_contact_name) && (hasText(snapshot.profile.business_email) || hasText(snapshot.profile.business_phone)));
}

function setupReady(snapshot: OwnerOnboardingSnapshot | null) {
  if (!snapshot) return false;
  return Boolean(
    snapshot.profile &&
    hasText(snapshot.workspace.name) &&
    hasText(snapshot.workspace.trade) &&
    hasText(snapshot.workspace.timezone) &&
    hasOfficeContact(snapshot) &&
    snapshot.services.some(service => service.enabled && hasText(service.name)) &&
    hasWeeklyHours(snapshot) &&
    snapshot.booking?.acknowledged &&
    hasText(snapshot.booking.notes) &&
    snapshot.escalation.some(contact => contact.enabled && hasText(contact.contact_name) && (hasText(contact.email) || hasText(contact.phone)))
  );
}

function receptionistDraftReady(snapshot: OwnerOnboardingSnapshot | null) {
  if (!snapshot) return false;
  return Boolean(
    snapshot.profile &&
    snapshot.services.some(service => service.enabled && hasText(service.name)) &&
    snapshot.booking?.acknowledged &&
    hasText(snapshot.booking.notes)
  );
}

function controlledOptionsSummary(controls: AutomationControl[]) {
  const requested = controls.filter(control => control.requested);
  const ready = controls.filter(control => control.requested && control.owner_approved && ["ready", "active"].includes(control.activation_state) && hasText(control.test_evidence) && hasText(control.rollback_plan));
  return { requested: requested.length, ready: ready.length };
}

export function buildProvisioningReadiness(snapshot: OwnerOnboardingSnapshot | null, controls: AutomationControl[] = [], retellRoute: RetellRouteReadiness = "not_configured"): ProvisioningReadiness {
  const setupIsReady = setupReady(snapshot);
  const draftIsReady = receptionistDraftReady(snapshot);
  const options = controlledOptionsSummary(controls);
  const gates: ProvisioningGate[] = [
    {
      key: "saved_setup",
      label: "Client setup data",
      state: setupIsReady ? "ready" : "needs_setup",
      summary: setupIsReady ? "Required identity, office contact, services, hours, request rules and escalation contact are saved." : "Setup still needs the required business identity, office contact, services, hours, request rules or escalation contact.",
      nextAction: setupIsReady ? "Review for client-specific wording." : "Open Setup and finish the missing required intake details.",
    },
    {
      key: "receptionist_draft",
      label: "Receptionist draft package",
      state: draftIsReady ? "ready" : "needs_setup",
      summary: draftIsReady ? "Saved setup is enough to draft an AI receptionist prompt for office-review intake." : "The draft needs services plus request and never-promise rules before it can be reviewed.",
      nextAction: draftIsReady ? "Generate or review the client receptionist draft." : "Collect services and call rules before drafting.",
    },
    {
      key: "trusted_route",
      label: "Trusted tenant route",
      state: retellRoute === "active" ? "ready" : "manual_required",
      summary: retellRoute === "active" ? "An active tenant-scoped Retell route is present; routing still remains subject to fictional test-call and owner approval gates." : "Make, Retell and Cevanta must route by trusted server-side mapping, not by caller or client-supplied workspace IDs.",
      nextAction: retellRoute === "active" ? "Run the fictional recovery test and keep live writers off until approval." : retellRoute === "paused" ? "Resume the tenant route only after the provider connection and recovery plan are approved." : "Create or verify the tenant route only after the provider connection is approved.",
    },
    {
      key: "provider_connections",
      label: "Provider connections",
      state: "manual_required",
      summary: options.requested ? `${options.requested} optional automation controls are requested; ${options.ready} have approval, test evidence and rollback notes.` : "No optional live provider actions are ready for this client yet.",
      nextAction: "Authorize supported accounts privately and keep credentials out of source and screenshots.",
    },
    {
      key: "test_call",
      label: "Test call and recovery proof",
      state: "blocked",
      summary: "A fictional test call must prove intake, dedupe, failed delivery recovery and office-review language before activation.",
      nextAction: "Run a fictional test call after routing is configured, then record pass/fail evidence.",
    },
    {
      key: "activation",
      label: "Client activation",
      state: "blocked",
      summary: "Activation remains blocked until setup, routing, provider approval, test evidence, rollback plan and owner approval all pass.",
      nextAction: "Activate only the approved scope. Keep automatic booking, payments and dispatch off unless separately tested and approved.",
    },
  ];
  const readyCount = gates.filter(gate => gate.state === "ready").length;
  const overallState = !setupIsReady ? "setup_needed" : gates.some(gate => gate.state === "manual_required") ? "operator_needed" : "activation_blocked";
  return {
    gates,
    readyCount,
    totalCount: gates.length,
    overallState,
    safeSummary: "Preparation only: no Retell publishing, Make activation, SMS, email, calendar write, booking, payment, subscription or dispatch action is performed by this checklist.",
  };
}

export function provisioningStateLabel(state: ProvisioningGateState) {
  const labels: Record<ProvisioningGateState, string> = {
    ready: "Ready",
    needs_setup: "Needs setup",
    manual_required: "Manual review",
    blocked: "Blocked",
  };
  return labels[state];
}
