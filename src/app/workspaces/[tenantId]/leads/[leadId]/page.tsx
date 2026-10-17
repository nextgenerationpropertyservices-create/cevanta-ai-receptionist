import { randomUUID } from 'node:crypto';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCustomers,getWorkspace } from '@/lib/server/queries';
import { getLead } from '@/lib/server/intake-queries';
import { canManageCustomers } from '@/lib/contracts';
import { createJob } from '@/app/actions/jobs';
import { getJobs,getTechnicians,getJobLocations } from '@/lib/server/jobs-queries';
import { JobFields,JobsSetupNotice } from '../../jobs/job-fields';
import { deleteLead, updateLead } from '@/app/actions/intake';
import { ActionForm } from '@/components/action-form';
import { IntakeFields,IntakeSetupNotice } from '../intake-fields';
import { getLeadDisplayDetails,leadWithDisplayDefaults } from '@/lib/lead-display';

const receivedDateTime = (value: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(value));

export default async function LeadDetail({params}: {params:Promise<{tenantId:string;leadId:string}>}) {
  const {tenantId,leadId}=await params;
  const [{role},record]=await Promise.all([getWorkspace(tenantId),getLead(tenantId,leadId)]);
  if (!record.ready) return <IntakeSetupNotice/>;
  if (!record.lead) notFound();
  const lead=record.lead;
  const displayLead=leadWithDisplayDefaults(lead);
  const leadDisplay=getLeadDisplayDetails(lead);
  const writable=canManageCustomers(role);
  const customers=writable ? await getCustomers(tenantId) : [];
  const dispatch=writable ? await getJobs(tenantId) : null;
  const converted=dispatch?.jobs.find(job=>job.lead_id===leadId);
  const options=writable && dispatch?.ready && !converted ? await Promise.all([getTechnicians(tenantId),getJobLocations(tenantId)]) : null;
  return <><Link className="back-link" href={`/workspaces/${tenantId}/leads`}>← Lead inbox</Link><div className="page-heading"><span className="eyebrow">SERVICE REQUEST</span><h1>{leadDisplay.name}</h1><p>{lead.status} · {lead.priority} priority · Received <time dateTime={lead.created_at}>{receivedDateTime(lead.created_at)} UTC</time></p></div><section className="panel"><h2>{writable ? 'Edit enquiry' : 'Enquiry details'}</h2>{writable ? <ActionForm action={updateLead} submitLabel="Save enquiry" hidden={{tenantId,leadId}}><IntakeFields customers={customers} lead={displayLead}/></ActionForm> : <><p className="notice">Your {role} role has read-only access.</p><dl><dt>Email</dt><dd>{leadDisplay.email ?? 'Not added'}</dd><dt>Phone</dt><dd>{leadDisplay.phone ?? 'Not added'}</dd><dt>Service request</dt><dd className="record-notes">{leadDisplay.serviceRequest || 'Not added'}</dd><dt>Follow-up date</dt><dd>{lead.follow_up_date ?? 'Not set'}</dd></dl></>}</section>{writable && <section className="panel danger-zone"><h2>Delete this lead</h2><p className="notice">Use this only for duplicates, test records, or requests your office no longer needs. This removes the lead from this workspace only and does not send messages, cancel jobs, write calendars, collect payment, or dispatch technicians.</p><ActionForm action={deleteLead} submitLabel="Delete lead" hidden={{tenantId,leadId}}><p className="small muted">If this lead is connected to protected call records or jobs, Cevanta may ask you to handle those records first.</p></ActionForm></section>}{writable && <section className="panel dispatch-create"><h2>Turn this enquiry into a job</h2>{!dispatch?.ready ? <JobsSetupNotice/> : converted ? <><p>This enquiry already has a job. Open it to manage scheduling and assignment.</p><Link className="button" href={`/workspaces/${tenantId}/jobs/${converted.id}`}>Open job ↗</Link></> : options?.[0].ready && options[1].ready ? <><p>Create one job from this enquiry. The customer must match the enquiry’s linked customer.</p><ActionForm action={createJob} submitLabel="Create job from enquiry" hidden={{tenantId,submissionId:randomUUID(),lead_id:leadId}}><JobFields customers={lead.customer_id ? customers.filter(customer=>customer.id===lead.customer_id) : customers} locations={options[1].locations} technicians={options[0].technicians} title={leadDisplay.jobTitle} description={leadDisplay.serviceRequest} customerId={lead.customer_id ?? ''} lockCustomer={!!lead.customer_id} priority={lead.priority}/></ActionForm></> : <JobsSetupNotice/>}</section>}</>;
}
