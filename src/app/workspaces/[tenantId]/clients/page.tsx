import { randomUUID } from "node:crypto";
import Link from "next/link";
import { ActionForm, Field } from "@/components/action-form";
import { Empty } from "@/components/ui";
import { provisionManagedClientWorkspace } from "@/app/actions/managed-clients";
import { getManagedClientWorkspaces, type ManagedClientWorkspace } from "@/lib/server/queries";
import { getOnboardingSnapshot } from "@/lib/server/onboarding-rpc";
import type { OwnerOnboardingSnapshot } from "@/lib/onboarding-contracts";

type ClientOps = ManagedClientWorkspace & { setupStatus: string; paperworkStatus: string; nextAction: string; setupHref: string; workspaceHref: string };

function ownerSnapshot(value: unknown): value is OwnerOnboardingSnapshot {
  return !!value && typeof value === "object" && "projection" in value && value.projection === "owner_setup";
}

async function clientOps(client: ManagedClientWorkspace): Promise<ClientOps> {
  const setup = await getOnboardingSnapshot(client.id);
  if (setup.status !== "available" || !ownerSnapshot(setup.snapshot)) {
    return { ...client, setupStatus: "Needs review", paperworkStatus: "Not verified", nextAction: "Open setup and confirm access, intake paperwork, and launch rules.", setupHref: `/workspaces/${client.id}/onboarding`, workspaceHref: `/workspaces/${client.id}` };
  }
  const snapshot = setup.snapshot;
  const completed = [snapshot.profile, snapshot.services.length > 0, snapshot.weekly_hours.length > 0, snapshot.booking?.acknowledged, snapshot.escalation.length > 0].filter(Boolean).length;
  const paperworkReady = !!snapshot.profile && snapshot.services.length > 0 && snapshot.booking?.acknowledged;
  return {
    ...client,
    setupStatus: `${completed}/5 sections saved`,
    paperworkStatus: paperworkReady ? "Core intake saved" : "Missing intake pieces",
    nextAction: paperworkReady ? "Review launch gates before live automation." : "Finish business profile, services, hours, booking rules, and escalation contacts.",
    setupHref: `/workspaces/${client.id}/onboarding`,
    workspaceHref: `/workspaces/${client.id}`,
  };
}

export default async function ClientWorkspaces({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const { operator, role, clients, allowed } = await getManagedClientWorkspaces(tenantId);
  const opsClients = allowed ? await Promise.all(clients.map(clientOps)) : [];
  const activeClients = opsClients.filter(client => client.status === "pilot" || client.status === "active").length;
  const needsSetup = opsClients.filter(client => client.paperworkStatus !== "Core intake saved").length;
  return <>
    <div className="page-heading"><span className="eyebrow">CEVANTA BACK OFFICE</span><h1>Internal operations dashboard.</h1><p>Monitor client workspaces, paperwork, onboarding progress, and launch readiness from {operator.name}.</p></div>
    {!allowed ? <section className="panel"><h2>Internal access required</h2><p className="notice">Your {role} access can use this workspace, but only Cevanta internal owner/admin access can create and monitor managed client workspaces.</p><Link className="button secondary" href={`/workspaces/${tenantId}`}>Return to dashboard ↗</Link></section> : <>
      <div className="stat-grid"><div className="panel stat"><span>Managed clients</span><strong className="role-value">{opsClients.length}</strong><p>Total client workspaces connected to this Cevanta operator dashboard.</p></div><div className="panel stat"><span>Active or pilot</span><strong className="role-value">{activeClients}</strong><p>Clients marked pilot or active in the internal tracker.</p></div><div className="panel stat"><span>Need paperwork review</span><strong className="role-value">{needsSetup}</strong><p>Clients missing core setup or unavailable for verification.</p></div></div>
      <div className="split-layout">
        <section className="panel"><div className="section-heading"><div><span className="eyebrow">CLIENT OPERATIONS</span><h2>Paperwork and onboarding monitor</h2></div><span className="pill">{opsClients.length} total</span></div>{opsClients.length ? <div className="table-scroll"><table><thead><tr><th>Client</th><th>Status</th><th>Paperwork</th><th>Onboarding</th><th>Next action</th><th>Open</th></tr></thead><tbody>{opsClients.map(client => <tr key={client.id}><td><strong>{client.name}</strong><p className="small muted">{client.trade} · {client.timezone}</p></td><td>{client.status}</td><td>{client.paperworkStatus}</td><td>{client.setupStatus}</td><td>{client.nextAction}</td><td><div className="button-row"><Link className="card-link" href={client.workspaceHref}>Workspace ↗</Link><Link className="card-link" href={client.setupHref}>Setup ↗</Link></div></td></tr>)}</tbody></table></div> : <Empty title="No client workspaces yet">Create the first trade-service client workspace when a prospect says yes to the managed pilot.</Empty>}</section>
        <section className="panel"><span className="eyebrow">NEW CLIENT</span><h2>Create a client workspace</h2><p>This creates a separate workspace and gives your Cevanta account owner access so you can review onboarding, leads, jobs and support. It does not invite the client, connect Retell, enable Make, send messages, write calendars, dispatch technicians or start billing.</p><ActionForm action={provisionManagedClientWorkspace} submitLabel="Create client workspace" hidden={{ request_id: randomUUID(), operator_tenant_id: tenantId }}><Field label="Client business name" name="name" required maxLength={160} autoComplete="organization"/><Field label="Trade" name="trade" required maxLength={80} defaultValue="HVAC"/><Field label="Timezone" name="timezone" required maxLength={80} defaultValue="America/New_York"/></ActionForm><p className="small muted">After creation, complete Setup with the client and save the completed intake in the client folder.</p></section>
      </div>
    </>}
  </>;
}
