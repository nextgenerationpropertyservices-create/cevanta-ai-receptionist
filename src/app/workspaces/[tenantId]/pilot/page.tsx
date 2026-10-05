import Link from 'next/link';
import { getWorkspace } from '@/lib/server/queries';

const phases = [
  {
    name: 'Before the first live call',
    goal: 'Make sure the client, office reviewer and AI boundaries are clear.',
    steps: [
      'Complete Setup: business details, services, weekly hours, date exceptions, request rules and escalation contacts.',
      'Review Launch and Integrations so everyone understands what is proven and what remains gated.',
      'Confirm the AI may answer calls only as a managed pilot with office review.',
      'Keep SMS, email, external calendar writes and production deployment off unless separately approved.',
    ],
  },
  {
    name: 'During pilot call day',
    goal: 'Watch call outcomes and protect the customer experience.',
    steps: [
      'Keep a person responsible for checking new AI receptionist leads during the pilot window.',
      'Treat every AI-created request as unconfirmed until office staff reviews it.',
      'If a caller asks for emergency help, follow the client-approved escalation rule instead of letting automation decide.',
      'Record only safe notes in Cevanta; do not paste transcripts, recordings, passwords, API keys or private webhook URLs.',
    ],
  },
  {
    name: 'After each AI lead',
    goal: 'Turn captured requests into office-controlled follow-up.',
    steps: [
      'Open the lead, confirm name, contact details, service need, urgency and preferred time.',
      'Convert the request to a job only after the office accepts the details.',
      'Schedule internally only when the office has confirmed availability.',
      'Mark the lead contacted or scheduled so the new AI lead notice clears.',
    ],
  },
  {
    name: 'End of week review',
    goal: 'Decide whether to continue, adjust or pause the pilot.',
    steps: [
      'Count captured requests, missed details, urgent calls, duplicates and manual corrections.',
      'Update services, call wording, office-review rules and escalation rules before adding automation.',
      'Do not add SMS, email, calendar writes or automatic booking until the week-one results are reviewed.',
      'Save owner decisions before changing live provider routing.',
    ],
  },
];

const stopRules = [
  'The AI promises a confirmed appointment without verified office approval.',
  'A live provider starts sending SMS, email or calendar writes without explicit approval.',
  'Duplicate live events create duplicate customer-facing work.',
  'A caller reports unsafe emergency handling or wrong escalation instructions.',
  'Secrets, private webhook URLs, call recordings, transcripts or real customer lists appear in demo or project notes.',
];

export default async function PilotRunbook({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const { tenant, role } = await getWorkspace(tenantId);
  const base = `/workspaces/${tenant.id}`;

  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">PILOT RUNBOOK</span>
        <h1>Run the first client safely.</h1>
        <p>
          Use this page to operate a managed AI receptionist pilot with office review. It is a runbook, not approval for production automation.
        </p>
      </div>

      <section className="notice" role="status" aria-labelledby="pilot-posture">
        <h2 id="pilot-posture">Pilot posture</h2>
        <p>
          {tenant.name} can run a managed voice pilot when the owner approves the live call window. Your {role} access can review this runbook, but external sends,
          automatic booking, provider writes and production deployment stay off until separately approved.
        </p>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">OPERATING PHASES</span>
            <h2>What to do at each stage</h2>
          </div>
          <Link className="button secondary" href={`${base}/launch`}>Review launch gates ↗</Link>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Phase</th>
                <th>Goal</th>
                <th>Checklist</th>
              </tr>
            </thead>
            <tbody>
              {phases.map(phase => (
                <tr key={phase.name}>
                  <td><strong>{phase.name}</strong></td>
                  <td>{phase.goal}</td>
                  <td>
                    <ul className="setup-readiness-list">
                      {phase.steps.map(step => <li key={step}>{step}</li>)}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="split-layout">
        <section className="panel">
          <span className="eyebrow">STOP RULES</span>
          <h2>Pause the pilot if any of these happen</h2>
          <ul className="setup-readiness-list">
            {stopRules.map(rule => <li key={rule}>{rule}</li>)}
          </ul>
        </section>
        <section className="panel">
          <span className="eyebrow">DAILY CHECK</span>
          <h2>End each pilot day with this review</h2>
          <ol className="setup-readiness-list">
            <li>Open Leads and confirm every AI receptionist lead has an owner.</li>
            <li>Open Jobs and confirm accepted work has clear next steps.</li>
            <li>Open Calendar and confirm internal appointments match office decisions.</li>
            <li>Open Integrations and confirm no gated provider action was enabled accidentally.</li>
          </ol>
        </section>
      </div>

      <section className="panel dispatch-create">
        <span className="eyebrow">PILOT WORKSPACE</span>
        <h2>Open the tools you need</h2>
        <div className="button-row">
          <Link className="button secondary" href={`${base}/onboarding`}>Setup ↗</Link>
          <Link className="button secondary" href={`${base}/integrations`}>Integrations ↗</Link>
          <Link className="button secondary" href={`${base}/leads`}>Leads ↗</Link>
          <Link className="button secondary" href={`${base}/jobs`}>Jobs ↗</Link>
          <Link className="button secondary" href={`${base}/calendar`}>Calendar ↗</Link>
        </div>
      </section>
    </>
  );
}
