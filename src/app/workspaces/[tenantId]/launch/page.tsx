import Link from 'next/link';
import { SELF_SERVICE_ONBOARDING_STEPS, STANDARD_PROVIDER_BOUNDARIES, templateForTrade } from '@/lib/client-onboarding-blueprint';
import { buildProvisioningReadiness, provisioningStateLabel } from '@/lib/provisioning-readiness';
import { getAutomationControls } from '@/lib/server/automation-control-queries';
import { getOnboardingSnapshot } from '@/lib/server/onboarding-rpc';
import { getWorkspace } from '@/lib/server/queries';
import { getRetellAgentMappingHealth } from '@/app/actions/retell-provisioning';
import type { RetellRouteReadiness } from '@/lib/provisioning-readiness';
import { getOnboardingMilestones } from '@/lib/server/onboarding-milestones';
import { defaultOnboardingMilestones, milestoneLabel, type OnboardingMilestones } from '@/lib/onboarding-milestones';

function retellReadiness(route: RetellRouteReadiness, milestones: OnboardingMilestones) {
  if (route === 'active' && milestones.retell_status === 'verified' && milestones.test_call_status === 'passed') {
    return { status: 'Verification evidence recorded', detail: 'An active trusted route plus verified Retell and passed fictional-test milestones are recorded for this client. These are operator records, not provider telemetry, and office review still applies.' };
  }
  if (route === 'active') return { status: 'Mapped — test needed', detail: 'A trusted route is active, but this workspace does not yet have both Retell verification and a passed fictional test call recorded.' };
  if (route === 'paused') return { status: 'Paused', detail: 'The trusted route is paused. Resume it only after reviewing the client setup, test evidence, and rollback plan.' };
  if (route === 'not_mapped') return { status: 'Not connected', detail: 'No trusted Retell route is mapped to this workspace.' };
  if (route === 'not_configured') return { status: 'Server setup needed', detail: 'The server-side Retell mapping service is not configured for this workspace.' };
  return { status: 'Status unavailable', detail: 'Retell route status could not be confirmed. Do not describe phone answering as live until it can be checked.' };
}

function makeReadiness(milestones: OnboardingMilestones) {
  if (milestones.make_status === 'verified' && milestones.test_call_status === 'passed') return { status: 'Verified evidence recorded', detail: 'The saved client milestone records a verified Make route and passed fictional test call. This is an operator record, not live provider telemetry.' };
  if (milestones.make_status === 'verified') return { status: 'Verification recorded — test needed', detail: 'Make is marked verified, but a passed fictional end-to-end test call is not recorded for this workspace.' };
  if (milestones.make_status === 'mapped') return { status: 'Mapped — test needed', detail: 'A Make mapping is recorded. Run a fictional end-to-end call and confirm one correct office-review lead before launch.' };
  return { status: 'Not connected', detail: 'No client-specific Make connection is recorded. Platform dry runs from another workspace do not prove this client route.' };
}

function readinessRows(route: RetellRouteReadiness, milestones: OnboardingMilestones) {
  const retell = retellReadiness(route, milestones);
  const make = makeReadiness(milestones);
  const launchEvidenceRecorded = milestones.launch_approval_status === 'approved' && milestones.test_call_status === 'passed' && milestones.retell_status === 'verified' && milestones.make_status === 'verified' && route === 'active';
  return [
    { area: 'Dashboard and customer records', status: 'Available in Cevanta', detail: 'Workspace, customers, leads, jobs, calendar and setup screens are available to authorized members after sign-in.' },
    { area: 'Retell phone answering', ...retell },
    { area: 'Make intake receiver', ...make },
    { area: 'Lead notification inside Cevanta', status: 'Available in app', detail: 'New AI receptionist leads can show review notices in the workspace after a verified intake reaches the correct tenant. External SMS or email alerts are not enabled by this page.' },
    { area: 'Booking and client follow-up', status: 'Office review required', detail: 'Cevanta can track requests and appointments, but staff should confirm bookings and customer follow-up unless that exact integration has separate approval and test evidence.' },
    { area: 'Client activation', status: launchEvidenceRecorded ? 'Operator verification required' : 'Not ready for live activation', detail: launchEvidenceRecorded ? 'All expected milestones are recorded, but the provisioning activation gate remains blocked until a trusted operator verifies the evidence and approved scope. Optional messages, booking, billing, calendar writes, and dispatch remain separate gates.' : 'Client activation still needs the missing route, integration, fictional test-call, and approval evidence shown on this page.' },
  ];
}

