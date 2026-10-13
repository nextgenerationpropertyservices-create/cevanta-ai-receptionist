import { type AutomationCapability, type AutomationControl, type AutomationState, automationStateLabel } from '@/lib/automation-controls';

export type GoLiveCategory = 'communication' | 'scheduling' | 'billing' | 'dispatch';
export type GoLiveReadiness = 'blocked' | 'preparing' | 'testing' | 'ready' | 'active' | 'paused';

export interface GoLiveFeatureTrack {
  capability: AutomationCapability;
  category: GoLiveCategory;
  outcome: string;
  clientValue: string;
  providerChoice: string;
  configure: string[];
  approval: string;
  testPlan: string[];
  rollback: string[];
  firstSafeMode: string;
  liveBoundary: string;
  dashboardLinks: string[];
}

export interface GoLiveFeatureStatus extends GoLiveFeatureTrack {
  readiness: GoLiveReadiness;
  readinessLabel: string;
  automationState: AutomationState;
  automationStateLabel: string;
  requested: boolean;
  ownerApproved: boolean;
  hasTestEvidence: boolean;
  hasRollbackPlan: boolean;
  hasProviderNotes: boolean;
  missing: string[];
}

export const GO_LIVE_FEATURE_TRACKS: GoLiveFeatureTrack[] = [
  {
    capability: 'sms',
    category: 'communication',
    outcome: 'SMS follow-up',
    clientValue: 'Text customers after the office reviews a request, confirms next steps, or needs a quick callback confirmation.',
    providerChoice: 'Twilio SMS after business registration, A2P campaign approval, consent wording, and opt-out language are ready.',
    configure: ['Verified business/SMS provider account', 'Approved consent and opt-out wording', 'Office-only templates for request received, appointment requested, and follow-up needed', 'Test destination and support process'],
    approval: 'Owner must approve each SMS use case before live customer messages are sent.',
    testPlan: ['Send only to an owner-controlled test number first', 'Confirm opt-out wording appears correctly', 'Confirm failed sends are visible to office staff'],
    rollback: ['Switch SMS to paused', 'Disable provider send path or Make route', 'Return all follow-up to manual phone/email review'],
    firstSafeMode: 'Office alert draft only; no customer SMS until approval.',
    liveBoundary: 'Does not send texts from Go Live. It only records readiness and points staff to Integrations.',
    dashboardLinks: ['Integrations', 'Notifications', 'Leads'],
  },
  {
    capability: 'email',
    category: 'communication',
    outcome: 'Email follow-up',
    clientValue: 'Send reviewed intake summaries, appointment requests, and office follow-up emails from approved templates.',
    providerChoice: 'SendGrid, verified domain email, or another approved transactional email provider.',
    configure: ['Verified sender/domain', 'Approved templates', 'Reply-to and support inbox', 'Bounce/failure review process'],
    approval: 'Owner must approve templates, sender identity, and when email can be used.',
    testPlan: ['Send test email to owner inbox', 'Confirm content, sender, reply-to, and links', 'Confirm failed delivery is recorded for office follow-up'],
    rollback: ['Switch email to paused', 'Disable provider key or route', 'Use manual email from the office inbox'],
    firstSafeMode: 'Office-reviewed email drafts or internal summaries only.',
    liveBoundary: 'Does not send emails from Go Live. Provider sending remains a separate approved path.',
    dashboardLinks: ['Integrations', 'Leads', 'Settings'],
  },
  {
    capability: 'external_calendar',
    category: 'scheduling',
    outcome: 'External calendar writes',
    clientValue: 'Write office-approved jobs to the client calendar after the office confirms the time.',
    providerChoice: 'Google Calendar or another approved calendar provider with the correct write access.',
    configure: ['Calendar owner/account selected', 'Timezone confirmed', 'Event naming and notes format approved', 'Duplicate-prevention event identity strategy'],
    approval: 'Owner must approve which calendar receives events and who can see event details.',
    testPlan: ['Create a fictional test event in a test calendar first', 'Confirm duplicate retries do not create extra events', 'Confirm cancel/reschedule rollback is documented'],
    rollback: ['Pause calendar writes', 'Remove or cancel bad test events', 'Return to Cevanta internal calendar only'],
    firstSafeMode: 'Internal Cevanta calendar only; external calendar write suggested for office approval.',
    liveBoundary: 'Does not write external calendars from Go Live. Calendar writes stay gated by Integrations.',
    dashboardLinks: ['Calendar', 'Jobs', 'Integrations'],
  },
  {
    capability: 'automatic_booking',
    category: 'scheduling',
    outcome: 'Live booking',
    clientValue: 'Let Cevanta confirm an available appointment only after rules, availability, and fallback are proven.',
    providerChoice: 'Cevanta booking rules plus internal calendar and optional external calendar write provider.',
    configure: ['Booking mode changed from request-only only after approval', 'Services and duration rules', 'Business hours, buffers, lead time, and horizon', 'Conflict checks, technician availability, and emergency exceptions'],
    approval: 'Owner must approve exact booking rules and never-promise rules before confirmation language is allowed.',
    testPlan: ['Run fictional calls for normal, urgent, after-hours, duplicate, and no-availability cases', 'Confirm AI never books outside rules', 'Confirm office can pause booking instantly'],
    rollback: ['Set booking back to office-review/request-only', 'Pause Retell confirmation language', 'Use manual scheduling until reviewed'],
    firstSafeMode: 'Appointment preference capture only; office confirms later.',
    liveBoundary: 'Does not confirm appointments from Go Live. Automatic booking remains the highest-risk scheduling gate.',
    dashboardLinks: ['Setup', 'Calendar', 'Launch'],
  },
  {
    capability: 'payment_collection',
    category: 'billing',
    outcome: 'Payment collection',
    clientValue: 'Collect setup fees, deposits, or approved service payments only through tested payment links or checkout.',
    providerChoice: 'Stripe Payment Links or Checkout first; full in-app payment collection later.',
    configure: ['Stripe account/payment link', 'Offer, refund, receipt, and support rules', 'Test-mode payment proof', 'Clear owner approval for what can be charged'],
    approval: 'Owner must approve price, payment terms, refund handling, and customer-facing wording.',
    testPlan: ['Run Stripe test-mode or owner-controlled payment-link proof', 'Confirm no card details are stored in Cevanta', 'Confirm payment status is reviewed manually before live automation'],
    rollback: ['Disable or archive payment link', 'Pause payment collection', 'Return to manual invoice/payment confirmation'],
    firstSafeMode: 'Manual invoice or payment link outside Cevanta.',
    liveBoundary: 'Does not collect money from Go Live. Billing stays manual until a payment path is approved.',
    dashboardLinks: ['Billing', 'Integrations'],
  },
  {
    capability: 'subscription_billing',
    category: 'billing',
    outcome: 'Subscription billing',
    clientValue: 'Run recurring Cevanta pilot or subscription billing once offer, support, cancellation, and failed-payment rules are final.',
    providerChoice: 'Stripe Billing after first clients prove the offer and support process.',
    configure: ['Product and price in Stripe', 'Cancellation and failed-payment process', 'Receipt and tax/support wording', 'Owner approval before recurring charges'],
    approval: 'Owner must approve final recurring price, cancellation policy, and support workflow.',
    testPlan: ['Create test subscription in Stripe test mode', 'Confirm billing status display and failed-payment handling', 'Confirm cancel/pause process'],
    rollback: ['Cancel/pause subscription in Stripe', 'Pause subscription billing gate', 'Return to manual monthly invoice'],
    firstSafeMode: 'Manual monthly invoice or payment link.',
    liveBoundary: 'Does not create subscriptions from Go Live. Subscriptions stay optional and approval-gated.',
    dashboardLinks: ['Billing', 'Integrations'],
  },
  {
    capability: 'dispatch_automation',
    category: 'dispatch',
    outcome: 'Dispatch automation',
    clientValue: 'Suggest or assign technicians based on skills, service area, schedule, and urgency after office rules are proven.',
    providerChoice: 'Cevanta dispatch rules using technician profiles, job details, service areas, and calendar availability.',
    configure: ['Technician skills and service areas', 'Availability windows and blocked times', 'Urgency routing rules', 'Human override and escalation policy'],
    approval: 'Owner must approve when Cevanta may suggest versus automatically assign a technician.',
    testPlan: ['Run fictional jobs with different skills, areas, urgent status, and unavailable techs', 'Confirm unassigned fallback works', 'Confirm office can override or pause automation'],
    rollback: ['Switch dispatch automation to paused', 'Return jobs to unassigned office queue', 'Notify dispatcher to review impacted jobs'],
    firstSafeMode: 'Suggested assignment only; dispatcher confirms.',
    liveBoundary: 'Does not dispatch technicians from Go Live. Automation remains optional and reversible.',
    dashboardLinks: ['Technicians', 'Jobs', 'Calendar'],
  },
];

