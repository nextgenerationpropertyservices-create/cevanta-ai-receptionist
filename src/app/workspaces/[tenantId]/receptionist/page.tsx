import { getWorkspace } from '@/lib/server/queries';

const scenarios = [
  { name: 'New service request', purpose: 'Captures name, service need, location, urgency, and preferred window.', status: 'Ready to test' },
  { name: 'Emergency no-heat call', purpose: 'Uses the urgent path without promising dispatch or an appointment.', status: 'Ready to test' },
  { name: 'Price request', purpose: 'Explains that the office reviews scope before quoting work.', status: 'Ready to test' },
  { name: 'Incomplete contact details', purpose: 'Asks only for missing information and avoids guessing caller identity.', status: 'Ready to test' },
  { name: 'Human handoff request', purpose: 'Records the request for office review with a clear next action.', status: 'Ready to test' },
];

export default async function ReceptionistWorkspace({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const { tenant } = await getWorkspace(tenantId);
  return <>
    <div className="page-heading"><span className="eyebrow">RECEPTIONIST QUALITY CENTER</span><h1>Test the experience before it reaches a customer.</h1><p>Review fictional call scenarios, verify guardrails, and keep the office in control of every change.</p></div>
    <section className="panel receptionist-status-card"><div><span className="eyebrow">CURRENT CONFIGURATION</span><h2>{tenant.name} receptionist</h2><p>Draft v1 · Published v0 · Last review not recorded</p></div><span className="pill">SAFE MODE</span></section>
    <section className="panel receptionist-boundary"><span className="eyebrow">SAFE REVIEW FLOW</span><h2>Test → inspect → approve → publish → rollback</h2><p>These scenarios use fictional data only. They do not place calls, create appointments, send SMS or email, write calendars, collect payments, or dispatch technicians.</p><div className="receptionist-steps"><span><b>1</b> Test</span><span><b>2</b> Inspect transcript</span><span><b>3</b> Approve changes</span><span><b>4</b> Publish when ready</span><span><b>5</b> Roll back if needed</span></div></section>
    <section className="panel"><div className="section-heading"><div><span className="eyebrow">SCENARIO LIBRARY</span><h2>Coverage your office can review</h2><p>Run each scenario against the draft before requesting a live release.</p></div><span className="pill">{scenarios.length} fictional scenarios</span></div><div className="receptionist-scenarios">{scenarios.map(scenario=><article key={scenario.name}><div><strong>{scenario.name}</strong><span>{scenario.status}</span></div><p>{scenario.purpose}</p><button className="button secondary" type="button" disabled>Run fictional test</button></article>)}</div></section>
    <section className="panel receptionist-guardrails"><span className="eyebrow">GUARDRAILS</span><h2>Always visible to reviewers</h2><ul className="setup-readiness-list"><li>Preferences are not confirmed appointments.</li><li>The receptionist does not diagnose equipment or promise pricing.</li><li>Urgent real-world danger exits the role-play and directs the caller to local emergency services.</li><li>Provider actions stay off until owner approval, test evidence, and rollback notes exist.</li></ul></section>
  </>;
}