const ownerItems = [
  'Keep Retell credits funded before demos or live calls.',
  'Confirm the active Retell route belongs to this client before placing a test call.',
  'Record Make, Retell, test-call, and launch milestones only after reviewing the matching evidence.',
  'Approve any always-on Make activation, SMS, email or calendar-writing workflow before it goes live.',
  'Complete Twilio business/SMS registration later if SMS follow-up becomes part of the paid package.',
];

const nextWork = [
  'Finish any missing required setup fields and review the saved receptionist rules.',
  'Map the client-specific Retell route and connect approved Make credentials privately.',
  'Run one fictional end-to-end call and confirm exactly one lead appears in this workspace.',
  'Record the result, rollback path, and approved client scope before activation.',
];

export default async function LaunchReadiness({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const { tenant, role } = await getWorkspace(tenantId);
  const base = `/workspaces/${tenant.id}`;
  const template = templateForTrade(tenant.trade);
  const [onboarding, automation, milestoneMap] = await Promise.all([getOnboardingSnapshot(tenant.id), getAutomationControls(tenant.id), getOnboardingMilestones([tenant.id])]);
  const ownerSnapshot = onboarding.status === 'available' && onboarding.snapshot.projection === 'owner_setup' ? onboarding.snapshot : null;
  const retellRoute: RetellRouteReadiness = role === 'owner' || role === 'admin' ? (await getRetellAgentMappingHealth(tenant.id)).status : 'unavailable';
  const provisioning = buildProvisioningReadiness(ownerSnapshot, automation.controls, retellRoute);
  const milestones = milestoneMap.get(tenant.id) ?? defaultOnboardingMilestones();
  const verifiedRows = readinessRows(retellRoute, milestones);

  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">LAUNCH READINESS</span>
        <h1>Sell the first version carefully.</h1>
        <p>
          This page separates what is recorded for this workspace from what still needs owner approval before Cevanta runs as a live AI receptionist for {tenant.trade.toLowerCase()} clients.
        </p>
      </div>

      <section className="notice" role="status" aria-labelledby="launch-current-position">
        <h2 id="launch-current-position">Current position</h2>
        <p>
          {tenant.name} has {provisioning.readyCount} of {provisioning.totalCount} preparation gates marked ready. Retell is {retellReadiness(retellRoute, milestones).status.toLowerCase()}, Make is {makeReadiness(milestones).status.toLowerCase()}, and the saved fictional test-call milestone is {milestoneLabel(milestones.test_call_status).toLowerCase()}. Automatic booking, SMS, email, billing, calendar writes, and dispatch remain separate gates.
        </p>
      </section>

      <div className="stat-grid">
        <div className="panel stat">
          <span>Workspace role</span>
          <strong className="role-value">{role}</strong>
          <p>Launch controls follow the same workspace access rules as the rest of Cevanta.</p>
        </div>
        <div className="panel stat">
          <span>First offer</span>
          <strong className="role-value">Office-review pilot</strong>
          <p>Sell only the client scope supported by the recorded route and test evidence.</p>
        </div>
        <div className="panel stat">
          <span>Live automation</span>
          <strong className="role-value">Gated</strong>
          <p>Provider writers stay off until approved and verified.</p>
        </div>
      </div>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">READINESS CHECK</span>
            <h2>What works now</h2>
          </div>
          <Link className="button secondary" href={`${base}/onboarding`}>Open setup ↗</Link>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Area</th>
                <th>Status</th>
                <th>Meaning</th>
              </tr>
            </thead>
            <tbody>
              {verifiedRows.map(row => (
                <tr key={row.area}>
                  <td><strong>{row.area}</strong></td>
                  <td>{row.status}</td>
                  <td>{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">PROVISIONING READINESS</span>
            <h2>Client go-live checklist</h2>
          </div>
          <span className="pill">{provisioning.readyCount} of {provisioning.totalCount} ready</span>
        </div>
        <p>{provisioning.safeSummary}</p>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Gate</th><th>Status</th><th>Meaning</th><th>Next action</th></tr></thead>
            <tbody>{provisioning.gates.map(gate => <tr key={gate.key}><td><strong>{gate.label}</strong></td><td>{provisioningStateLabel(gate.state)}</td><td>{gate.summary}</td><td>{gate.nextAction}</td></tr>)}</tbody>
          </table>
        </div>
        <p className="small muted">This checklist distinguishes saved setup, manual provider work and blocked activation. It does not reveal provider identifiers, webhook URLs, API keys, private Retell IDs or real customer data.</p>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">SELF-SERVICE CLIENT PATH</span>
            <h2>Use one controlled path for every client</h2>
          </div>
          <span className="pill">{template.label}</span>
        </div>
        <p>The dashboard should be the control center: the client fills out setup, authorizes supported tools, reviews the generated receptionist, completes a fictional test call, then approves only eligible activation gates.</p>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Step</th><th>Client action</th><th>Gate before moving on</th></tr></thead>
            <tbody>{SELF_SERVICE_ONBOARDING_STEPS.map(step => <tr key={step.title}><td><strong>{step.title}</strong><p className="small muted">{step.systemUse}</p></td><td>{step.ownerAction}</td><td>{step.gate}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">STORED ONBOARDING STATE</span>
            <h2>What has been recorded for this workspace</h2>
          </div>
          <span className="pill">Owner review</span>
        </div>
        <p>These milestones summarize setup progress. They are review records only; saving a status never enables a provider or sends an external message.</p>
        <div className="client-milestone-strip" aria-label="Stored onboarding milestones">
          {Object.entries(milestones).filter(([key]) => key !== 'updated_at').map(([key, value]) => (
            <span key={key} className={`milestone-${value}`}><b>{milestoneLabel(key.replace('_status', '').replace('launch_approval', 'launch'))}</b>{milestoneLabel(value ?? '')}</span>
          ))}
        </div>
        <p className="small muted">Update these from the internal Clients page after you confirm payment, setup, test-call, integration, and launch evidence.</p>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">MAKE / RETELL / CEVANTA BOUNDARY</span>
            <h2>Standard intake workflow rules</h2>
          </div>
          <span className="pill">Office review first</span>
        </div>
        <ul className="setup-readiness-list">{STANDARD_PROVIDER_BOUNDARIES.map(item => <li key={item}>{item}</li>)}</ul>
        <p className="small muted">This page does not expose webhook URLs, API keys, provider secrets, private Retell IDs, or real customer data. Provider activation still needs separate test evidence and rollback notes.</p>
      </section>

      <div className="split-layout">
        <section className="panel">
          <span className="eyebrow">NEEDS OWNER ATTENTION</span>
          <h2>Operator decisions to confirm</h2>
          <ul className="setup-readiness-list">
            {ownerItems.map(item => <li key={item}>{item}</li>)}
          </ul>
        </section>
        <section className="panel">
          <span className="eyebrow">KEEP BUILDING</span>
          <h2>Work that can continue</h2>
          <ul className="setup-readiness-list">
            {nextWork.map(item => <li key={item}>{item}</li>)}
          </ul>
        </section>
      </div>

      <section className="panel dispatch-create">
        <span className="eyebrow">DEMO PATH</span>
        <h2>Use this order for the first client demo</h2>
        <ol className="setup-readiness-list">
          <li>Open Setup and show business details, services, hours and office-review booking rules.</li>
          <li>Open Leads and explain that AI receptionist calls create office-review leads.</li>
          <li>Open Jobs and Calendar to show how staff turns a reviewed request into scheduled work.</li>
          <li>Show the recorded route and test-call status. Describe phone answering as verified only when this page says it is verified for this workspace.</li>
        </ol>
        <div className="button-row">
          <Link className="button secondary" href={`${base}/leads`}>Open leads ↗</Link>
          <Link className="button secondary" href={`${base}/jobs`}>Open jobs ↗</Link>
          <Link className="button secondary" href={`${base}/calendar`}>Open calendar ↗</Link>
          <Link className="button secondary" href={`${base}/pilot`}>Open pilot runbook ↗</Link><Link className="button secondary" href={`${base}/integrations`}>Open integrations ↗</Link><Link className="button secondary" href={`${base}/go-live`}>Open Go Live ↗</Link><Link className="button secondary" href={`${base}/settings`}>Open settings ↗</Link>
        </div>
      </section>
    </>
  );
}
