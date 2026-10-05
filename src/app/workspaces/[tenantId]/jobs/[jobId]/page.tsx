import Link from 'next/link';
import {notFound} from 'next/navigation';
import {getWorkspace} from '@/lib/server/queries';
import {getJob,getTechnicians} from '@/lib/server/jobs-queries';
import {canManageCustomers} from '@/lib/contracts';
import {updateJob} from '@/app/actions/jobs';
import {ActionForm} from '@/components/action-form';
import {JobFields,JobsSetupNotice} from '../job-fields';

export default async function JobDetail({params}:{params:Promise<{tenantId:string;jobId:string}>}) {
 const {tenantId,jobId}=await params;
 const [workspace,record]=await Promise.all([getWorkspace(tenantId),getJob(tenantId,jobId)]);
 if(!record.ready) return <JobsSetupNotice/>;
 if(!record.job) notFound();
 const job=record.job;
 const writable=canManageCustomers(workspace.role);
 const roster=writable ? await getTechnicians(tenantId) : {ready:true,technicians:[]};
 if(!roster.ready) return <JobsSetupNotice/>;
 return <><Link className="back-link" href={`/workspaces/${tenantId}/jobs`}>← {workspace.role==='technician' ? 'My jobs' : 'Dispatch board'}</Link><div className="page-heading"><span className="eyebrow">JOB RECORD</span><h1>{job.title}</h1><span className={`dispatch-status dispatch-status-${job.status}`}>{job.status.replace('_',' ')}</span></div><section className="panel dispatch-detail"><h2>{writable ? 'Plan and update this job' : 'Your job details'}</h2>{writable ? <ActionForm action={updateJob} submitLabel="Save job" hidden={{tenantId,jobId}}><JobFields job={job} technicians={roster.technicians}/></ActionForm> : <><p className="record-notes">{job.description}</p><dl><div><dt>Priority</dt><dd>{job.priority}</dd></div><div><dt>Scheduled date</dt><dd>{job.scheduled_date ?? 'Not set'}</dd></div><div><dt>Assignment</dt><dd>{workspace.role==='technician' ? 'Assigned to you' : job.assigned_user_id ? 'Assigned technician' : 'Unassigned'}</dd></div></dl><p className="notice">Scheduling, assignment and status changes are managed by your office team.</p></>}</section></>;
}
