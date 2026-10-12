import { z } from "zod";

export const AUTOMATION_CAPABILITIES = [
  "sms",
  "email",
  "external_calendar",
  "automatic_booking",
  "payment_collection",
  "subscription_billing",
  "dispatch_automation",
] as const;

export const AUTOMATION_STATES = ["off", "requested", "testing", "ready", "active", "paused"] as const;

export type AutomationCapability = (typeof AUTOMATION_CAPABILITIES)[number];
export type AutomationState = (typeof AUTOMATION_STATES)[number];

export interface AutomationControlDefinition {
  capability: AutomationCapability;
  label: string;
  clientLabel: string;
  summary: string;
  liveRisk: string;
  provider: string;
}

export interface AutomationControl extends AutomationControlDefinition {
  id: string | null;
  tenant_id: string;
  requested: boolean;
  client_visible: boolean;
  owner_approved: boolean;
  activation_state: AutomationState;
  test_evidence: string;
  rollback_plan: string;
  provider_notes: string;
  updated_at: string | null;
}

export const AUTOMATION_CONTROL_DEFINITIONS: AutomationControlDefinition[] = [
  {
    capability: "sms",
    label: "SMS follow-up",
    clientLabel: "Text customers after office review",
    summary: "Send approved service-request or appointment follow-up texts after consent and opt-out language are ready.",
    liveRisk: "Can message real customers and must follow provider registration, consent and opt-out rules.",
    provider: "Twilio or approved SMS provider",
  },
  {
    capability: "email",
    label: "Email follow-up",
    clientLabel: "Email customers after office review",
    summary: "Send approved email follow-ups, intake summaries or office-review notices after sender and template checks.",
    liveRisk: "Can contact real customers and must use verified sender/domain rules.",
    provider: "SendGrid, Gmail, or approved email provider",
  },
  {
    capability: "external_calendar",
    label: "External calendar writes",
    clientLabel: "Write reviewed visits to the company calendar",
    summary: "Write confirmed office-reviewed appointments to Google Calendar or another approved calendar.",
    liveRisk: "Can create real calendar events and must pass conflict, timezone and rollback checks.",
    provider: "Google Calendar or approved calendar provider",
  },
  {
    capability: "automatic_booking",
    label: "Automatic booking",
    clientLabel: "Let AI confirm available appointment slots",
    summary: "Allow Cevanta to confirm appointments only after availability, conflict and confirmation rules are proven.",
    liveRisk: "Can promise real appointment times. Keep inactive until booking logic is separately proven.",
    provider: "Cevanta booking engine plus calendar provider",
  },
  {
    capability: "payment_collection",
    label: "Payment collection",
    clientLabel: "Collect approved payments",
    summary: "Collect deposits, setup fees or service payments only after written approval and payment flow testing.",
    liveRisk: "Can charge real money. Requires Stripe/payment setup, refund rules and support process.",
    provider: "Stripe or approved payment provider",
  },
  {
    capability: "subscription_billing",
    label: "Subscription billing",
    clientLabel: "Run recurring Cevanta billing",
    summary: "Manage recurring subscriptions only after billing support, cancellation and failed-payment handling are ready.",
    liveRisk: "Can create recurring charges. Requires final pricing, terms, support and cancellation workflow.",
    provider: "Stripe Billing or approved subscription provider",
  },
  {
    capability: "dispatch_automation",
    label: "Dispatch automation",
    clientLabel: "Auto-assign technicians from rules",
    summary: "Assign or route work automatically only after service area, skill, availability and escalation rules are tested.",
    liveRisk: "Can route real work to technicians. Keep office confirmation available as rollback.",
    provider: "Cevanta dispatch rules",
  },
];

export const automationControlSchema = z.object({
  tenantId: z.uuid(),
  capability: z.enum(AUTOMATION_CAPABILITIES),
  requested: z.boolean(),
  client_visible: z.boolean(),
  owner_approved: z.boolean(),
  activation_state: z.enum(AUTOMATION_STATES),
  test_evidence: z.string().trim().max(2000),
  rollback_plan: z.string().trim().max(2000),
  provider_notes: z.string().trim().max(2000),
}).superRefine((value, ctx) => {
  if (value.activation_state === "active") {
    if (!value.requested) ctx.addIssue({ code: "custom", path: ["requested"], message: "Mark the option as requested before making it active." });
    if (!value.owner_approved) ctx.addIssue({ code: "custom", path: ["owner_approved"], message: "Owner approval is required before active status." });
    if (!value.test_evidence) ctx.addIssue({ code: "custom", path: ["test_evidence"], message: "Test evidence is required before active status." });
    if (!value.rollback_plan) ctx.addIssue({ code: "custom", path: ["rollback_plan"], message: "A rollback plan is required before active status." });
  }
});

export function defaultAutomationControl(tenantId: string, definition: AutomationControlDefinition): AutomationControl {
  return {
    ...definition,
    id: null,
    tenant_id: tenantId,
    requested: false,
    client_visible: true,
    owner_approved: false,
    activation_state: "off",
    test_evidence: "",
    rollback_plan: "",
    provider_notes: "",
    updated_at: null,
  };
}

export function automationStateLabel(state: AutomationState) {
  const labels: Record<AutomationState, string> = {
    off: "Off",
    requested: "Requested",
    testing: "Testing",
    ready: "Ready for activation",
    active: "Active",
    paused: "Paused",
  };
  return labels[state];
}