const readinessFromState: Record<AutomationState, GoLiveReadiness> = {
  off: 'blocked',
  requested: 'preparing',
  testing: 'testing',
  ready: 'ready',
  active: 'active',
  paused: 'paused',
};

const readinessLabels: Record<GoLiveReadiness, string> = {
  blocked: 'Blocked / off',
  preparing: 'Preparing',
  testing: 'Testing',
  ready: 'Ready for approval',
  active: 'Active',
  paused: 'Paused',
};

export function goLiveReadinessLabel(readiness: GoLiveReadiness) {
  return readinessLabels[readiness];
}

export function getGoLiveFeatureStatuses(controls: AutomationControl[]): GoLiveFeatureStatus[] {
  const byCapability = new Map(controls.map(control => [control.capability, control]));
  return GO_LIVE_FEATURE_TRACKS.map(track => {
    const control = byCapability.get(track.capability);
    const automationState = control?.activation_state ?? 'off';
    const readiness = readinessFromState[automationState];
    const requested = !!control?.requested;
    const ownerApproved = !!control?.owner_approved;
    const hasTestEvidence = !!control?.test_evidence.trim();
    const hasRollbackPlan = !!control?.rollback_plan.trim();
    const hasProviderNotes = !!control?.provider_notes.trim();
    const missing = [
      !requested ? 'feature requested' : '',
      !ownerApproved ? 'owner approval' : '',
      !hasProviderNotes ? 'provider/setup notes' : '',
      !hasTestEvidence ? 'test evidence' : '',
      !hasRollbackPlan ? 'rollback plan' : '',
    ].filter(Boolean);
    return {
      ...track,
      readiness,
      readinessLabel: readinessLabels[readiness],
      automationState,
      automationStateLabel: automationStateLabel(automationState),
      requested,
      ownerApproved,
      hasTestEvidence,
      hasRollbackPlan,
      hasProviderNotes,
      missing,
    };
  });
}

export function summarizeGoLiveStatus(statuses: GoLiveFeatureStatus[]) {
  const active = statuses.filter(status => status.readiness === 'active').length;
  const ready = statuses.filter(status => status.readiness === 'ready').length;
  const testing = statuses.filter(status => status.readiness === 'testing').length;
  const preparing = statuses.filter(status => status.readiness === 'preparing').length;
  const blocked = statuses.filter(status => status.readiness === 'blocked').length;
  return { active, ready, testing, preparing, blocked, total: statuses.length };
}
