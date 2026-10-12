import { randomUUID } from "node:crypto";
import Link from "next/link";
import { ActionForm, Field } from "@/components/action-form";
import { Empty } from "@/components/ui";
import { provisionManagedClientWorkspace } from "@/app/actions/managed-clients";
import { getManagedClientWorkspaces, type ManagedClientWorkspace } from "@/lib/server/queries";
import { getOnboardingSnapshot } from "@/lib/server/onboarding-rpc";
import type { OwnerOnboardingSnapshot } from "@/lib/onboarding-contracts";

type SetupGate = { label: string; ready: boolean; openHref: string };
type ClientOps = ManagedClientWorkspace & {
  readinessScore: number;
  setupStatus: string;
  paperworkStatus: string;
  paymentStatus: string;
  launchStatus: string;
  integrationStatus: string;
  supportStatus: string;
  nextAction: string;
  setupHref: string;
  workspaceHref: string;
  launchHref: string;
  integrationsHref: string;
  leadsHref: string;
  jobsHref: string;
  calendarHref: string;
  gates: SetupGate[];
};

function ownerSnapshot(value: unknown): value is OwnerOnboardingSnapshot {
  return !!value && typeof value === "object" && "projection" in value && value.projection === "owner_setup";
}

function clientLinks(clientId: string) {
  const workspaceHref = `/workspaces/${clientId}`;
  return {
    workspaceHref,
    setupHref: `${workspaceHref}/onboarding`,
    launchHref: `${workspaceHref}/launch`,
    integrationsHref: `${workspaceHref}/integrations`,
    leadsHref: `${workspaceHref}/leads`,
    jobsHref: `${workspaceHref}/jobs`,
    calendarHref: `${workspaceHref}/calendar`,
  };
}

function gateSummary(gates: SetupGate[]) {
  const completed = gates.filter(gate => gate.ready).length;
  const score = Math.round((completed / gates.length) * 100);
  return { completed, score };
}

async function clientOps(client: ManagedClientWorkspace): Promise<ClientOps> {
  const links = clientLinks(client.id);
  const setup = await getOnboardingSnapshot(client.id);
  if (setup.status !== "available" || !ownerSnapshot(setup.snapshot)) {
    const gates = [
      { label: "Business profile", ready: false, openHref: links.setupHref },
      { label: "Services", ready: false, openHref: links.setupHref },
      { label: "Hours", ready: false, openHref: links.setupHref },
      { label: "Call rules", ready: false, openHref: links.setupHref },
      { label: "Escalation contacts", ready: false, openHref: links.setupHref },
    ];
    return {
      ...client,
      ...links,
      gates,
      readinessScore: 0,
      setupStatus: "Setup unavailable",
      paperworkStatus: "Needs intake review",
      paymentStatus: "Manual payment not recorded in Cevanta",
      launchStatus: "Blocked by setup access",
      integrationStatus: "Provider writes off",
      supportStatus: "Confirm account access and setup availability",
      nextAction: "Open the client workspace and confirm setup access before live calls.",
    };
  }

  const snapshot = setup.snapshot;
  const gates = [
    { label: "Business profile", ready: !!snapshot.profile, openHref: links.setupHref },
    { label: "Services", ready: snapshot.services.length > 0, openHref: links.setupHref },
    { label: "Hours", ready: snapshot.weekly_hours.length > 0, openHref: links.setupHref },
    { label: "Call rules", ready: !!snapshot.booking?.acknowledged, openHref: links.setupHref },
    { label: "Escalation contacts", ready: snapshot.escalation.length > 0, openHref: links.setupHref },
  ];
  const { completed, score } = gateSummary(gates);
  const missing = gates.filter(gate => !gate.ready).map(gate => gate.label.toLowerCase());
  const setupComplete = completed === gates.length;
  const intakeMostlyReady = completed >= 3;

  return {
    ...client,
    ...links,
    gates,
    readinessScore: score,
    setupStatus: `${completed}/${gates.length} setup gates complete`,
    paperworkStatus: setupComplete ? "Client intake ready for review" : intakeMostlyReady ? "Partial paperwork saved" : "Missing core intake",
    paymentStatus: "Manual invoice/payment check required",
    launchStatus: setupComplete ? "Ready for test-call checklist" : "Not ready for live pilot",
    integrationStatus: setupComplete ? "Ready for controlled Retell/Make test" : "Keep provider writes off",
    supportStatus: setupComplete ? "Review test call and go-live notes" : `Collect ${missing.slice(0, 2).join(" and ") || "remaining setup"}`,
    nextAction: setupComplete ? "Run the launch checklist, then place one fictional test call before live client calls." : `Finish ${missing.slice(0, 3).join(", ")}.`,
  };
}

