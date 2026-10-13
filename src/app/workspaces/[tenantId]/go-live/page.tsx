import Link from 'next/link';
import { getGoLiveFeatureStatuses, summarizeGoLiveStatus } from '@/lib/client-feature-activation';
import { getAutomationControls } from '@/lib/server/automation-control-queries';
import { getWorkspace } from '@/lib/server/queries';

const categoryLabels = {
  communication: 'Customer communication',
  scheduling: 'Scheduling and booking',
  billing: 'Billing and payment',
  dispatch: 'Dispatch and field operations',
} as const;

const noLiveActions = [
  'No SMS or email is sent from this page.',
  'No external calendar event is written from this page.',
  'No appointment is confirmed from this page.',
  'No payment, card collection, or subscription is created from this page.',
  'No technician is dispatched from this page.',
];

export default async function GoLiveCenter({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const { tenant, role } = await getWorkspace(tenantId);
  const { controls, canManage, ready } = await getAutomationControls(tenantId);
  const statuses = getGoLiveFeatureStatuses(controls);
  const summary = summarizeGoLiveStatus(statuses);
  const base = `/workspaces/${tenant.id}`;

  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">GO LIVE</span>
        <h1>Prepare live booking, messages, billing, and dispatch without turning them on early.</h1>
        <p>
          Use this center to get {tenant.name} ready for advanced automation one feature at a time. Every customer-impacting action stays off until the client is configured, tested, approved, and has a rollback plan.
        </p>
      </div>

      <section className="notice" role="status" aria-labelledby="go-live-boundary">
        <h2 id="go-live-boundary">Off by default</h2>
        <p>
          Go Live is a readiness and approval center. It records what is ready; it does not send customer messages, write outside calendars, confirm bookings, collect payments, create subscriptions, or dispatch technicians.
        </p>
      </section>

      <div className="stat-grid">
        <div className="panel stat"><span>Active</span><strong className="role-value">{summary.active}</strong><p>Live features currently marked active.</p></div>
        <div className="panel stat"><span>Ready</span><strong className="role-value">{summary.ready}</strong><p>Features with readiness state ready for activation.</p></div>
        <div className="panel stat"><span>Testing</span><strong className="role-value">{summary.testing}</strong><p>Features still proving safe behavior.</p></div>
        <div className="panel stat"><span>Off / blocked</span><strong className="role-value">{summary.blocked}</strong><p>Features not yet requested for this client.</p></div>
      </div>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">CONTROL PANEL</span>
            <h2>Current activation status</h2>
            <p>These statuses come from the saved automation controls. Owners and admins manage the switches in Integrations.</p>
          </div>
          <div className="button-row">
            <Link className="button secondary" href={`${base}/integrations`}>Edit controls ↗</Link>
            <Link className="button secondary" href={`${base}/launch`}>Launch checklist ↗</Link>
          </div>
        </div>
        {!ready && <p className="notice">Saved automation controls need their database migration before changes can persist. This page still shows the intended launch tracks.</p>}
        {!canManage && <p className="notice">Your {role} access can view the Go Live plan. Approval notes, test evidence, rollback notes, and activation changes are restricted to owners and admins.</p>}
        <div className="table-scroll">
          <table>
            <thead><tr><th>Feature</th><th>Category</th><th>Status</th><th>Missing before live</th><th>First safe mode</th></tr></thead>
            <tbody>{statuses.map(status => <tr key={status.capability}><td><strong>{status.outcome}</strong><p className="small muted">{status.clientValue}</p></td><td>{categoryLabels[status.category]}</td><td>{status.readinessLabel}<p className="small muted">Control: {canManage ? status.automationStateLabel : 'restricted'}</p></td><td>{status.missing.length ? status.missing.join(', ') : 'All readiness notes recorded'}</td><td>{status.firstSafeMode}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <span className="eyebrow">FEATURE TRACKS</span>
        <h2>What must be true before each feature can go live</h2>
        <div className="manual-section-grid">
          {statuses.map(status => (
            <article className="manual-section-card" key={status.capability}>
              <div className="section-heading">
                <div>
                  <span className="eyebrow">{categoryLabels[status.category]}</span>
                  <h3>{status.outcome}</h3>
                  <p>{status.clientValue}</p>
                </div>
                <span className="pill">{status.readinessLabel}</span>
              </div>
              <p><strong>Provider path:</strong> {status.providerChoice}</p>
              <p><strong>Client approval:</strong> {status.approval}</p>
              <p><strong>Live boundary:</strong> {status.liveBoundary}</p>
              <div className="split-layout">
                <div>
                  <h4>Configure first</h4>
                  <ul className="setup-readiness-list">{status.configure.map(item => <li key={item}>{item}</li>)}</ul>
                </div>
                <div>
                  <h4>Test before live</h4>
                  <ul className="setup-readiness-list">{status.testPlan.map(item => <li key={item}>{item}</li>)}</ul>
                </div>
              </div>
              <h4>Rollback plan must cover</h4>
              <ul className="setup-readiness-list">{status.rollback.map(item => <li key={item}>{item}</li>)}</ul>
              <p className="small muted">Related dashboard areas: {status.dashboardLinks.join(', ')}.</p>
            </article>
          ))}
        </div>
      </section>

      <div className="split-layout">
        <section className="panel">
          <span className="eyebrow">SAFETY GUARANTEE</span>
          <h2>This page stays non-destructive</h2>
          <ul className="setup-readiness-list">{noLiveActions.map(item => <li key={item}>{item}</li>)}</ul>
        </section>
        <section className="panel">
          <span className="eyebrow">BUILD ORDER</span>
          <h2>Recommended live rollout sequence</h2>
          <ol className="setup-readiness-list">
            <li>Office alerts and internal email summaries.</li>
            <li>SMS and email customer follow-up after consent and template approval.</li>
            <li>External calendar writes after conflict and duplicate tests.</li>
            <li>Payment links or manual Stripe checkout before in-app subscriptions.</li>
            <li>Booking suggestions before automatic confirmed booking.</li>
            <li>Dispatch suggestions before automatic technician assignment.</li>
          </ol>
        </section>
      </div>

      <section className="panel dispatch-create">
        <span className="eyebrow">NEXT ACTIONS</span>
        <h2>Finish client readiness in the dashboard</h2>
        <div className="button-row">
          <Link className="button secondary" href={`${base}/onboarding`}>Complete setup ↗</Link>
          <Link className="button secondary" href={`${base}/technicians`}>Review technicians ↗</Link>
          <Link className="button secondary" href={`${base}/calendar`}>Check calendar ↗</Link>
          <Link className="button secondary" href={`${base}/billing`}>Review billing ↗</Link>
          <Link className="button secondary" href={`${base}/manual`}>Read manual ↗</Link>
        </div>
      </section>
    </>
  );
}
