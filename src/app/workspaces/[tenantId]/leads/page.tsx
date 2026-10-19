import { randomUUID } from 'node:crypto';
import Link from 'next/link';
import { getCustomers,getWorkspace } from '@/lib/server/queries';
import { getLeads } from '@/lib/server/intake-queries';
import { canManageCustomers } from '@/lib/contracts';
import { archiveLead,createLead,deleteLead } from '@/app/actions/intake';
import { ActionForm } from '@/components/action-form';
import { Empty } from '@/components/ui';
import { IntakeFields,IntakeSetupNotice } from './intake-fields';
import { isAiReceptionistLead,isNewAiReceptionistLead } from '@/lib/ai-lead-notifications';
import { getLeadDisplayDetails } from '@/lib/lead-display';
import { LEAD_PRIORITIES,LEAD_STATUSES } from '@/lib/intake-contracts';

type LeadView = 'attention'|'all'|'new'|'contacted'|'scheduled'|'closed';
type LeadDateFilter = 'any'|'today'|'next-7-days'|'overdue'|'none';
type LeadFilters = {view?:string|string[];q?:string|string[];status?:string|string[];priority?:string|string[];source?:string|string[];date?:string|string[]};

const LEAD_VIEWS: Array<{value:LeadView; label:string}> = [
  { value: 'attention', label: 'Needs attention' },
  { value: 'all', label: 'All leads' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'closed', label: 'Closed' },
];

function single(value: string|string[]|undefined) { return typeof value === 'string' ? value : ''; }
function isNeedsAttention(status: string, priority: string, followUpDate: string|null) {
  return status !== 'closed' && (status === 'new' || priority === 'high' || priority === 'urgent' || (status === 'contacted' && !followUpDate));
}
const receivedDateTime = (value: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(value));

function dateMatches(filter: LeadDateFilter, value: string|null, today: string, nextWeek: string) {
  if (filter === 'any') return true;
  if (filter === 'none') return !value;
  if (!value) return false;
  if (filter === 'today') return value === today;
  if (filter === 'next-7-days') return value >= today && value <= nextWeek;
  return value < today;
}