function statusTone(value: string) {
  if (/not ready|blocked|missing|off|unavailable/i.test(value)) return "Needs work";
  if (/partial|manual|review/i.test(value)) return "Review";
  if (/ready|complete|saved|controlled/i.test(value)) return "Ready";
  return "Needs work";
}

export default async function ClientWorkspaces({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const { operator, role, clients, allowed } = await getManagedClientWorkspaces(tenantId);
  const opsClients = allowed ? await Promise.all(clients.map(clientOps)) : [];
  const activeClients = opsClients.filter(client => client.status === "pilot" || client.status === "active").length;
  const readyForTest = opsClients.filter(client => client.readinessScore === 100).length;
  const needsSetup = opsClients.filter(client => client.readinessScore < 100).length;
  const priorityClients = [...opsClients].sort((a, b) => a.readinessScore - b.readinessScore || a.name.localeCompare(b.name)).slice(0, 4);

  return <>
    <div className="page-heading"><span className="eyebrow">CEVANTA BACK OFFICE</span><h1>Internal owner operations dashboard.</h1><p>Monitor every client workspace, onboarding file, paperwork state, launch gate, payment check, integration status, and support next action from {operator.name}.</p></div>
    {!allowed ? <section className="panel"><h2>Internal access required</h2><p className="notice">Your {role} access can use this workspace, but only Cevanta internal owner/admin access can create and monitor managed client workspaces.</p><Link className="button secondary" href={`/workspaces/${tenantId}`}>Return to dashboard ↗</Link></section> : <>
      <div className="stat-grid"><div className="panel stat"><span>Managed clients</span><strong className="role-value">{opsClients.length}</strong><p>Total client workspaces connected to this Cevanta operator dashboard.</p></div><div className="panel stat"><span>Ready for test call</span><strong className="role-value">{readyForTest}</strong><p>Clients with core intake, services, hours, call rules and escalation contacts saved.</p></div><div className="panel stat"><span>Need setup work</span><strong className="role-value">{needsSetup}</strong><p>Clients missing paperwork or onboarding gates before live pilot calls.</p></div></div>

      <section className="panel"><div className="section-heading"><div><span className="eyebrow">OWNER PRIORITY QUEUE</span><h2>What needs your attention first</h2></div><span className="pill">{activeClients} active or pilot</span></div>{priorityClients.length ? <div className="table-scroll"><table><thead><tr><th>Client</th><th>Readiness</th><th>Next action</th><th>Open</th></tr></thead><tbody>{priorityClients.map(client => <tr key={client.id}><td><strong>{client.name}</strong><p className="small muted">{client.trade} · {client.status}</p></td><td><strong>{client.readinessScore}%</strong><p className="small muted">{client.setupStatus}</p></td><td>{client.nextAction}</td><td><div className="button-row"><Link className="card-link" href={client.setupHref}>Setup ↗</Link><Link className="card-link" href={client.launchHref}>Launch ↗</Link></div></td></tr>)}</tbody></table></div> : <Empty title="No client workspaces yet">Create the first trade-service client workspace when a prospect says yes to the managed pilot.</Empty>}</section>

      <div className="split-layout">
        <section className="panel"><div className="section-heading"><div><span className="eyebrow">CLIENT OPERATIONS</span><h2>Paperwork, launch, payment, and support monitor</h2></div><span className="pill">{opsClients.length} total</span></div>{opsClients.length ? <div className="table-scroll"><table><thead><tr><th>Client</th><th>Setup</th><th>Paperwork</th><th>Launch</th><th>Payment</th><th>Integrations</th><th>Support</th><th>Open</th></tr></thead><tbody>{opsClients.map(client => <tr key={client.id}><td><strong>{client.name}</strong><p className="small muted">{client.trade} · {client.timezone}</p><p className="small muted">Status: {client.status}</p></td><td><strong>{client.readinessScore}%</strong><p className="small muted">{client.setupStatus}</p></td><td><span className="pill">{statusTone(client.paperworkStatus)}</span><p className="small muted">{client.paperworkStatus}</p></td><td><span className="pill">{statusTone(client.launchStatus)}</span><p className="small muted">{client.launchStatus}</p></td><td><span className="pill">Review</span><p className="small muted">{client.paymentStatus}</p></td><td><span className="pill">Gated</span><p className="small muted">{client.integrationStatus}</p></td><td>{client.supportStatus}</td><td><div className="button-row"><Link className="card-link" href={client.workspaceHref}>Workspace ↗</Link><Link className="card-link" href={client.setupHref}>Setup ↗</Link><Link className="card-link" href={client.leadsHref}>Leads ↗</Link><Link className="card-link" href={client.jobsHref}>Jobs ↗</Link><Link className="card-link" href={client.calendarHref}>Calendar ↗</Link><Link className="card-link" href={client.integrationsHref}>Integrations ↗</Link></div></td></tr>)}</tbody></table></div> : <Empty title="No client workspaces yet">Create the first trade-service client workspace when a prospect says yes to the managed pilot.</Empty>}</section>
        <section className="panel"><span className="eyebrow">NEW CLIENT</span><h2>Create a client workspace</h2><p>This creates a separate workspace and gives your Cevanta account owner access so you can review onboarding, leads, jobs and support. It does not invite the client, connect Retell, enable Make, send messages, write calendars, dispatch technicians, book appointments, quote work, collect payments or start billing.</p><ActionForm action={provisionManagedClientWorkspace} submitLabel="Create client workspace" hidden={{ request_id: randomUUID(), operator_tenant_id: tenantId }}><Field label="Client business name" name="name" required maxLength={160} autoComplete="organization"/><Field label="Trade" name="trade" required maxLength={80} defaultValue="HVAC"/><Field label="Timezone" name="timezone" required maxLength={80} defaultValue="America/New_York"/></ActionForm><p className="small muted">After creation, complete Setup with the client and use this dashboard to track payment, test call, launch, and support readiness.</p></section>
      </div>

      <section className="panel"><div className="section-heading"><div><span className="eyebrow">LAUNCH CONTROL</span><h2>Use the same checklist for every client</h2></div><Link className="button secondary" href={`/workspaces/${tenantId}/integrations`}>Review global gates ↗</Link></div><div className="dispatch-summary"><article><span>1. Intake</span><strong>Setup</strong><p className="small muted">Business details, services, hours, rules and escalation contacts must be saved.</p></article><article><span>2. Payment</span><strong>Manual</strong><p className="small muted">Confirm setup fee and monthly pilot payment outside Cevanta until billing is built.</p></article><article><span>3. Test</span><strong>Call proof</strong><p className="small muted">Run one fictional Retell/Make/Cevanta test and verify one office-review lead.</p></article><article><span>4. Go live</span><strong>Approval</strong><p className="small muted">Keep booking, SMS/email, calendar writes and dispatch automation off unless separately approved.</p></article></div></section>
    </>}
  </>;
}

