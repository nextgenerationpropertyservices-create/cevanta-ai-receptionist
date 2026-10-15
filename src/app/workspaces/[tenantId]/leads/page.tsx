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
import { getLeadDisplayDetails } from '@/lib/lead-display';
import { LEAD_PRIORITIES,LEAD_STATUSES } from '@/lib/intake-contracts';

type LeadFilters = {status?:string|string[];priority?:string|string[];source?:string|string[]};

export default async function Leads({params,searchParams}: {params:Promise<{tenantId:string}>;searchParams?:Promise<LeadFilters>}) {
  const {tenantId}=await params;
  const [{role},inbox,filters]=await Promise.all([getWorkspace(tenantId),getLeads(tenantId),searchParams ?? Promise.resolve({} as LeadFilters)]);
  if (!inbox.ready) return <><div className="page-heading"><span className="eyebrow">SERVICE INTAKE</span><h1>Leads & service requests</h1></div><IntakeSetupNotice/></>;
  const writable=canManageCustomers(role);
  const customers=writable ? await getCustomers(tenantId) : [];
  const status=typeof filters.status==='string' && LEAD_STATUSES.includes(filters.status as typeof LEAD_STATUSES[number]) ? filters.status : '';
  const priority=typeof filters.priority==='string' && LEAD_PRIORITIES.includes(filters.priority as typeof LEAD_PRIORITIES[number]) ? filters.priority : '';
  const source=filters.source === 'ai' || filters.source === 'manual' ? filters.source : '';
  const filtered=inbox.leads.filter(lead => (!status || lead.status===status) && (!priority || lead.priority===priority) && (!source || (source==='ai' ? isAiReceptionistLead(lead) : !isAiReceptionistLead(lead))));
  return <>
    <div className="page-heading"><span className="eyebrow">SERVICE INTAKE</span><h1>Leads & service requests</h1><p>Track enquiries and the next conversation with your team.</p></div>
    {!writable && <p className="notice">Your {role} role has read-only access. An owner, admin, or dispatcher can manage enquiries.</p>}
    <form className="lead-filter" method="get" aria-label="Filter leads"><label className="field"><span>Status</span><select name="status" defaultValue={status}><option value="">All statuses</option>{LEAD_STATUSES.map(value=><option key={value} value={value}>{value.charAt(0).toUpperCase()+value.slice(1)}</option>)}</select></label><label className="field"><span>Priority</span><select name="priority" defaultValue={priority}><option value="">All priorities</option>{LEAD_PRIORITIES.map(value=><option key={value} value={value}>{value.charAt(0).toUpperCase()+value.slice(1)}</option>)}</select></label><label className="field"><span>Source</span><select name="source" defaultValue={source}><option value="">All sources</option><option value="ai">AI receptionist</option><option value="manual">Manual</option></select></label><button className="button" type="submit">Apply filters</button><Link className="button secondary" href={`/workspaces/${tenantId}/leads`}>Clear</Link></form>
    <div className="split-layout"><section className="panel"><div className="section-heading"><h2>Lead inbox</h2><p className="small">{filtered.length} of {inbox.leads.length} enquiries shown</p></div>{filtered.length ? <div className="table-scroll"><table><caption className="muted">Use filters to find urgent requests and leads waiting for review.</caption><thead><tr><th scope="col">Enquiry</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">Priority</th><th scope="col">Follow-up</th><th scope="col">Record</th></tr></thead><tbody>{filtered.map(lead => { const aiLead = isNewAiReceptionistLead(lead); const display = getLeadDisplayDetails(lead); return <tr key={lead.id}><td><div className="lead-row-title"><strong>{display.name}</strong>{aiLead && <span className="pill">NEW AI LEAD</span>}</div><span className="lead-row-summary">{display.serviceRequest}</span></td><td>{isAiReceptionistLead(lead) ? 'AI receptionist' : 'Manual'}</td><td>{lead.status}</td><td>{lead.priority}</td><td>{lead.follow_up_date ?? 'Not set'}</td><td><Link className="card-link" href={`/workspaces/${tenantId}/leads/${lead.id}`} aria-label={`Open enquiry for ${display.name}`}>Open ↗</Link></td></tr>; })}</tbody></table></div> : <Empty title={inbox.leads.length ? 'No enquiries match these filters' : 'No enquiries yet'}>{inbox.leads.length ? 'Clear or adjust the filters to see the rest of your work.' : 'Add a service request to track its status, priority and follow-up date.'}</Empty>}</section>{writable && <section className="panel"><h2>Add an enquiry</h2><ActionForm action={createLead} submitLabel="Create enquiry" hidden={{tenantId,submissionId:randomUUID()}}><IntakeFields customers={customers}/></ActionForm></section>}</div>
  </>;
}
