import Link from 'next/link';
import { SELF_SERVICE_ONBOARDING_STEPS, STANDARD_PROVIDER_BOUNDARIES, templateForTrade } from '@/lib/client-onboarding-blueprint';
import { buildProvisioningReadiness, provisioningStateLabel } from '@/lib/provisioning-readiness';
import { getAutomationControls } from '@/lib/server/automation-control-queries';
import { getOnboardingSnapshot } from '@/lib/server/onboarding-rpc';
import { getWorkspace } from '@/lib/server/queries';
import { getRetellAgentMappingHealth } from '@/app/actions/retell-provisioning';
import type { RetellRouteReadiness } from '@/lib/provisioning-readiness';
import { getOnboardingMilestones } from '@/lib/server/onboarding-milestones';
import { defaultOnboardingMilestones, milestoneLabel } from '@/lib/onboarding-milestones';

const readinessRows = [
  {
    area: 'Dashboard and customer records',
    status: 'Ready for managed pilot',
    detail: 'Workspace, customers, leads, jobs, calendar and setup screens are available after sign-in.',
  },
  {
    area: 'Retell phone answering',
    status: 'Live phone test passed',
    detail: 'A Retell inbound phone call reached the configured HVAC receptionist agent and ended successfully. Review is still needed before promising automatic booking.',
  },
  {
    area: 'Make intake receiver',
    status: 'Safe dry run passed',
    detail: 'The Make test scenario accepts fictional Retell-style call analysis, avoids duplicate review records and ignores non-analysis events. It is inactive until intentionally connected.',
  },
  {
    area: 'Lead notification inside Cevanta',
    status: 'Ready in app',
    detail: 'New AI receptionist leads show review notices in the workspace and Leads page. External SMS or email alerts are not enabled.',
  },
  {
    area: 'Booking and client follow-up',
    status: 'Office review required',
    detail: 'Cevanta can track requests and appointments, but live calls should be reviewed by office staff before confirming a booking.',
  },
  {
    area: 'Production launch',
    status: 'Not approved yet',
    detail: 'Production deployment, billing, always-on provider routing and public sales claims still need final owner approval and release checks.',
  },
];

const ownerItems = [
  'Keep Retell credits funded before demos or live calls.',
  'Decide when to connect Retell webhooks to Make or directly to Cevanta.',
  'Approve any always-on Make activation, future production release, SMS, email or calendar-writing workflow before it goes live.',
  'Complete Twilio business/SMS registration later if SMS follow-up becomes part of the paid package.',
];

const nextWork = [
  'Finish fresh-owner signup and first-workspace browser proof with a test inbox.',
  'Add a controlled provider-connection screen so each client sees what is connected and what is waiting.',
  'Prepare a first-client demo script that uses managed-pilot language and avoids production claims.',
  'Add production release evidence only after staging, environment and backup checks are complete.',
];

export default async function LaunchReadiness({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const { tenant, role } = await getWorkspace(tenantId);
  const base = `/workspaces/${tenant.id}`;
  const template = templateForTrade(tenant.trade);
  const [onboarding, automation, milestoneMap] = await Promise.all([getOnboardingSnapshot(tenant.id), getAutomationControls(tenant.id), getOnboardingMilestones([tenant.id])]);
  const ownerSnapshot = onboarding.status === 'available' && onboarding.snapshot.projection === 'owner_setup' ? onboarding.snapshot : null;
  const retellRoute: RetellRouteReadiness = role === 'owner' || role === 'admin' ? (await getRetellAgentMappingHealth(tenant.id)).status : 'not_configured';
  const provisioning = buildProvisioningReadiness(ownerSnapshot, automation.controls, retellRoute);
  const milestones = milestoneMap.get(tenant.id) ?? defaultOnboardingMilestones();

  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">LAUNCH READINESS</span>
        <h1>Sell the first version carefully.</h1>
        <p>
          This page separates what is proven from what still needs owner approval before Cevanta runs as a live AI receptionist for HVAC clients.
        </p>
      </div>

      <section className="notice" role="status" aria-labelledby="launch-current-position">
        <h2 id="launch-current-position">Current position</h2>
        <p>
          {tenant.name} is ready to show as a managed pilot with office review. Retell phone answering and Make safe intake have been tested, but automatic live booking,
          SMS, email, billing and future production releases are still gated.
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
          <strong className="role-value">Managed pilot</strong>
          <p>Sell with human review and clear limits until production gates pass.</p>
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
              {readinessRows.map(row => (
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
          <h2>Save these decisions for Heath</h2>
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
          <li>Explain that Retell can answer live calls now, while automatic booking and messages remain approval-gated.</li>
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
