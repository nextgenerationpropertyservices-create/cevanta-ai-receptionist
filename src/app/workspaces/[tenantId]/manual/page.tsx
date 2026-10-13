import Link from 'next/link';
import { getWorkspace } from '@/lib/server/queries';

const operatingSections = [
  {
    title: 'Overview',
    href: '',
    purpose: 'Start here each morning. Overview shows new AI receptionist leads, open jobs, field-team workload, today\'s schedule, and the editable recovered-loss estimate.',
    actions: [
      'Adjust the ROI estimate if your average job value, close rate, or pilot cost changes.',
      'Open the newest lead when the dashboard says a lead needs office review.',
      'Check unassigned jobs before the day gets busy.',
    ],
  },
  {
    title: 'Notifications',
    href: '/notifications',
    purpose: 'Use Notifications when something needs attention and should not be missed.',
    actions: [
      'Review new AI receptionist leads first.',
      'Look for urgent or high-priority items before routine office work.',
      'Clear notifications by reviewing the related lead, job, or calendar item.',
    ],
  },
  {
    title: 'Leads',
    href: '/leads',
    purpose: 'Use Leads as the office-review inbox for caller requests, missed-call recovery, and manual service requests.',
    actions: [
      'Open each new AI receptionist lead and verify the service need, urgency, location, contact details, and preferred time.',
      'Do not treat a preferred time as a confirmed appointment until the office approves it.',
      'Convert a lead to a job only after the office accepts the request details.',
    ],
  },
  {
    title: 'Jobs',
    href: '/jobs',
    purpose: 'Use Jobs to organize accepted work, assign field responsibility, and track status.',
    actions: [
      'Keep urgent jobs visible and assign them manually based on skill, area, and availability.',
      'Use clear job titles and descriptions so technicians know what to expect.',
      'Update job status as work moves from new to scheduled to completed or cancelled.',
    ],
  },
  {
    title: 'Technicians',
    href: '/technicians',
    purpose: 'Use Technicians to manage the field team roster, skills, service areas, and availability notes.',
    actions: [
      'Add or update technician skills before assigning specialized jobs.',
      'Keep service areas current so dispatch decisions make sense.',
      'Use availability notes to avoid sending work to the wrong person at the wrong time.',
    ],
  },
  {
    title: 'Calendar',
    href: '/calendar',
    purpose: 'Use Calendar to see scheduled work by year, month, week, day, or hour.',
    actions: [
      'Check unassigned and urgent work before adding more appointments.',
      'Click a calendar job to review its details.',
      'Use the calendar as an office planning tool; external calendar writes stay gated until approved and tested.',
    ],
  },
  {
    title: 'Setup',
    href: '/onboarding',
    purpose: 'Use Setup to keep business details, services, hours, service area, emergency rules, escalation contacts, and never-promise rules current.',
    actions: [
      'Update services and hours before changing AI receptionist behavior.',
      'Keep escalation contacts accurate so urgent calls have a safe office route.',
      'Write never-promise rules clearly so callers are not promised quotes, dispatch, or appointments without approval.',
    ],
  },
  {
    title: 'Launch',
    href: '/launch',
    purpose: 'Use Launch to check whether the workspace is ready for a managed pilot or a future automation step.',
    actions: [
      'Review readiness gates before sending traffic to the AI receptionist.',
      'Confirm test-call proof before turning on any higher-risk workflow.',
      'Pause if the page shows provider, routing, setup, or recovery items that still need work.',
    ],
  },
  {
    title: 'Billing',
    href: '/billing',
    purpose: 'Use Billing to understand pilot cost, payment status, and which payment features are still approval-gated.',
    actions: [
      'Review the current setup and monthly pilot amount with the owner.',
      'Use payment links or invoices handled outside Cevanta until in-app payment collection is approved and tested.',
      'Treat subscription billing as off until separately configured, approved, and tested.',
    ],
  },
  {
    title: 'Integrations',
    href: '/integrations',
    purpose: 'Use Integrations to review optional communication and automation controls.',
    actions: [
      'Keep SMS, email, calendar writes, automatic booking, payments, and dispatch automation off until each one has approval, test evidence, and rollback notes.',
      'Use integration controls as gates, not proof that the provider is live.',
      'Document provider decisions before changing customer-facing behavior.',
    ],
  },
];

