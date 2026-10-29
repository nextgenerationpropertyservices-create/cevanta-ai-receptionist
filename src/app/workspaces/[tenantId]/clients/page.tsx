import { randomUUID } from "node:crypto";
import Link from "next/link";
import { ActionForm, Field } from "@/components/action-form";
import { Empty } from "@/components/ui";
import { archiveManagedClientWorkspace, provisionManagedClientWorkspace } from "@/app/actions/managed-clients";
import { getManagedClientWorkspaces, type ManagedClientWorkspace } from "@/lib/server/queries";
import { getOnboardingSnapshot } from "@/lib/server/onboarding-rpc";
import { InvitationLinkForm } from "@/components/invitation-link";
import type { OwnerOnboardingSnapshot } from "@/lib/onboarding-contracts";
import { saveOnboardingMilestones } from "@/app/actions/onboarding-milestones";
import { getOnboardingMilestones } from "@/lib/server/onboarding-milestones";
import { milestoneLabel, type OnboardingMilestones } from "@/lib/onboarding-milestones";
import { StripePaymentRequestForm } from "./stripe-payment-request-form";

type SetupGate = { label: string; ready: boolean; openHref: string };
type IntakeDetail = { label: string; value: string; ready: boolean };
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
  intakeDetails: IntakeDetail[];
  milestones: OnboardingMilestones;
};
type ClientStage = "all" | "setup" | "testing" | "live" | "paused";

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

function describeHours(hours: OwnerOnboardingSnapshot["weekly_hours"]) {
  const openDays = hours.filter(day => !day.closed && day.intervals.length).length;
  if (!hours.length) return "Weekly hours not saved";
  return openDays ? `${openDays} open day${openDays===1?"":"s"} saved` : "All saved days are closed";
}

function describeServices(snapshot: OwnerOnboardingSnapshot) {
  const enabled = snapshot.services.filter(service => service.enabled);
  if (!enabled.length) return "Services not saved";
  return enabled.slice(0, 3).map(service => service.name || "Unnamed service").join(", ") + (enabled.length > 3 ? ` +${enabled.length - 3} more` : "");
}

