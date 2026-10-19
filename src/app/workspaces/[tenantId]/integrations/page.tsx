import Link from 'next/link';
import { AutomationControlForm } from './automation-control-form';
import { getAutomationControls } from '@/lib/server/automation-control-queries';
import { getWorkspace } from '@/lib/server/queries';
import { RetellMappingForm } from './retell-mapping-form';
import { RetellPauseForm } from './retell-pause-form';
import { getRetellAgentMappingHealth } from '@/app/actions/retell-provisioning';

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
    status: 'Hosted intake ready',
    safeState: 'The app has a reviewed Retell lead-ingestion path and in-app AI lead notices.',
    nextStep: 'Keep office-review mode on. Run each new client through a controlled test call before enabling live provider writes.',
  },
  {
    name: 'Twilio and SMS',
    status: 'Optional controlled write',
    safeState: 'SMS stays off by default until provider registration, consent language, opt-out handling, test evidence and owner approval are complete.',
    nextStep: 'Use the client automation controls below to track readiness before any SMS can be treated as active.',
  },
  {
    name: 'Email follow-up',
    status: 'Optional controlled write',
    safeState: 'Email stays off by default until sender, template, delivery and approval checks are complete.',
    nextStep: 'Track provider notes and test evidence before enabling client follow-up email.',
  },
  {
    name: 'Google Calendar writers',
    status: 'Optional controlled write',
    safeState: 'Cevanta can track appointments in the workspace calendar now. External calendar writes stay off until conflict checks, test calls and rollback rules are approved.',
    nextStep: 'Prepare calendar writes as an optional controlled action; do not auto-book or promise availability until the booking gate is separately active.',
  },
  {
    name: 'Billing, booking and dispatch',
    status: 'Optional, high-control gates',
    safeState: 'Payment collection, subscription billing, automatic booking and dispatch automation can be tracked as options, but no live charges, confirmed bookings or dispatches happen from this page.',
    nextStep: 'Keep each high-risk feature in requested/testing/ready until the owner signs off and a rollback plan exists.',
  },
];

const safetyRules = [
  'Do not paste API keys, webhook URLs, private phone numbers, transcripts, recordings or real customer data into setup notes.',
  'Do not tell callers an appointment is booked until Cevanta has a confirmed office-reviewed booking result.',
  'Do not mark SMS, email, external calendar writes, booking, payments, subscription billing or dispatch active without explicit owner approval, test evidence and rollback notes.',
  'Use fictional records for demos unless a client has approved a live pilot test.',
];

export default async function IntegrationsReadiness({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const { tenant, role } = await getWorkspace(tenantId);
  const { ready, controls, canManage } = await getAutomationControls(tenantId);
  const retellHealth = canManage ? await getRetellAgentMappingHealth(tenantId) : null;
  const base = `/workspaces/${tenant.id}`;

  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">INTEGRATIONS</span>
        <h1>Control every automation client by client.</h1>
        <p>
          Turn SMS, email, external calendar writes, booking, payments, subscriptions and dispatch into optional client features without allowing untested live actions.
        </p>
      </div>

      <section className="notice" role="status" aria-labelledby="integration-summary">
        <h2 id="integration-summary">Safe integration posture</h2>
        <p>
          {tenant.name} can use Cevanta in office-review mode while each automation option moves through its own approval path. This page records readiness; it does not send messages, write external calendars, charge cards, create subscriptions, confirm bookings or dispatch technicians by itself.
        </p>
      </section>

      <div className="stat-grid">
        <div className="panel stat">
          <span>Your access</span>
          <strong className="role-value">{role}</strong>
          <p>Only owners and admins can change automation controls.</p>
        </div>
        <div className="panel stat">
          <span>Provider writes</span>
          <strong className="role-value">Optional</strong>
          <p>SMS, email and calendar writes require approval, testing and rollback evidence.</p>
        </div>
        <div className="panel stat">
          <span>High-risk actions</span>
          <strong className="role-value">Gated</strong>
          <p>Booking, payments, subscriptions and dispatch need separate proof before active status.</p>
        </div>
      </div>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">SERVICE MAP</span>
            <h2>Provider readiness</h2>
          </div>
          <div className="button-row"><Link className="button secondary" href={`${base}/launch`}>Open launch plan ↗</Link><Link className="button secondary" href={`${base}/go-live`}>Open Go Live center ↗</Link></div>
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

      {canManage && <section className="panel" aria-labelledby="retell-routing-title">
        <div className="section-heading"><div><span className="eyebrow">TRUSTED ROUTING</span><h2 id="retell-routing-title">Map this client’s Retell draft</h2></div><span className="pill">Owner/admin only</span></div>
        <p>After you create the client’s Retell draft, enter its agent ID here. Cevanta stores the workspace mapping server-side for the shared Make intake. This does not publish the agent, change phone routing, or enable live writes.</p>
        <p className="notice" role="status">Route status: <strong>{retellHealth?.status === 'active' ? 'Active' : retellHealth?.status === 'paused' ? 'Paused' : retellHealth?.status === 'not_mapped' ? 'Not mapped' : retellHealth?.status === 'not_configured' ? 'Server configuration needed' : 'Unavailable'}</strong>. This status does not expose the Retell agent ID.</p>
        <RetellMappingForm tenantId={tenantId}/>
        <RetellPauseForm tenantId={tenantId}/>
        <p className="small muted">Pausing is reversible and affects only this workspace’s trusted route. It does not delete the Retell agent or revoke the API key.</p>
      </section>}

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">AUTOMATION CONTROLS</span>
            <h2>Optional features for this client</h2>
            <p>Each option has its own visibility, approval, test evidence, rollback plan and activation state.</p>
          </div>
          <span className="pill">Approval gated</span>
        </div>
        {!ready && <p className="notice">Automation controls need the database migration before saved changes will work. The defaults below show the intended options.</p>}
        {ready && !canManage && <p className="notice">You are viewing the automation catalog only. Current status, approvals, test evidence and rollback notes are restricted to owners and admins.</p>}
        <div className="automation-control-grid">
          {controls.map(control => <AutomationControlForm key={control.capability} control={control} canManage={canManage} />)}
        </div>
        <p className="notice">These controls store decisions and readiness. Open Go Live to see the complete setup, test, approval and rollback path before these features affect customers.</p>
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
            <li>Written approval before any live external message, calendar write, booking promise, payment, subscription or dispatch automation.</li>
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
          <Link className="button secondary" href={`${base}/settings`}>Settings ↗</Link><Link className="button secondary" href={`${base}/go-live`}>Go Live ↗</Link>
        </div>
      </section>
    </>
  );
}
