import { randomUUID } from 'node:crypto';
import Link from 'next/link';
import { getCustomers,getWorkspace } from '@/lib/server/queries';
import { getLeads } from '@/lib/server/intake-queries';
import { canManageCustomers } from '@/lib/contracts';
import { createLead } from '@/app/actions/intake';
import { ActionForm } from '@/components/action-form';
import { Empty } from '@/components/ui';
import { IntakeFields,IntakeSetupNotice } from './intake-fields';
import { isAiReceptionistLead,isNewAiReceptionistLead } from '@/lib/ai-lead-notifications';

export default async function Leads({params}: {params:Promise<{tenantId:string}>}) {
  const {tenantId}=await params;
  const [{role},inbox]=await Promise.all([getWorkspace(tenantId),getLeads(tenantId)]);
  if (!inbox.ready) return <><div className="page-heading"><span className="eyebrow">SERVICE INTAKE</span><h1>Leads & service requests</h1></div><IntakeSetupNotice/></>;
  const writable=canManageCustomers(role);
  const customers=writable ? await getCustomers(tenantId) : [];
  const aiLeads = inbox.leads.filter(isNewAiReceptionistLead);
  const urgentAiLeads = aiLeads.filter(lead => lead.priority === 'urgent' || lead.priority === 'high');
  return <>
    <div className="page-heading"><span className="eyebrow">SERVICE INTAKE</span><h1>Leads & service requests</h1><p>Track enquiries and the next conversation with your team.</p></div>
    {aiLeads.length > 0 && <section className="notice" role="status" aria-live="polite" aria-labelledby="ai-lead-alert-title"><h2 id="ai-lead-alert-title">New AI receptionist lead{aiLeads.length === 1 ? '' : 's'} waiting</h2><p>{aiLeads.length} new AI receptionist lead{aiLeads.length === 1 ? ' needs' : 's need'} office review{urgentAiLeads.length ? `, including ${urgentAiLeads.length} high-priority request${urgentAiLeads.length === 1 ? '' : 's'}` : ''}. Open the lead, confirm details, then convert it to a job or follow up manually.</p><Link className="card-link" href={`/workspaces/${tenantId}/leads/${aiLeads[0].id}`}>Review newest AI lead ↗</Link></section>}
    {!writable && <p className="notice">Your {role} role has read-only access. An owner, admin, or dispatcher can manage enquiries.</p>}
    <div className="split-layout"><section className="panel"><h2>Lead inbox</h2>{inbox.leads.length ? <div className="table-scroll"><table><caption className="muted">{inbox.leads.length} enquiries in this workspace</caption><thead><tr><th scope="col">Enquiry</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">Priority</th><th scope="col">Follow-up</th><th scope="col">Record</th></tr></thead><tbody>{inbox.leads.map(lead => { const aiLead = isNewAiReceptionistLead(lead); return <tr key={lead.id}><td><strong>{lead.name}</strong>{aiLead && <span className="pill">NEW AI LEAD</span>}</td><td>{isAiReceptionistLead(lead) ? 'AI receptionist' : 'Manual'}</td><td>{lead.status}</td><td>{lead.priority}</td><td>{lead.follow_up_date ?? 'Not set'}</td><td><Link className="card-link" href={`/workspaces/${tenantId}/leads/${lead.id}`} aria-label={`Open enquiry for ${lead.name}`}>Open ↗</Link></td></tr>; })}</tbody></table></div> : <Empty title="No enquiries yet">Add a service request to track its status, priority and follow-up date.</Empty>}</section>{writable && <section className="panel"><h2>Add an enquiry</h2><ActionForm action={createLead} submitLabel="Create enquiry" hidden={{tenantId,submissionId:randomUUID()}}><IntakeFields customers={customers}/></ActionForm></section>}</div>
  </>;
}
