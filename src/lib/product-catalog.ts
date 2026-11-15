export type ProductAvailability = 'standalone' | 'addon' | 'both';
export type ProductReadiness = 'available_now' | 'setup_required' | 'planned';

export interface CevantaProduct {
  slug: string;
  name: string;
  eyebrow: string;
  oneLine: string;
  availability: ProductAvailability;
  readiness: ProductReadiness;
  pricing: string;
  outcome: string;
  workflow: string[];
  needs: string[];
  readyState: string;
  nextStep: string;
  href: (tenantId: string) => string;
  cta: string;
}

export const cevantaProducts: CevantaProduct[] = [
  {
    slug: 'lead-rescue-starter',
    name: 'Lead Rescue Starter',
    eyebrow: 'LOW-RISK STARTER',
    oneLine: 'Show the office which open opportunities deserve attention first.',
    availability: 'standalone',
    readiness: 'available_now',
    pricing: 'Introductory: complimentary 25-record review for qualified prospects',
    outcome: 'A small, client-approved lead list becomes a clear office-review queue with priorities and recommended next actions. No customer outreach is sent.',
    workflow: [
      'Review up to 25 open leads, estimates, or past inquiries approved by the client.',
      'Sort each record into needs attention, follow up, or close out.',
      'Give the office a prioritized action list and a practical upgrade recommendation.',
    ],
    needs: ['Up to 25 client-approved records', 'One office reviewer', 'A definition of a qualified opportunity', 'No provider connection required'],
    readyState: 'Available now as a manual, office-review starter · no automated outreach',
    nextStep: 'Open Leads to review or manually add the approved starter records.',
    href: tenantId => `/workspaces/${tenantId}/leads`,
    cta: 'Open lead rescue workspace',
  },
  {
    slug: 'quote-follow-up',
    name: 'No-Leak Quote Follow-Up',
    eyebrow: 'QUOTE RECOVERY',
    oneLine: 'Keep open estimates from disappearing after the visit.',
    availability: 'both',
    readiness: 'planned',
    pricing: 'Suggested: $1,500/month per location',
    outcome: 'A focused follow-up queue for quotes that have been waiting for a response, with a human approving every customer message.',
    workflow: [
      'Find quotes that have been pending longer than the office rule.',
      'Prepare a context-aware email or SMS draft using the estimate details.',
      'Route replies and hot leads back to the office for review.',
    ],
    needs: ['A quote or job source', 'A pending-time rule', 'Approved email or SMS connection', 'Office review owner'],
    readyState: 'Product design ready · outbound messaging stays off',
    nextStep: 'Connect a client quote source and prove one fictional follow-up before enabling any send.',
    href: tenantId => `/workspaces/${tenantId}/integrations`,
    cta: 'Review integration gates',
  },
  {
    slug: 'maintenance-reactivator',
    name: 'Commercial Maintenance Reactivator',
    eyebrow: 'RECURRING SERVICE',
    oneLine: 'Turn old service history into a seasonal maintenance review queue.',
    availability: 'both',
    readiness: 'setup_required',
    pricing: 'Suggested: $1,000/month + booked-visit fee, or $2,000/month flat',
    outcome: 'Spring and fall campaigns identify accounts beyond the 12-month service window and prepare personalized drafts for office approval.',
    workflow: [
      'Review completed service history and identify eligible accounts.',
      'Create a seasonal, safety-focused, or weather-planned draft.',
      'Approve the conversation, then choose an internal visit time when the customer is ready.',
    ],
    needs: ['Customer and completed-job history', 'An office reviewer', 'A seasonal campaign rule', 'Calendar approval before scheduling'],
    readyState: 'Guarded workflow available · external sends and weather lookups stay off',
    nextStep: 'Open Reactivation to create a review campaign using fictional or approved records.',
    href: tenantId => `/workspaces/${tenantId}/reactivation`,
    cta: 'Open reactivation',
  },
  {
    slug: 'blueprint-scope-intake',
    name: 'Blueprint & Scope Intake',
    eyebrow: 'COMMERCIAL BIDDING',
    oneLine: 'Give estimators a clean starting point for large bid packages.',
    availability: 'both',
    readiness: 'planned',
    pricing: 'Suggested: $3,000–$5,000/month for commercial estimating teams',
    outcome: 'A controlled intake workspace for organizing blueprint and RFP files, review questions, equipment counts, and scope notes before an estimator signs off.',
    workflow: [
      'Collect a proposal file and project context in one workspace.',
      'Separate extracted suggestions from verified scope decisions.',
      'Keep the estimator in control of every quantity, compliance note, and final export.',
    ],
    needs: ['Approved file upload location', 'A named estimator reviewer', 'Document retention rules', 'A verified export format'],
    readyState: 'Product design ready · no document is processed or exported from this catalog',
    nextStep: 'Open Integrations to record the approved document workflow before connecting a file processor.',
    href: tenantId => `/workspaces/${tenantId}/integrations`,
    cta: 'Plan document workflow',
  },
];

export function availabilityLabel(value: ProductAvailability): string {
  if (value === 'both') return 'Stand-alone or add-on';
  if (value === 'standalone') return 'Stand-alone product';
  return 'Optional add-on';
}

export function readinessLabel(value: ProductReadiness): string {
  if (value === 'available_now') return 'Available now';
  if (value === 'setup_required') return 'Setup & approval required';
  return 'Planned — not live';
}
