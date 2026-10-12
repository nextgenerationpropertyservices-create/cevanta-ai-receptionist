import Link from 'next/link';
import { getWorkspace } from '@/lib/server/queries';

const integrations = [
  {
    name: 'Retell voice agent',
    status: 'Phone answering tested',
    safeState: 'Can answer pilot calls through the configured Retell receptionist agent.',
    nextStep: 'Keep credits funded, then approve when to connect call outcomes to Make or Cevanta.',
  },
  {
    name: 'Make intake scenario',
    status: 'Safe receiver tested',
    safeState: 'Fictional call-analysis payloads create one office-review record, duplicate deliveries do not create another, and non-analysis events are ignored.',
    nextStep: 'Leave inactive until Retell webhook connection and production write policy are approved.',
  },
  {
    name: 'Cevanta lead intake',
    status: 'Local contract ready',
    safeState: 'The app has a reviewed Retell lead-ingestion path and in-app AI lead notices.',
    nextStep: 'Add server-only production configuration and run a controlled hosted test before live provider writes.',
  },
  {
    name: 'Twilio and SMS',
    status: 'Deferred',
    safeState: 'Twilio business/SMS registration is not ready for client messaging.',
    nextStep: 'Use Retell voice first. Add SMS only after registration, consent language, opt-out handling and owner approval.',
  },
  {
    name: 'Google Calendar writers',
    status: 'Manual review only',
    safeState: 'Cevanta can track appointments in the workspace calendar, but live external calendar writes are not enabled.',
    nextStep: 'Keep office review as the first offer. Add calendar writes after availability, conflict and rollback rules are approved.',
  },
  {
    name: 'Billing and production',
    status: 'Not live',
    safeState: 'No production deployment, subscription billing, or automatic client onboarding claim is approved yet.',
    nextStep: 'Finish release gates, domain/email setup, backups, monitoring, and owner approval before selling as self-service production.',
  },
];


const automationControls = [
  { name: 'Automatic booking', state: 'Off until approved', meaning: 'Cevanta can collect preferred appointment windows, but the office confirms the final booking until availability, conflict checks and rollback are proven.' },
  { name: 'SMS or email messages', state: 'Off until approved', meaning: 'Follow-up messages need client approval, consent language, opt-out handling and provider readiness before any live send.' },
  { name: 'External calendar writes', state: 'Off until approved', meaning: 'The dashboard calendar can track appointments now. Google or other external calendar writes need a tested writer and recovery plan.' },
  { name: 'Dispatch automation', state: 'Off until approved', meaning: 'Cevanta can suggest technicians by skills, service area and availability. Automatic assignment waits for client rules and manual acceptance evidence.' },
];
const safetyRules = [
  'Do not paste API keys, webhook URLs, private phone numbers, transcripts, recordings or real customer data into setup notes.',
  'Do not tell callers an appointment is booked until Cevanta has a confirmed office-reviewed booking result.',
  'Do not enable SMS, email, calendar writers, always-on Make activation or production deploys without explicit approval.',
  'Use fictional records for demos unless a client has approved a live pilot test.',
];

export default async function IntegrationsReadiness({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const { tenant, role } = await getWorkspace(tenantId);
  const base = `/workspaces/${tenant.id}`;

  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">INTEGRATIONS</span>
        <h1>Connect calls without overpromising.</h1>
        <p>
          Review which outside services are proven, which are waiting, and which actions need owner approval before this workspace handles client calls automatically.
        </p>
      </div>

      <section className="notice" role="status" aria-labelledby="integration-summary">
        <h2 id="integration-summary">Safe integration posture</h2>
        <p>
          {tenant.name} can be shown as a managed AI receptionist pilot. Retell voice and Make safe intake have evidence; SMS, external calendar writes, billing and production release remain off.
        </p>
      </section>

      <div className="stat-grid">
        <div className="panel stat">
          <span>Your access</span>
          <strong className="role-value">{role}</strong>
          <p>Only approved workspace roles should manage setup and provider decisions.</p>
        </div>
        <div className="panel stat">
          <span>Provider writes</span>
          <strong className="role-value">Off</strong>
          <p>Live writes stay gated until approved and verified.</p>
        </div>
        <div className="panel stat">
          <span>First package</span>
          <strong className="role-value">Voice pilot</strong>
          <p>Retell answers, office staff reviews, Cevanta tracks.</p>
        </div>
      </div>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">SERVICE MAP</span>
            <h2>Provider readiness</h2>
          </div>
          <Link className="button secondary" href={`${base}/launch`}>Open launch plan ↗</Link>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Status</th>
                <th>Safe state</th>
                <th>Next step</th>
              </tr>
            </thead>
            <tbody>
              {integrations.map(item => (
                <tr key={item.name}>
                  <td><strong>{item.name}</strong></td>
                  <td>{item.status}</td>
                  <td>{item.safeState}</td>
                  <td>{item.nextStep}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">AUTOMATION CONTROLS</span>
            <h2>Options that can be turned on later</h2>
          </div>
          <span className="pill">Approval gated</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Automation</th>
                <th>Current state</th>
                <th>What this means</th>
              </tr>
            </thead>
            <tbody>
              {automationControls.map(item => (
                <tr key={item.name}>
                  <td><strong>{item.name}</strong></td>
                  <td>{item.state}</td>
                  <td>{item.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="notice">These controls are planned as client-by-client options. They do not send messages, confirm bookings, write calendars or dispatch technicians from this page.</p>
      </section>
      <div className="split-layout">
        <section className="panel">
          <span className="eyebrow">SAFETY RULES</span>
          <h2>Keep these gates closed</h2>
          <ul className="setup-readiness-list">
            {safetyRules.map(rule => <li key={rule}>{rule}</li>)}
          </ul>
        </section>
        <section className="panel">
          <span className="eyebrow">NEXT CLIENT SETUP</span>
          <h2>What to collect before activation</h2>
          <ol className="setup-readiness-list">
            <li>Business name, service area, hours, emergency policy and escalation contact.</li>
            <li>Services offered and request types the AI receptionist may recognize.</li>
            <li>Office-review rules for when staff should call back, create a job or schedule manually.</li>
            <li>Written approval before any live external message, calendar write or production launch.</li>
          </ol>
        </section>
      </div>

      <section className="panel dispatch-create">
        <span className="eyebrow">WORKSPACE FLOW</span>
        <h2>Continue setup inside Cevanta</h2>
        <div className="button-row">
          <Link className="button secondary" href={`${base}/onboarding`}>Setup business ↗</Link>
          <Link className="button secondary" href={`${base}/leads`}>Review leads ↗</Link>
          <Link className="button secondary" href={`${base}/calendar`}>Check calendar ↗</Link>
          <Link className="button secondary" href={`${base}/settings`}>Settings ↗</Link>
        </div>
      </section>
    </>
  );
}

