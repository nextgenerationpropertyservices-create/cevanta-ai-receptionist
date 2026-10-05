import Link from 'next/link';
import type { Job,Technician } from '@/lib/jobs-contracts';

const statusLabels: Record<Job['status'],string>={new:'New',scheduled:'Scheduled',in_progress:'In progress',completed:'Completed',cancelled:'Cancelled'};
export function DispatchBoard({jobs,technicians,tenantId,technicianView}: {jobs:Job[];technicians:Technician[];tenantId:string;technicianView:boolean}) {
 return <div className="dispatch-cards">{jobs.map(job => <article className="dispatch-card" key={job.id}>
  <div className="dispatch-card-top"><span className={`dispatch-status dispatch-status-${job.status}`}>{statusLabels[job.status]}</span><span className={`dispatch-priority dispatch-priority-${job.priority}`}>{job.priority} priority</span></div>
  <h3><Link href={`/workspaces/${tenantId}/jobs/${job.id}`}>{job.title}</Link></h3>
  <p className="dispatch-description">{job.description}</p>
  <dl className="dispatch-meta"><div><dt>Scheduled</dt><dd>{job.scheduled_date ? <time dateTime={job.scheduled_date}>{new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(job.scheduled_date + 'T00:00:00Z'))}</time> : 'Date not set'}</dd></div><div><dt>Assignment</dt><dd>{technicianView ? 'Assigned to you' : job.assigned_user_id ? technicians.find(technician=>technician.user_id===job.assigned_user_id)?.display_name ?? 'Assigned technician' : 'Unassigned'}</dd></div></dl>
  <Link className="dispatch-open" href={`/workspaces/${tenantId}/jobs/${job.id}`} aria-label={`Open job: ${job.title}`}>View job <span aria-hidden="true">↗</span></Link>
 </article>)}</div>;
}
