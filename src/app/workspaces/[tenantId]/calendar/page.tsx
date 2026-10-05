import {randomUUID} from 'node:crypto';
import Link from 'next/link';
import {getWorkspace} from '@/lib/server/queries';
import {getJobs} from '@/lib/server/jobs-queries';
import {getAppointments} from '@/lib/server/appointments-queries';
import {createAppointment,updateAppointment} from '@/app/actions/appointments';
import {canManageCustomers} from '@/lib/contracts';
import {ActionForm} from '@/components/action-form';
import {Empty} from '@/components/ui';
import {AppointmentFields,CalendarSetupNotice} from './appointment-fields';

const formatTime=(value:string)=>new Intl.DateTimeFormat('en-US',{dateStyle:'medium',timeStyle:'short',timeZone:'UTC'}).format(new Date(value));

export default async function Calendar({params,searchParams}:{params:Promise<{tenantId:string}>;searchParams:Promise<{date?:string|string[];status?:string|string[]}>}) {
 const {tenantId}=await params;
 const [workspace,inbox,filters]=await Promise.all([getWorkspace(tenantId),getAppointments(tenantId),searchParams]);
 if(!inbox.ready) return <CalendarSetupNotice/>;
 const writable=canManageCustomers(workspace.role);
 const technician=workspace.role==='technician';
 const jobInbox=writable ? await getJobs(tenantId) : null;
 if(jobInbox && !jobInbox.ready) return <CalendarSetupNotice/>;
 const jobs=jobInbox?.jobs ?? [];
 const date=typeof filters.date==='string' && /^\d{4}-\d{2}-\d{2}$/.test(filters.date) && !Number.isNaN(Date.parse(filters.date)) && new Date(filters.date).toISOString().slice(0,10)===filters.date ? filters.date : '';
 const status=filters.status==='scheduled' || filters.status==='cancelled' ? filters.status : '';
 const appointments=inbox.appointments.filter(item=>(!status || item.status===status) && (!date || item.starts_at.slice(0,10)===date));
 return <>
  <div className="page-heading dispatch-heading"><div><span className="eyebrow">{technician ? 'YOUR SERVICE VISITS' : 'WORKSPACE CALENDAR'}</span><h1>Make time for the work.</h1><p>{technician ? 'Appointments for jobs currently assigned to you.' : 'Plan service visits and keep your team’s appointments together.'} All times shown in UTC.</p></div><span className="pill">{writable ? 'OFFICE SCHEDULING' : 'READ-ONLY CALENDAR'}</span></div>
  <form className="dispatch-filter" method="get"><label className="field"><span>Start date (UTC)</span><input type="date" name="date" defaultValue={date}/></label><label className="field"><span>Appointment status</span><select name="status" defaultValue={status}><option value="">All statuses</option><option value="scheduled">Scheduled</option><option value="cancelled">Cancelled</option></select></label><button className="button" type="submit">Apply filters</button><Link className="button secondary" href={`/workspaces/${tenantId}/calendar`}>Clear</Link></form>
  <div className="section-heading"><h2>{technician ? 'Your appointments' : 'Appointments'}</h2><p className="small">{appointments.length} shown · ordered by start time</p></div>
  {appointments.length ? <div className="dispatch-cards">{appointments.map(item=><article className="dispatch-card" key={item.id}><div className="dispatch-card-top"><span className={`dispatch-status dispatch-status-${item.status}`}>{item.status==='scheduled' ? 'Scheduled' : 'Cancelled'}</span></div><h3>{item.title}</h3><dl className="dispatch-meta"><div><dt>Start (UTC)</dt><dd><time dateTime={item.starts_at}>{formatTime(item.starts_at)}</time></dd></div><div><dt>End (UTC)</dt><dd><time dateTime={item.ends_at}>{formatTime(item.ends_at)}</time></dd></div></dl><Link className="dispatch-open" href={`/workspaces/${tenantId}/jobs/${item.job_id}`}>View linked job <span aria-hidden="true">↗</span></Link>{writable && <details className="dispatch-create"><summary>Edit appointment</summary><ActionForm action={updateAppointment} submitLabel="Save appointment" hidden={{tenantId,appointmentId:item.id}}><AppointmentFields jobs={[]} appointment={item}/></ActionForm></details>}</article>)}</div> : <section className="panel"><Empty title={inbox.appointments.length ? 'No matching appointments' : technician ? 'No assigned appointments yet' : 'Your calendar starts here'}>{inbox.appointments.length ? 'Clear the filters to see all available appointments.' : writable ? 'Create a service appointment for an existing job below.' : 'Your office team will schedule appointments here.'}</Empty></section>}
  {writable ? <details className="panel dispatch-create"><summary>Create an appointment</summary>{jobs.length ? <ActionForm action={createAppointment} submitLabel="Create appointment" hidden={{tenantId,submissionId:randomUUID()}}><AppointmentFields jobs={jobs}/></ActionForm> : <><p>Create a job before scheduling its first appointment.</p><Link className="button" href={`/workspaces/${tenantId}/jobs`}>Open jobs & dispatch</Link></>}</details> : <p className="notice">Your {workspace.role} role can view appointments. Your office team manages scheduling and cancellations.</p>}
 </>;
}
