import Link from 'next/link';
import { AutomationControlForm } from './automation-control-form';
import { getAutomationControls } from '@/lib/server/automation-control-queries';
import { getWorkspace } from '@/lib/server/queries';
import { RetellMappingForm } from './retell-mapping-form';
import { RetellPauseForm } from './retell-pause-form';
import { getRetellAgentMappingHealth } from '@/app/actions/retell-provisioning';
import { MakeAuthorizationForm } from './make-authorization-form';
import { getOnboardingMilestones } from '@/lib/server/onboarding-milestones';
import { defaultOnboardingMilestones, type OnboardingMilestones } from '@/lib/onboarding-milestones';
import type { RetellRouteReadiness } from '@/lib/provisioning-readiness';

export const dynamic = 'force-dynamic';

type WorkspaceClient = Awaited<ReturnType<typeof getWorkspace>>['client'];

async function canManageRetellRoute(client: WorkspaceClient, tenantId: string) {
  try {
    const relation = await client
      .from('managed_client_workspaces')
      .select('client_tenant_id')
      .eq('client_tenant_id', tenantId)
      .in('status', ['onboarding', 'pilot', 'active'])
      .maybeSingle();
    return !relation.error && Boolean(relation.data);
  } catch {
    return false;
  }
}

function retellStatusLabel(status: RetellRouteReadiness) {
  if (status === 'active') return 'Active';
  if (status === 'paused') return 'Paused';
  if (status === 'not_mapped') return 'Not mapped';
  if (status === 'not_configured') return 'Server configuration needed';
  return 'Unavailable';
}

function retellRow(status: RetellRouteReadiness, milestones: OnboardingMilestones) {
  if (status === 'active' && milestones.retell_status === 'verified' && milestones.test_call_status === 'passed') return { status: 'Verification evidence recorded', safeState: 'An active trusted route plus verified Retell and passed fictional-test milestones are recorded for this client. These are operator records, not live provider telemetry.', nextStep: 'Have the Cevanta operator verify the evidence before approving the office-review scope.' };
  if (status === 'active') return { status: 'Mapped — test required', safeState: 'A trusted route is active, but workspace-specific verification or a passed fictional test call is missing.', nextStep: 'Run one fictional call and confirm exactly one lead appears in this workspace.' };
  if (status === 'paused') return { status: 'Paused', safeState: 'The workspace route is paused and should not be described as live.', nextStep: 'Review the client setup, test evidence, and rollback plan before resuming.' };
  if (status === 'not_mapped') return { status: 'Not mapped', safeState: 'No trusted Retell route is connected to this workspace.', nextStep: 'Map the client agent, then run one fictional end-to-end test call.' };
  if (status === 'not_configured') return { status: 'Server setup needed', safeState: 'The server-side Retell mapping service is not configured.', nextStep: 'Ask the Cevanta operator to finish private server configuration.' };
  return { status: 'Status unavailable', safeState: 'Route state could not be confirmed, so phone answering is not treated as verified.', nextStep: 'Retry the status check before making a client launch claim.' };
}

function makeRow(milestones: OnboardingMilestones) {
  if (milestones.make_status === 'verified' && milestones.test_call_status === 'passed') return { status: 'Verified evidence recorded', safeState: 'The saved milestone records a verified client route and passed fictional test. This is not live Make telemetry.', nextStep: 'Keep the approved scenario scope narrow and retain the rollback path.' };
  if (milestones.make_status === 'verified') return { status: 'Verification recorded — test required', safeState: 'Make is marked verified, but the workspace does not have a passed fictional end-to-end call recorded.', nextStep: 'Run and record the missing fictional call test.' };
  if (milestones.make_status === 'mapped') return { status: 'Mapped — test required', safeState: 'A client-specific Make mapping is recorded, but successful delivery has not been proven here.', nextStep: 'Confirm one call creates one lead and a duplicate creates no second lead.' };
  return { status: 'Not connected', safeState: 'No client-specific Make connection is recorded. A platform dry run for another workspace is not client proof.', nextStep: 'Create the private client authorization request, map the route, and test with fictional data.' };
}

