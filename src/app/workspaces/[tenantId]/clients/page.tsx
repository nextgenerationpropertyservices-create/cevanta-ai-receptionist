import { randomUUID } from "node:crypto";
import Link from "next/link";
import { ActionForm, Field } from "@/components/action-form";
import { Empty } from "@/components/ui";
import { provisionManagedClientWorkspace } from "@/app/actions/managed-clients";
import { getManagedClientWorkspaces } from "@/lib/server/queries";

export default async function ClientWorkspaces({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const { operator, role, clients, allowed } = await getManagedClientWorkspaces(tenantId);
  return <>
    <div className="page-heading"><span className="eyebrow">CEVANTA OPERATIONS</span><h1>Client workspaces.</h1><p>Create and monitor separate HVAC client workspaces from {operator.name}.</p></div>
    {!allowed ? <section className="panel"><h2>Internal access required</h2><p className="notice">Your {role} access can use this workspace, but only Cevanta internal owner/admin access can create managed client workspaces.</p><Link className="button secondary" href={`/workspaces/${tenantId}`}>Return to dashboard ↗</Link></section> : <div className="split-layout">
      <section className="panel"><div className="section-heading"><div><span className="eyebrow">CLIENTS</span><h2>Managed workspaces</h2></div><span className="pill">{clients.length} total</span></div>{clients.length ? <div className="table-scroll"><table><thead><tr><th>Client</th><th>Status</th><th>Trade</th><th>Workspace</th></tr></thead><tbody>{clients.map(client => <tr key={client.id}><td><strong>{client.name}</strong><p className="small muted">{client.timezone}</p></td><td>{client.status}</td><td>{client.trade}</td><td><Link className="card-link" href={`/workspaces/${client.id}/onboarding`}>Open setup ↗</Link></td></tr>)}</tbody></table></div> : <Empty title="No client workspaces yet">Create the first HVAC client workspace when a prospect says yes to the managed pilot.</Empty>}</section>
      <section className="panel"><span className="eyebrow">NEW CLIENT</span><h2>Create a client workspace</h2><p>This creates a separate workspace and gives your Cevanta account owner access so you can review onboarding, leads, jobs and support. It does not invite the client, connect Retell, enable Make, send messages or start billing.</p><ActionForm action={provisionManagedClientWorkspace} submitLabel="Create client workspace" hidden={{ request_id: randomUUID(), operator_tenant_id: tenantId }}><Field label="Client business name" name="name" required maxLength={160} autoComplete="organization"/><Field label="Trade" name="trade" required maxLength={80} defaultValue="HVAC"/><Field label="Timezone" name="timezone" required maxLength={80} defaultValue="America/New_York"/></ActionForm><p className="small muted">After creation, complete Setup with the client and save the completed intake in the client folder.</p></section>
    </div>}
  </>;
}
