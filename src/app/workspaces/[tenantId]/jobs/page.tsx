import {randomUUID} from 'node:crypto';
import Link from 'next/link';
import {getWorkspace,getCustomers} from '@/lib/server/queries';
import {getJobs,getTechnicians,getJobLocations} from '@/lib/server/jobs-queries';
import {canManageCustomers} from '@/lib/contracts';
import {JOB_STATUSES} from '@/lib/jobs-contracts';
import {createJob} from '@/app/actions/jobs';
import {ActionForm} from '@/components/action-form';
import {Empty} from '@/components/ui';
import {JobFields,JobsSetupNotice} from './job-fields';
import {DispatchBoard} from './dispatch-board';

export default async function Jobs({params,searchParams}:{params:Promise<{tenantId:string}>;searchParams:Promise<{status?:string|string[];date?:string|string[]}>}) {
 const {tenantId}=await params;
 const [workspace,inbox,filters]=await Promise.all([getWorkspace(tenantId),getJobs(tenantId),searchParams]);
 const writable=canManageCustomers(workspace.role);
 const technicianView=workspace.role==='technician';
 if(!inbox.ready) return <JobsSetupNotice/>;
 const [roster,locationOptions,customers]=writable ? await Promise.all([getTechnicians(tenantId),getJobLocations(tenantId),getCustomers(tenantId)]) : [{ready:true,technicians:[]},{ready:true,locations:[]},[]];
 if(!roster.ready || !locationOptions.ready) return <JobsSetupNotice/>;
 const status=JOB_STATUSES.find(value=>value===filters.status) ?? '';
 const date=typeof filters.date==='string' && /^\d{4}-\d{2}-\d{2}$/.test(filters.date) && !Number.isNaN(Date.parse(filters.date)) && new Date(filters.date).toISOString().slice(0,10)===filters.date ? filters.date : '';
 const filtered=inbox.jobs.filter(job=>(!status || job.status===status) && (!date || job.scheduled_date===date));
 const open=inbox.jobs.filter(job=>job.status!=='completed' && job.status!=='cancelled');
 return <>
  <div className="page-heading dispatch-heading"><div><span className="eyebrow">{technicianView ? 'YOUR FIELD WORK' : 'WORKSPACE DISPATCH'}</span><h1>{technicianView ? 'Your next job, in focus.' : 'Keep the day moving.'}</h1><p>{technicianView ? 'Your assigned work, with the details you need before the visit.' : 'Schedule service, assign your technicians and keep every job in view.'}</p></div><span className="pill">{technicianView ? 'ASSIGNED TO YOU' : writable ? 'OFFICE WORKSPACE' : 'READ-ONLY WORKSPACE'}</span></div>
  <section className="dispatch-summary" aria-label="Job summary"><article><span>Open jobs</span><strong>{open.length}</strong></article><article><span>Scheduled</span><strong>{inbox.jobs.filter(job=>job.status==='scheduled').length}</strong></article><article><span>In progress</span><strong>{inbox.jobs.filter(job=>job.status==='in_progress').length}</strong></article><article><span>{technicianView ? 'Completed' : 'Awaiting assignment'}</span><strong>{technicianView ? inbox.jobs.filter(job=>job.status==='completed').length : open.filter(job=>!job.assigned_user_id).length}</strong></article></section>
  <form className="dispatch-filter" method="get"><label className="field"><span>Job status</span><select name="status" defaultValue={status}><option value="">All statuses</option><option value="new">New</option><option value="scheduled">Scheduled</option><option value="in_progress">In progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label><label className="field"><span>Scheduled date</span><input name="date" type="date" defaultValue={date}/></label><button className="button" type="submit">Apply filters</button><Link className="button secondary" href={`/workspaces/${tenantId}/jobs`}>Clear</Link></form>
  <div className="section-heading"><h2>{technicianView ? 'Assigned jobs' : 'Dispatch board'}</h2><p className="small">{filtered.length} {filtered.length===1 ? 'job' : 'jobs'} shown</p></div>
  {filtered.length ? <DispatchBoard jobs={filtered} technicians={roster.technicians} tenantId={tenantId} technicianView={technicianView}/> : <section className="panel"><Empty title={inbox.jobs.length ? 'No jobs match these filters' : technicianView ? 'No assigned jobs yet' : 'A clear board. A fresh start.'}>{inbox.jobs.length ? 'Clear the filters to see the rest of your work.' : technicianView ? 'Your office team will assign jobs here when they are ready.' : writable ? 'Create a job below, or convert an enquiry from the lead inbox.' : 'Your office team can create jobs and assign service work.'}</Empty></section>}
  {writable ? <details className="panel dispatch-create"><summary>Create a job</summary><p>Plan the work now. You can set a date and assign a technician whenever you are ready.</p><ActionForm action={createJob} submitLabel="Create job" hidden={{tenantId,submissionId:randomUUID()}}><JobFields customers={customers} locations={locationOptions.locations} technicians={roster.technicians}/></ActionForm></details> : <p className="notice">{technicianView ? 'You can view your assigned jobs. Contact your office team for scheduling or status changes.' : 'Your viewer role can read jobs. An owner, admin or dispatcher manages scheduling and assignments.'}</p>}
 </>;
}