const dailyRoutine = [
  'Open Overview and check the attention banner, new AI leads, open jobs, and today\'s scheduled visits.',
  'Open Notifications and work the highest-priority items first.',
  'Review every new AI receptionist lead before promising a time, quote, dispatch, or callback.',
  'Assign accepted jobs to technicians using skills, service area, and availability notes.',
  'Check Calendar before confirming any appointment with a customer.',
  'End the day by making sure no urgent lead or unassigned job is left without an owner.',
];

const weeklyReview = [
  'Update Setup if services, hours, service area, escalation contacts, or call rules changed.',
  'Review the ROI estimator against real job values and actual close rate.',
  'Look at missed details, duplicate requests, urgent calls, and manual corrections.',
  'Decide whether any automation is ready for a small controlled test.',
  'Keep office-review mode in place until the owner approves a tested automation path.',
];

const stopRules = [
  'The AI promises a confirmed appointment, exact price, payment, dispatch, or emergency outcome without office approval.',
  'SMS, email, calendar writes, automatic booking, payment collection, or dispatch automation turns on before approval and testing.',
  'Duplicate leads or duplicate jobs appear from one call.',
  'A caller reports a real emergency that needs local emergency help instead of routine intake.',
  'Private customer data, provider credentials, account pages, recordings, or transcripts appear where they do not belong.',
];

export default async function OwnerManual({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const { tenant, role } = await getWorkspace(tenantId);
  const base = `/workspaces/${tenant.id}`;

  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">DASHBOARD OPERATING MANUAL</span>
        <h1>How to run {tenant.name} inside Cevanta.</h1>
        <p>
          A plain-language guide for HVAC and trade-service owners. Use it to train the office, review AI receptionist work, and keep automation safe.
        </p>
      </div>

      <section className="notice" role="status" aria-labelledby="manual-boundary">
        <h2 id="manual-boundary">Current operating mode</h2>
        <p>
          Your {role} access can use this manual to run the dashboard. Cevanta should be treated as office-review first unless a specific automation is approved,
          tested, and documented in Integrations. This page does not turn on SMS, email, external calendar writes, automatic booking, payments, or dispatch automation.
        </p>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">QUICK START</span>
            <h2>The daily office routine</h2>
          </div>
          <Link className="button secondary" href={base}>Open overview ↗</Link>
        </div>
        <ol className="setup-readiness-list">
          {dailyRoutine.map(item => <li key={item}>{item}</li>)}
        </ol>
      </section>

      <section className="panel">
        <span className="eyebrow">SECTION GUIDE</span>
        <h2>What each dashboard section is for</h2>
        <div className="manual-section-grid">
          {operatingSections.map(section => (
            <article key={section.title} className="manual-section-card">
              <div className="section-heading">
                <div>
                  <h3>{section.title}</h3>
                  <p>{section.purpose}</p>
                </div>
                <Link className="card-link" href={`${base}${section.href}`}>Open ↗</Link>
              </div>
              <ul className="setup-readiness-list">
                {section.actions.map(action => <li key={action}>{action}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <div className="split-layout">
        <section className="panel">
          <span className="eyebrow">WEEKLY OWNER REVIEW</span>
          <h2>Use this before changing the AI or automation</h2>
          <ul className="setup-readiness-list">
            {weeklyReview.map(item => <li key={item}>{item}</li>)}
          </ul>
        </section>
        <section className="panel">
          <span className="eyebrow">AI RECEPTIONIST BOUNDARIES</span>
          <h2>Keep the office in control</h2>
          <p className="small muted">
            The AI can help capture a caller&apos;s service request, but the office should confirm appointments, pricing, dispatch, messages, and calendar changes unless those actions have been separately approved and tested.
          </p>
          <div className="button-row">
            <Link className="button secondary" href={`${base}/launch`}>Launch gates ↗</Link>
            <Link className="button secondary" href={`${base}/integrations`}>Automation controls ↗</Link>
          </div>
        </section>
      </div>

      <section className="panel">
        <span className="eyebrow">STOP RULES</span>
        <h2>Pause and review if any of these happen</h2>
        <ul className="setup-readiness-list">
          {stopRules.map(rule => <li key={rule}>{rule}</li>)}
        </ul>
      </section>
    </>
  );
}