function describeEscalation(snapshot: OwnerOnboardingSnapshot) {
  const enabled = snapshot.escalation.filter(contact => contact.enabled);
  if (!enabled.length) return "Escalation contacts not saved";
  return enabled.slice(0, 2).map(contact => `${contact.label || "Contact"}: ${contact.contact_name || "name missing"}`).join("; ") + (enabled.length > 2 ? ` +${enabled.length - 2} more` : "");
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
    const intakeDetails = [
      { label: "Business contact", value: "Setup unavailable", ready: false },
      { label: "Services", value: "Setup unavailable", ready: false },
      { label: "Hours", value: "Setup unavailable", ready: false },
      { label: "Call rules", value: "Setup unavailable", ready: false },
      { label: "Escalation", value: "Setup unavailable", ready: false },
      { label: "Service area", value: "Needs owner note", ready: false },
      { label: "Never promise rules", value: "Needs owner note", ready: false },
    ];
    return {
      ...client,
      ...links,
      gates,
      intakeDetails,
      readinessScore: 0,
      setupStatus: "Setup unavailable",
      paperworkStatus: "Needs intake review",
      paymentStatus: "Manual payment not recorded in Cevanta",
      launchStatus: "Blocked by setup access",
      integrationStatus: "Provider writes off",
      supportStatus: "Confirm account access and setup availability",
      nextAction: "Open the client workspace and confirm setup access before live calls.",
      milestones: { payment_status: "not_started", setup_status: "not_started", test_call_status: "not_started", retell_status: "not_connected", make_status: "not_connected", launch_approval_status: "not_requested", updated_at: null },
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
  const notes = snapshot.booking?.notes?.trim() ?? "";
  const intakeDetails = [
    { label: "Business contact", value: snapshot.profile ? `${snapshot.profile.business_contact_name || "Contact name missing"} · ${snapshot.profile.business_email || snapshot.profile.business_phone || "email/phone missing"}` : "Business contact not saved", ready: !!snapshot.profile },
    { label: "Services", value: describeServices(snapshot), ready: snapshot.services.some(service => service.enabled && service.name.trim()) },
    { label: "Hours", value: describeHours(snapshot.weekly_hours), ready: snapshot.weekly_hours.length > 0 },
    { label: "Call rules", value: snapshot.booking?.acknowledged ? (notes || "Request-only office review acknowledged") : "Call rules not acknowledged", ready: !!snapshot.booking?.acknowledged },
    { label: "Escalation", value: describeEscalation(snapshot), ready: snapshot.escalation.some(contact => contact.enabled && contact.contact_name.trim() && (contact.email || contact.phone)) },
    { label: "Service area", value: notes.toLowerCase().includes("service area") ? notes : "Add service area to request/call rules notes", ready: notes.toLowerCase().includes("service area") },
    { label: "Never promise rules", value: notes.toLowerCase().includes("never") ? notes : "Add never-promise rules to request/call rules notes", ready: notes.toLowerCase().includes("never") },
  ];

  return {
    ...client,
    ...links,
    gates,
    intakeDetails,
    readinessScore: score,
    setupStatus: `${completed}/${gates.length} setup gates complete`,
    paperworkStatus: setupComplete ? "Client intake ready for review" : intakeMostlyReady ? "Partial paperwork saved" : "Missing core intake",
    paymentStatus: "Manual invoice/payment check required",
    launchStatus: setupComplete ? "Ready for test-call checklist" : "Not ready for live pilot",
    integrationStatus: setupComplete ? "Ready for controlled Retell/Make test" : "Keep provider writes off",
    supportStatus: setupComplete ? "Review test call and go-live notes" : `Collect ${missing.slice(0, 2).join(" and ") || "remaining setup"}`,
    nextAction: setupComplete ? "Run the launch checklist, then place one fictional test call before live client calls." : `Finish ${missing.slice(0, 3).join(", ")}.`,
    milestones: { payment_status: "not_started", setup_status: setupComplete ? "complete" : completed ? "in_progress" : "not_started", test_call_status: "not_started", retell_status: "not_connected", make_status: "not_connected", launch_approval_status: "not_requested", updated_at: null },
  };
}

function statusTone(value: string) {
  if (/not ready|blocked|missing|off|unavailable/i.test(value)) return "Needs work";
  if (/partial|manual|review/i.test(value)) return "Review";
  if (/ready|complete|saved|controlled/i.test(value)) return "Ready";
  return "Needs work";
}

function clientStage(client: ClientOps): Exclude<ClientStage, "all"> {
  if (client.status === "paused") return "paused";
  const milestones = client.milestones;
  const launchReady = milestones.payment_status === "paid" && milestones.test_call_status === "passed" && milestones.retell_status === "verified" && milestones.make_status === "verified" && milestones.launch_approval_status === "approved";
  if (client.status === "active" || launchReady) return "live";
  if (milestones.setup_status === "complete" && (milestones.test_call_status === "passed" || milestones.retell_status === "mapped" || milestones.make_status === "mapped")) return "testing";
  if (client.readinessScore === 100) return "testing";
  return "setup";
}

export default async function ClientWorkspaces({ params, searchParams }: { params: Promise<{ tenantId: string }>; searchParams?: Promise<{ stage?: string; q?: string }> }) {
  const { tenantId } = await params;
  const query = searchParams ? await searchParams : {};
  const { operator, role, clients, allowed } = await getManagedClientWorkspaces(tenantId);
  const opsClients = allowed ? await Promise.all(clients.map(clientOps)) : [];
  const persistedMilestones = allowed ? await getOnboardingMilestones(opsClients.map(client => client.id)) : new Map<string, OnboardingMilestones>();
  for (const client of opsClients) {
    const saved = persistedMilestones.get(client.id);
    if (saved) client.milestones = saved;
  }
  const requestedStage = query.stage;
  const stage: ClientStage = requestedStage === "setup" || requestedStage === "testing" || requestedStage === "live" || requestedStage === "paused" ? requestedStage : "all";
  const search = typeof query.q === "string" ? query.q.trim() : "";
  const searchNeedle = search.toLowerCase();
  const stageClients = stage === "all" ? opsClients : opsClients.filter(client => clientStage(client) === stage);
  const visibleClients = searchNeedle ? stageClients.filter(client => [client.name, client.trade, client.timezone].some(value => value.toLowerCase().includes(searchNeedle))) : stageClients;
  const stageCounts = { all: opsClients.length, setup: opsClients.filter(client => clientStage(client) === "setup").length, testing: opsClients.filter(client => clientStage(client) === "testing").length, live: opsClients.filter(client => clientStage(client) === "live").length, paused: opsClients.filter(client => clientStage(client) === "paused").length };
  const activeClients = opsClients.filter(client => client.status === "pilot" || client.status === "active").length;
  const readyForTest = opsClients.filter(client => client.readinessScore === 100).length;
  const needsSetup = opsClients.filter(client => client.readinessScore < 100).length;
  const priorityClients = [...visibleClients].sort((a, b) => a.readinessScore - b.readinessScore || a.name.localeCompare(b.name)).slice(0, 4);

  return <>
    <div className="page-heading"><span className="eyebrow">CEVANTA BACK OFFICE</span><h1>Internal owner operations dashboard.</h1><p>Monitor every client workspace, onboarding file, paperwork state, launch gate, payment check, integration status, and support next action from {operator.name}.</p></div>
    {!allowed ? <section className="panel"><h2>Internal access required</h2><p className="notice">Your {role} access can use this workspace, but only Cevanta internal owner/admin access can create and monitor managed client workspaces.</p><Link className="button secondary" href={`/workspaces/${tenantId}`}>Return to dashboard ↗</Link></section> : <>
      <div className="stat-grid"><div className="panel stat"><span>Managed clients</span><strong className="role-value">{opsClients.length}</strong><p>Total client workspaces connected to this Cevanta operator dashboard.</p></div><div className="panel stat"><span>Ready for test call</span><strong className="role-value">{readyForTest}</strong><p>Clients with core intake, services, hours, call rules and escalation contacts saved.</p></div><div className="panel stat"><span>Need setup work</span><strong className="role-value">{needsSetup}</strong><p>Clients missing paperwork or onboarding gates before live pilot calls.</p></div></div>

      <section className="panel"><div className="section-heading"><div><span className="eyebrow">OWNER PRIORITY QUEUE</span><h2>What needs your attention first</h2></div><span className="pill">{activeClients} active or pilot</span></div><form className="client-monitor-search" method="get"><label htmlFor="client-search">Find a client</label><div><input id="client-search" name="q" type="search" defaultValue={search} placeholder="Business name, trade, or timezone"/><input type="hidden" name="stage" value={stage}/><button className="button secondary" type="submit">Search</button>{search && <Link className="card-link" href={`/workspaces/${tenantId}/clients${stage === "all" ? "" : `?stage=${stage}`}`}>Clear</Link>}</div></form><nav className="client-stage-filter" aria-label="Filter clients by onboarding stage">{([['all','All'],['setup','Setup'],['testing','Testing'],['live','Live'],['paused','Paused']] as const).map(([value,label]) => { const params = new URLSearchParams(); if (value !== "all") params.set("stage", value); if (search) params.set("q", search); const suffix = params.toString(); return <Link key={value} className={stage === value ? "active" : ""} href={`/workspaces/${tenantId}/clients${suffix ? `?${suffix}` : ""}`} aria-current={stage === value ? "page" : undefined}>{label}<span>{stageCounts[value]}</span></Link>; })}</nav>{priorityClients.length ? <div className="table-scroll"><table><thead><tr><th>Client</th><th>Readiness</th><th>Next action</th><th>Open</th></tr></thead><tbody>{priorityClients.map(client => <tr key={client.id}><td><strong>{client.name}</strong><p className="small muted">{client.trade} · {client.status}</p></td><td><strong>{client.readinessScore}%</strong><p className="small muted">{client.setupStatus}</p></td><td>{client.nextAction}</td><td><div className="button-row"><Link className="card-link" href={client.setupHref}>Setup ↗</Link><Link className="card-link" href={client.launchHref}>Launch ↗</Link></div></td></tr>)}</tbody></table></div> : <Empty title={search ? `No clients match “${search}”` : `No ${stage === "all" ? "client" : stage} workspaces`}>Try another search or select a different stage.</Empty>}</section>

<section className="panel"><div className="section-heading"><div><span className="eyebrow">CLIENT INTAKE DETAILS</span><h2>What each client has filled out</h2></div><span className="pill">{visibleClients.length} shown · Internal review</span></div>{visibleClients.length ? <div className="client-intake-grid">{visibleClients.map(client => <details key={client.id} className="client-intake-card client-intake-details"><summary><span><strong>{client.name}</strong><small>{client.trade} · {client.status}</small></span><span className={client.readinessScore === 100 ? "intake-summary-ready" : "intake-summary-review"}>{client.readinessScore}% ready</span></summary><dl>{client.intakeDetails.map(detail => <div key={detail.label} className={detail.ready ? "intake-ready" : "intake-missing"}><dt>{detail.label}</dt><dd>{detail.value}</dd></div>)}</dl><div className="client-milestone-strip" aria-label={`${client.name} onboarding milestones`}>{Object.entries(client.milestones).filter(([key]) => key !== "updated_at").map(([key,value]) => <span key={key} className={`milestone-${value}`}><b>{milestoneLabel(key.replace("_status", "").replace("launch_approval", "launch"))}</b>{milestoneLabel(value ?? "")}</span>)}</div><ActionForm action={saveOnboardingMilestones} submitLabel="Save milestones" hidden={{ tenantId: client.id }}><div className="client-milestone-form"><label>Payment<select name="payment_status" defaultValue={client.milestones.payment_status}><option value="not_started">Not started</option><option value="pending">Pending</option><option value="paid">Paid</option><option value="failed">Failed</option></select></label><label>Setup<select name="setup_status" defaultValue={client.milestones.setup_status}><option value="not_started">Not started</option><option value="in_progress">In progress</option><option value="complete">Complete</option></select></label><label>Test call<select name="test_call_status" defaultValue={client.milestones.test_call_status}><option value="not_started">Not started</option><option value="passed">Passed</option><option value="failed">Failed</option></select></label><label>Retell<select name="retell_status" defaultValue={client.milestones.retell_status}><option value="not_connected">Not connected</option><option value="mapped">Mapped</option><option value="verified">Verified</option></select></label><label>Make<select name="make_status" defaultValue={client.milestones.make_status}><option value="not_connected">Not connected</option><option value="mapped">Mapped</option><option value="verified">Verified</option></select></label><label>Launch<select name="launch_approval_status" defaultValue={client.milestones.launch_approval_status}><option value="not_requested">Not requested</option><option value="approved">Approved</option><option value="revoked">Revoked</option></select></label></div></ActionForm><div className="button-row"><Link className="card-link" href={client.setupHref}>Open setup ↗</Link><Link className="card-link" href={client.workspaceHref}>Open workspace ↗</Link></div></details>)}</div> : <Empty title="No intake files yet">When a client fills out Setup, their saved answers will summarize here for your review.</Empty>}<p className="small muted">Milestones are owner-controlled records. Saving them does not connect providers, send messages, book appointments, collect payments, write calendars, or dispatch technicians.</p></section>

<section className="panel danger-zone"><div className="section-heading"><div><span className="eyebrow">CLIENT WORKSPACE CONTROL</span><h2>Remove a client workspace</h2></div><span className="pill">Owner/admin only</span></div><p className="notice">Removing a workspace archives it from your active client list, revokes your internal access, and keeps its records for audit. This cannot be undone from the dashboard.</p>{opsClients.length ? <div className="client-intake-grid">{opsClients.map(client => <details key={client.id} className="client-intake-card client-access-details"><summary><span><strong>{client.name}</strong><small>{client.trade} · {client.status}</small></span><span className="card-link">Remove workspace ▾</span></summary><ActionForm action={archiveManagedClientWorkspace} submitLabel="Archive workspace" hidden={{operatorTenantId: tenantId, clientTenantId: client.id}}><Field label={'Type DELETE WORKSPACE to confirm'} name="confirmation" required autoComplete="off"/><p className="small muted">Use this for a client that should no longer appear in active operations. Provider connections and external accounts are not changed.</p></ActionForm></details>)}</div> : <Empty title="No client workspaces to remove">Archived workspaces no longer appear in this active list.</Empty>}</section>

<section className="panel"><div className="section-heading"><div><span className="eyebrow">PRIVATE CLIENT ACCESS</span><h2>Invite a client owner</h2></div><span className="pill">One-time link</span></div><p>First have the client create and confirm their Cevanta account. Then issue a private seven-day link for the matching email. They will accept it and land in Setup; you keep internal review access.</p>{opsClients.length ? <div className="client-intake-grid">{opsClients.map(client => <details key={client.id} className="client-intake-card client-access-details"><summary><span><strong>{client.name}</strong><small>Owner access is added only after acceptance</small></span><span className="card-link">Open access ▾</span></summary><InvitationLinkForm operatorTenantId={tenantId} clientTenantId={client.id} /></details>)}</div> : <Empty title="Create a client workspace first">The invitation control appears here after you create a managed client workspace.</Empty>}<p className="small muted">Cevanta does not email this link yet. Copy it once and send it through your approved business channel. Never post it publicly.</p></section>

      <div className="split-layout">
        <section className="panel"><div className="section-heading"><div><span className="eyebrow">CLIENT OPERATIONS</span><h2>Paperwork, launch, payment, and support monitor</h2></div><span className="pill">{opsClients.length} total</span></div>{opsClients.length ? <div className="table-scroll"><table><thead><tr><th>Client</th><th>Setup</th><th>Paperwork</th><th>Launch</th><th>Payment</th><th>Integrations</th><th>Support</th><th>Open</th></tr></thead><tbody>{opsClients.map(client => <tr key={client.id}><td><strong>{client.name}</strong><p className="small muted">{client.trade} · {client.timezone}</p><p className="small muted">Status: {client.status}</p></td><td><strong>{client.readinessScore}%</strong><p className="small muted">{client.setupStatus}</p></td><td><span className="pill">{statusTone(client.paperworkStatus)}</span><p className="small muted">{client.paperworkStatus}</p></td><td><span className="pill">{statusTone(client.launchStatus)}</span><p className="small muted">{client.launchStatus}</p></td><td><span className="pill">Review</span><p className="small muted">{client.paymentStatus}</p></td><td><span className="pill">Gated</span><p className="small muted">{client.integrationStatus}</p></td><td>{client.supportStatus}</td><td><div className="button-row"><Link className="card-link" href={client.workspaceHref}>Workspace ↗</Link><Link className="card-link" href={client.setupHref}>Setup ↗</Link><Link className="card-link" href={client.leadsHref}>Leads ↗</Link><Link className="card-link" href={client.jobsHref}>Jobs ↗</Link><Link className="card-link" href={client.calendarHref}>Calendar ↗</Link><Link className="card-link" href={client.integrationsHref}>Integrations ↗</Link></div></td></tr>)}</tbody></table></div> : <Empty title="No client workspaces yet">Create the first trade-service client workspace when a prospect says yes to the managed pilot.</Empty>}</section>
        <section className="panel"><span className="eyebrow">NEW CLIENT</span><h2>Create a client workspace</h2><p>This creates a separate workspace and gives your Cevanta account owner access so you can review onboarding, leads, jobs and support. It does not connect Retell, enable Make, send messages, write calendars, dispatch technicians, book appointments, quote work, collect payments or start billing. After creation, use the private client access section to invite the confirmed account email.</p><ActionForm action={provisionManagedClientWorkspace} submitLabel="Create client workspace" hidden={{ request_id: randomUUID(), operator_tenant_id: tenantId }}><Field label="Client business name" name="name" required maxLength={160} autoComplete="organization"/><Field label="Trade" name="trade" required maxLength={80} defaultValue="HVAC"/><Field label="Timezone" name="timezone" required maxLength={80} defaultValue="America/New_York"/></ActionForm><p className="small muted">After creation, complete Setup with the client and use this dashboard to track payment, test call, launch, and support readiness.</p></section>
      </div>

      <section className="panel payment-request-panel"><div className="section-heading"><div><span className="eyebrow">MANUAL STRIPE REQUEST</span><h2>Create a hosted payment link</h2><p>Generate a one-time Stripe-hosted request for the setup fee or first monthly pilot payment. Cevanta never sees card details and does not charge automatically from this screen.</p></div><span className="pill">Owner controlled</span></div><StripePaymentRequestForm operatorTenantId={tenantId} initialRequestId={randomUUID()} clients={opsClients.map(client => ({ id: client.id, name: client.name, trade: client.trade }))} /><p className="small muted">Defaults are $497 setup and $297 for the first month. Adjust them for this request; the selected amount is validated on the server. Use Stripe test mode first.</p></section>

      <section className="panel"><div className="section-heading"><div><span className="eyebrow">LAUNCH CONTROL</span><h2>Use the same checklist for every client</h2></div><Link className="button secondary" href={`/workspaces/${tenantId}/integrations`}>Review global gates ↗</Link></div><div className="dispatch-summary"><article><span>1. Intake</span><strong>Setup</strong><p className="small muted">Business details, services, hours, rules and escalation contacts must be saved.</p></article><article><span>2. Payment</span><strong>Manual</strong><p className="small muted">Confirm setup fee and monthly pilot payment outside Cevanta until billing is built.</p></article><article><span>3. Test</span><strong>Call proof</strong><p className="small muted">Run one fictional Retell/Make/Cevanta test and verify one office-review lead.</p></article><article><span>4. Go live</span><strong>Approval</strong><p className="small muted">Keep booking, SMS/email, calendar writes and dispatch automation off unless separately approved.</p></article></div></section>
    </>}
  </>;
}

