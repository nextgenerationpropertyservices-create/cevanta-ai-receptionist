import Link from 'next/link';
import {updateJob} from '@/app/actions/jobs';
import {ActionForm} from '@/components/action-form';
import type { Job,Technician } from '@/lib/jobs-contracts';

const statusLabels: Record<Job['status'],string>={new:'New',scheduled:'Scheduled',in_progress:'In progress',completed:'Completed',cancelled:'Cancelled'};
const activeJob=(job:Job)=>job.status!=='completed'&&job.status!=='cancelled';
export function DispatchBoard({jobs,technicians,tenantId,technicianView,writable=false}: {jobs:Job[];technicians:Technician[];tenantId:string;technicianView:boolean;writable?:boolean}) {
 return <div className="dispatch-cards">{jobs.map(job => {const technicianName=technicianView ? 'Assigned to you' : job.assigned_user_id ? technicians.find(technician=>technician.user_id===job.assigned_user_id)?.display_name ?? 'Assigned technician' : 'Unassigned';const needsAssignment=!job.assigned_user_id&&activeJob(job);return <article className={`dispatch-card ${needsAssignment?'dispatch-card-alert':''}`} key={job.id}>
  <div className="dispatch-card-top"><span className={`dispatch-status dispatch-status-${job.status}`}>{statusLabels[job.status]}</span><span className={`dispatch-priority dispatch-priority-${job.priority}`}>{job.priority} priority</span>{needsAssignment && <span className="dispatch-priority dispatch-priority-urgent">Needs tech</span>}</div>
  <h3><Link href={`/workspaces/${tenantId}/jobs/${job.id}`}>{job.title}</Link></h3>
  <p className="dispatch-description">{job.description}</p>
  <dl className="dispatch-meta"><div><dt>Scheduled</dt><dd>{job.scheduled_date ? <time dateTime={job.scheduled_date}>{new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(job.scheduled_date + 'T00:00:00Z'))}</time> : 'Date not set'}</dd></div><div><dt>Assignment</dt><dd>{technicianName}</dd></div></dl>
  {writable && !technicianView && activeJob(job) && <details className="dispatch-quick-assign"><summary>{job.assigned_user_id ? 'Change technician' : 'Assign technician'}</summary><ActionForm action={updateJob} submitLabel="Save assignment" hidden={{tenantId,jobId:job.id,title:job.title,description:job.description,status:job.status,priority:job.priority,scheduled_date:job.scheduled_date ?? ''}}><label className="field"><span>Technician</span><select name="assigned_user_id" defaultValue={job.assigned_user_id ?? ''}><option value="">Unassigned</option>{technicians.map(technician=><option key={technician.user_id} value={technician.user_id}>{technician.display_name}</option>)}</select></label>{!technicians.length && <p className="notice">Add technicians first, then assign this job.</p>}</ActionForm></details>}
  <Link className="dispatch-open" href={`/workspaces/${tenantId}/jobs/${job.id}`} aria-label={`Open job: ${job.title}`}>View job <span aria-hidden="true">↗</span></Link>
 </article>;})}</div>;
}