function integrationRows(retellStatus: RetellRouteReadiness, milestones: OnboardingMilestones) {
  return [
  { name: 'Retell voice agent', ...retellRow(retellStatus, milestones) },
  { name: 'Make intake scenario', ...makeRow(milestones) },
  {
    name: 'Cevanta lead intake',
    status: milestones.test_call_status === 'passed' ? 'Client test recorded' : 'Platform path available',
    safeState: milestones.test_call_status === 'passed' ? 'A passed fictional test is recorded for this workspace; office review remains the only promised outcome.' : 'The app has a reviewed lead-ingestion path, but this workspace still needs its own end-to-end test.',
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
}

const safetyRules = [
  'Do not paste API keys, webhook URLs, private phone numbers, transcripts, recordings or real customer data into setup notes.',
  'Do not tell callers an appointment is booked until Cevanta has a confirmed office-reviewed booking result.',
  'Do not mark SMS, email, external calendar writes, booking, payments, subscription billing or dispatch active without explicit owner approval, test evidence and rollback notes.',
  'Use fictional records for demos unless a client has approved a live pilot test.',
];

export default async function IntegrationsReadiness({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const { tenant, role, client } = await getWorkspace(tenantId);
  const manager = role === 'owner' || role === 'admin';
  const [automation, milestoneMap, retellHealth, canManageRetell] = await Promise.all([
    getAutomationControls(tenantId),
    getOnboardingMilestones([tenantId]),
    manager ? getRetellAgentMappingHealth(tenantId) : Promise.resolve(null),
    manager ? canManageRetellRoute(client, tenantId) : Promise.resolve(false),
  ]);
  const { ready, controls, canManage } = automation;
  const milestones = milestoneMap.get(tenantId) ?? defaultOnboardingMilestones();
  const retellStatus: RetellRouteReadiness = retellHealth?.status ?? 'unavailable';
  const integrations = integrationRows(retellStatus, milestones);
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

      {manager && <section className="panel" aria-labelledby="retell-routing-title">
        <div className="section-heading"><div><span className="eyebrow">RETELL ROUTE</span><h2 id="retell-routing-title">{canManageRetell ? 'Connect this client’s receptionist' : 'Receptionist route health'}</h2></div><span className="pill">{canManageRetell ? 'Cevanta operator only' : 'Health only'}</span></div>
        <p className="notice" role="status">Route status: <strong>{retellStatusLabel(retellStatus)}</strong>. This non-sensitive status does not expose the Retell agent ID or provider telemetry.</p>
        {canManageRetell ? <>
          <p>Use this short flow for every client. The Make webhook is already configured once on the server, so you only need the client’s Retell Agent ID here.</p>
          <p className="notice" role="note"><strong>Manual ownership check required:</strong> open Retell and verify that the Agent ID belongs to this client before mapping it. Cevanta records your operator decision; it does not contact Retell to prove provider ownership.</p>
          <ol className="setup-readiness-list">
            <li><strong>Create or duplicate the client’s draft agent in Retell.</strong> Add the approved business rules and keep it unpublished.</li>
            <li><strong>Verify the client and Agent ID in Retell.</strong> Confirm the agent belongs to the intended client before copying its ID.</li>
            <li><strong>Assign and check the client phone number in Retell.</strong> Mapping in Cevanta does not publish the agent or configure phone routing.</li>
            <li><strong>Paste the Agent ID below.</strong> It begins with <code>agent_</code>; never paste an API key or webhook URL.</li>
            <li><strong>Make one fictional test call.</strong> Mapping alone does not prove live delivery; confirm exactly one office-review lead appears before requesting a live release.</li>
          </ol>
          <RetellMappingForm tenantId={tenantId}/>
          <RetellPauseForm tenantId={tenantId}/>
          <p className="small muted">Pausing is reversible and affects only this workspace’s trusted route. It does not delete the Retell agent, change phone routing, or revoke the API key.</p>
        </> : <p className="notice">Your workspace can view route health here. Mapping and pause controls are restricted to an authorized Cevanta internal owner or admin with an active managed-client relationship.</p>}
      </section>}

      {canManage && <section className="panel" aria-labelledby="make-authorization-title">
        <div className="section-heading"><div><span className="eyebrow">CLIENT CONNECTIONS</span><h2 id="make-authorization-title">Create a client authorization link</h2></div><span className="pill">Owner/admin only</span></div>
        <p>Enter the client’s name and email once. Cevanta creates a private Make request for the client’s approved Gmail and Google Calendar connections. Until request tracking is built, confirm completion in Make before updating this workspace’s saved milestone.</p>
        <p className="notice">The link does not activate booking, SMS, email, calendar writes or dispatch. Those remain separate approval-gated options.</p>
        <MakeAuthorizationForm tenantId={tenantId} />
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
