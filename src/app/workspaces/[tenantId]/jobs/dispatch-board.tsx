import Link from 'next/link';
import {updateJob} from '@/app/actions/jobs';
import {ActionForm} from '@/components/action-form';
import type { Job,Technician } from '@/lib/jobs-contracts';
import type { TechnicianProfile } from '@/lib/technician-profiles';

const statusLabels: Record<Job['status'],string>={new:'New',scheduled:'Scheduled',in_progress:'In progress',completed:'Completed',cancelled:'Cancelled'};
const activeJob=(job:Job)=>job.status!=='completed'&&job.status!=='cancelled';
const normalize=(value:string)=>value.toLowerCase();
const technicianOptionLabel=(technician:Technician,profile?:TechnicianProfile)=>profile?.skills.length ? `${technician.display_name} — ${profile.skills.slice(0,3).join(', ')}` : technician.display_name;

export function DispatchBoard({jobs,technicians,technicianProfiles=[],tenantId,technicianView,writable=false}: {jobs:Job[];technicians:Technician[];technicianProfiles?:TechnicianProfile[];tenantId:string;technicianView:boolean;writable?:boolean}) {
 const profileByUser=new Map(technicianProfiles.map(profile=>[profile.user_id,profile]));
 return <div className="dispatch-cards">{jobs.map(job => {
  const technicianName=technicianView ? 'Assigned to you' : job.assigned_user_id ? technicians.find(technician=>technician.user_id===job.assigned_user_id)?.display_name ?? 'Assigned technician' : 'Unassigned';
  const needsAssignment=!job.assigned_user_id&&activeJob(job);
  const jobText=normalize(`${job.title} ${job.description}`);
  const suggestions=technicians.map(technician=>{const profile=profileByUser.get(technician.user_id);const matches=(profile?.skills ?? []).filter(skill=>jobText.includes(normalize(skill)));return {technician,profile,matches};}).filter(item=>item.matches.length>0).sort((a,b)=>b.matches.length-a.matches.length || a.technician.display_name.localeCompare(b.technician.display_name));
  const suggestion=suggestions[0];
  return <article className={`dispatch-card ${needsAssignment?'dispatch-card-alert':''}`} key={job.id}>
  <div className="dispatch-card-top"><span className={`dispatch-status dispatch-status-${job.status}`}>{statusLabels[job.status]}</span><span className={`dispatch-priority dispatch-priority-${job.priority}`}>{job.priority} priority</span>{needsAssignment && <span className="dispatch-priority dispatch-priority-urgent">Needs tech</span>}</div>
  <h3><Link href={`/workspaces/${tenantId}/jobs/${job.id}`}>{job.title}</Link></h3>
  <p className="dispatch-description">{job.description}</p>
  <dl className="dispatch-meta"><div><dt>Scheduled</dt><dd>{job.scheduled_date ? <time dateTime={job.scheduled_date}>{new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(job.scheduled_date + 'T00:00:00Z'))}</time> : 'Date not set'}</dd></div><div><dt>Assignment</dt><dd>{technicianName}</dd></div></dl>
  {writable && !technicianView && needsAssignment && suggestion && <div className="dispatch-suggestion"><strong>Suggested tech: {suggestion.technician.display_name}</strong><span>Matches {suggestion.matches.slice(0,3).join(', ')}</span>{suggestion.profile?.availability_note && <small>{suggestion.profile.availability_note}</small>}</div>}
  {writable && !technicianView && activeJob(job) && <details className="dispatch-quick-assign"><summary>{job.assigned_user_id ? 'Change technician' : 'Assign technician'}</summary><ActionForm action={updateJob} submitLabel="Save assignment" hidden={{tenantId,jobId:job.id,title:job.title,description:job.description,status:job.status,priority:job.priority,scheduled_date:job.scheduled_date ?? ''}}><label className="field"><span>Technician</span><select name="assigned_user_id" defaultValue={job.assigned_user_id ?? ''}><option value="">Unassigned</option>{technicians.map(technician=><option key={technician.user_id} value={technician.user_id}>{technicianOptionLabel(technician,profileByUser.get(technician.user_id))}</option>)}</select></label>{!technicians.length && <p className="notice">Add technicians first, then assign this job.</p>}</ActionForm></details>}
  <Link className="dispatch-open" href={`/workspaces/${tenantId}/jobs/${job.id}`} aria-label={`Open job: ${job.title}`}>View job <span aria-hidden="true">↗</span></Link>
 </article>;})}</div>;
}