export default async function Leads({params,searchParams}: {params:Promise<{tenantId:string}>;searchParams?:Promise<LeadFilters>}) {
  const {tenantId}=await params;
  const [{role},inbox,filters]=await Promise.all([getWorkspace(tenantId),getLeads(tenantId),searchParams ?? Promise.resolve({} as LeadFilters)]);
  if (!inbox.ready) return <><div className="page-heading"><span className="eyebrow">SERVICE INTAKE</span><h1>Leads & service requests</h1></div><IntakeSetupNotice/></>;
  const writable=canManageCustomers(role);
  const customers=writable ? await getCustomers(tenantId) : [];
  const requestedView=single(filters.view);
  const view=LEAD_VIEWS.some(item=>item.value===requestedView) ? requestedView as LeadView : 'attention';
  const query=single(filters.q).trim().toLowerCase();
  const status=typeof filters.status==='string' && LEAD_STATUSES.includes(filters.status as typeof LEAD_STATUSES[number]) ? filters.status : '';
  const priority=typeof filters.priority==='string' && LEAD_PRIORITIES.includes(filters.priority as typeof LEAD_PRIORITIES[number]) ? filters.priority : '';
  const source=filters.source === 'ai' || filters.source === 'manual' ? filters.source : '';
  const requestedDate=single(filters.date);
  const date:LeadDateFilter=['any','today','next-7-days','overdue','none'].includes(requestedDate) ? requestedDate as LeadDateFilter : 'any';
  const today=new Date().toISOString().slice(0,10);
  const nextWeekDate=new Date(`${today}T00:00:00Z`);
  nextWeekDate.setUTCDate(nextWeekDate.getUTCDate()+7);
  const nextWeek=nextWeekDate.toISOString().slice(0,10);
  const displayById=new Map(inbox.leads.map(lead=>[lead.id,getLeadDisplayDetails(lead)]));
  const matchesView=(lead: typeof inbox.leads[number]) => view==='all' || (view==='attention' ? isNeedsAttention(lead.status,lead.priority,lead.follow_up_date) : lead.status===view);
  const matchesQuery=(lead: typeof inbox.leads[number]) => {
    if (!query) return true;
    const display=displayById.get(lead.id);
    return [display?.name,display?.email,display?.phone,display?.serviceRequest,lead.description].filter(Boolean).some(value=>String(value).toLowerCase().includes(query));
  };
  const filtered=inbox.leads.filter(lead => matchesView(lead) && matchesQuery(lead) && dateMatches(date,lead.follow_up_date,today,nextWeek) && (!status || lead.status===status) && (!priority || lead.priority===priority) && (!source || (source==='ai' ? isAiReceptionistLead(lead) : !isAiReceptionistLead(lead))));
  const counts=Object.fromEntries(LEAD_VIEWS.map(item=>[item.value,inbox.leads.filter(lead=>item.value==='all' ? true : item.value==='attention' ? isNeedsAttention(lead.status,lead.priority,lead.follow_up_date) : lead.status===item.value).length])) as Record<LeadView,number>;
  const viewHref=(nextView:LeadView) => `/workspaces/${tenantId}/leads?${new URLSearchParams({view:nextView}).toString()}`;
  return <>
    <div className="page-heading"><span className="eyebrow">SERVICE INTAKE</span><h1>Leads & service requests</h1><p>Track enquiries and the next conversation with your team.</p></div>
    {!writable && <p className="notice">Your {role} role has read-only access. An owner, admin, or dispatcher can manage enquiries.</p>}
    <nav className="lead-view-tabs" aria-label="Lead views">{LEAD_VIEWS.map(item=><Link key={item.value} className={view===item.value ? 'active' : ''} aria-current={view===item.value ? 'page' : undefined} href={viewHref(item.value)}><span>{item.label}</span><strong>{counts[item.value]}</strong></Link>)}</nav>
    <form className="lead-filter" method="get" aria-label="Filter leads"><input type="hidden" name="view" value={view}/><label className="field lead-search"><span>Search leads</span><input name="q" defaultValue={single(filters.q)} placeholder="Name, phone, email, or service" /></label><label className="field"><span>Status</span><select name="status" defaultValue={status}><option value="">All statuses</option>{LEAD_STATUSES.map(value=><option key={value} value={value}>{value.charAt(0).toUpperCase()+value.slice(1)}</option>)}</select></label><label className="field"><span>Priority</span><select name="priority" defaultValue={priority}><option value="">All priorities</option>{LEAD_PRIORITIES.map(value=><option key={value} value={value}>{value.charAt(0).toUpperCase()+value.slice(1)}</option>)}</select></label><label className="field"><span>Follow-up date</span><select name="date" defaultValue={date}><option value="any">Any date</option><option value="today">Today</option><option value="next-7-days">Next 7 days</option><option value="overdue">Overdue</option><option value="none">No date set</option></select></label><label className="field"><span>Source</span><select name="source" defaultValue={source}><option value="">All sources</option><option value="ai">AI receptionist</option><option value="manual">Manual</option></select></label><button className="button" type="submit">Apply filters</button><Link className="button secondary" href={viewHref(view)}>Clear filters</Link></form>
    <div className="split-layout"><section className="panel"><div className="section-heading"><div><h2>{LEAD_VIEWS.find(item=>item.value===view)?.label}</h2><p className="small">{filtered.length} of {counts[view]} enquiries shown</p></div><span className="lead-view-hint">Start here, then work down the queue.</span></div><div className="lead-priority-key" aria-label="Priority guide"><span><i className="lead-priority-dot urgent"/>Urgent</span><span><i className="lead-priority-dot high"/>High</span><span><i className="lead-priority-dot normal"/>Normal</span><span><i className="lead-priority-dot low"/>Low</span></div>{filtered.length ? <div className="table-scroll"><table><caption className="muted">Use views and search to keep the queue focused on the next conversation.</caption><thead><tr><th scope="col">Enquiry</th><th scope="col">Received (UTC)</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">Priority</th><th scope="col">Follow-up</th><th scope="col">Actions</th></tr></thead><tbody>{filtered.map(lead => { const aiLead = isNewAiReceptionistLead(lead); const display = displayById.get(lead.id) ?? getLeadDisplayDetails(lead); return <tr key={lead.id} className={lead.priority==='urgent' ? 'lead-row-urgent' : lead.priority==='high' ? 'lead-row-high' : undefined}><td><div className="lead-row-title"><strong>{display.name}</strong>{aiLead && <span className="pill">NEW AI LEAD</span>}</div><span className="lead-row-summary">{display.serviceRequest}</span></td><td><time dateTime={lead.created_at}>{receivedDateTime(lead.created_at)}</time></td><td>{isAiReceptionistLead(lead) ? 'AI receptionist' : 'Manual'}</td><td>{lead.status}</td><td><span className={`lead-priority lead-priority-${lead.priority}`}><i aria-hidden="true"/>{lead.priority}</span></td><td>{lead.follow_up_date ?? 'Not set'}</td><td><div className="button-row lead-actions"><Link className="card-link" href={`/workspaces/${tenantId}/leads/${lead.id}`} aria-label={`Open enquiry for ${display.name}`}>Open ↗</Link>{writable && <><ActionForm action={archiveLead} submitLabel="Archive" hidden={{tenantId,leadId:lead.id}}><span className="visually-hidden">Archive {display.name}</span></ActionForm><ActionForm action={deleteLead} submitLabel="Delete" hidden={{tenantId,leadId:lead.id}}><span className="visually-hidden">Delete {display.name}</span></ActionForm></>}</div></td></tr>; })}</tbody></table></div> : <Empty title={inbox.leads.length ? 'No enquiries match this view' : 'No enquiries yet'}>{inbox.leads.length ? 'Try another view, clear the filters, or search for a different contact.' : 'Add a service request to track its status, priority and follow-up date.'}</Empty>}</section>{writable && <section className="panel"><h2>Add an enquiry</h2><ActionForm action={createLead} submitLabel="Create enquiry" hidden={{tenantId,submissionId:randomUUID()}}><IntakeFields customers={customers}/></ActionForm></section>}</div>
  </>;
}
