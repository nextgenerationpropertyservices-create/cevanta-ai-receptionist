import {randomUUID} from 'node:crypto';
import Link from 'next/link';
import {getWorkspace} from '@/lib/server/queries';
import {getJobs,getTechnicians} from '@/lib/server/jobs-queries';
import {getAppointments} from '@/lib/server/appointments-queries';
import {createAppointment,updateAppointment} from '@/app/actions/appointments';
import {canManageCustomers} from '@/lib/contracts';
import type { Job,Technician } from '@/lib/jobs-contracts';
import {ActionForm} from '@/components/action-form';
import {Empty} from '@/components/ui';
import {AppointmentFields,CalendarSetupNotice} from './appointment-fields';

type CalendarView='year'|'month'|'week'|'day'|'hour';
const views:CalendarView[]=['year','month','week','day','hour'];
const formatTime=(value:string)=>new Intl.DateTimeFormat('en-US',{dateStyle:'medium',timeStyle:'short',timeZone:'UTC'}).format(new Date(value));
const dayKey=(date:Date)=>date.toISOString().slice(0,10);
const parseDate=(value:string)=>new Date(`${value}T00:00:00.000Z`);
const addDays=(date:Date,days:number)=>new Date(date.getTime()+days*86400000);
const addMonths=(date:Date,months:number)=>new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+months,1));
const startOfWeek=(date:Date)=>{const day=date.getUTCDay()||7;return addDays(new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate())),-(day-1));};
const titleFor=(view:CalendarView,date:Date)=>{
 const month=new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric',timeZone:'UTC'}).format(date);
 if(view==='year') return String(date.getUTCFullYear());
 if(view==='month') return month;
 if(view==='week') return `Week of ${formatTime(startOfWeek(date).toISOString()).replace(/, 12:00 AM$/,'')}`;
 if(view==='day') return new Intl.DateTimeFormat('en-US',{dateStyle:'full',timeZone:'UTC'}).format(date);
 return `${new Intl.DateTimeFormat('en-US',{dateStyle:'medium',timeZone:'UTC'}).format(date)} by hour`;
};
const rangeFor=(view:CalendarView,date:Date)=>{
 if(view==='year') return {start:new Date(Date.UTC(date.getUTCFullYear(),0,1)),end:new Date(Date.UTC(date.getUTCFullYear()+1,0,1))};
 if(view==='month') return {start:new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),1)),end:addMonths(date,1)};
 if(view==='week') {const start=startOfWeek(date);return {start,end:addDays(start,7)};}
 const start=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate()));
 return {start,end:addDays(start,1)};
};
const activeJob=(job:Job)=>job.status!=='completed'&&job.status!=='cancelled';
const jobPriorityTone=(job?:Job)=>job && (job.priority==='urgent'||job.priority==='high') ? 'urgent' : '';
const jobAssignmentTone=(job?:Job)=>job && !job.assigned_user_id && activeJob(job) ? 'unassigned' : 'assigned';
const eventTone=(job:Job|undefined,status:string)=>status==='cancelled' ? 'cancelled' : jobPriorityTone(job) || jobAssignmentTone(job);
const technicianName=(job:Job|undefined,technicians:Technician[])=>job?.assigned_user_id ? technicians.find(tech=>tech.user_id===job.assigned_user_id)?.display_name ?? 'Assigned technician' : 'Unassigned';
const inRangeByScheduledDate=(job:Job,start:Date,end:Date)=>job.scheduled_date ? parseDate(job.scheduled_date)>=start && parseDate(job.scheduled_date)<end : false;

export default async function Calendar({params,searchParams}:{params:Promise<{tenantId:string}>;searchParams:Promise<{date?:string|string[];status?:string|string[];view?:string|string[]}>}) {
 const {tenantId}=await params;
 const [workspace,inbox,filters,jobInbox]=await Promise.all([getWorkspace(tenantId),getAppointments(tenantId),searchParams,getJobs(tenantId)]);
 if(!inbox.ready || !jobInbox.ready) return <CalendarSetupNotice/>;
 const writable=canManageCustomers(workspace.role);
 const technician=workspace.role==='technician';
 const techInbox=writable ? await getTechnicians(tenantId) : {ready:true,technicians:[]};
 if(!techInbox.ready) return <CalendarSetupNotice/>;
 const rawDate=typeof filters.date==='string' && /^\d{4}-\d{2}-\d{2}$/.test(filters.date) && !Number.isNaN(Date.parse(filters.date)) && new Date(filters.date).toISOString().slice(0,10)===filters.date ? filters.date : (inbox.appointments[0]?.starts_at.slice(0,10) ?? new Date().toISOString().slice(0,10));
 const activeView=views.includes(filters.view as CalendarView) ? filters.view as CalendarView : 'month';
 const status=filters.status==='scheduled' || filters.status==='cancelled' ? filters.status : '';
 const activeDate=parseDate(rawDate);
 const range=rangeFor(activeView,activeDate);
 const jobsById=new Map(jobInbox.jobs.map(job=>[job.id,job]));
 const appointments=inbox.appointments.filter(item=>{const start=new Date(item.starts_at);return (!status || item.status===status) && start>=range.start && start<range.end;});
 const visibleJobs=jobInbox.jobs.filter(job=>activeJob(job));
 const urgentJobs=visibleJobs.filter(job=>(job.priority==='urgent'||job.priority==='high') && inRangeByScheduledDate(job,range.start,range.end));
 const unassignedJobs=visibleJobs.filter(job=>!job.assigned_user_id);
 const unassignedInRange=unassignedJobs.filter(job=>inRangeByScheduledDate(job,range.start,range.end));
 const attentionJobs=[...urgentJobs,...unassignedInRange.filter(job=>!urgentJobs.some(urgent=>urgent.id===job.id))].slice(0,6);
 const periods=activeView==='year' ? Array.from({length:12},(_,month)=>({key:`${activeDate.getUTCFullYear()}-${String(month+1).padStart(2,'0')}`,label:new Intl.DateTimeFormat('en-US',{month:'long',timeZone:'UTC'}).format(new Date(Date.UTC(activeDate.getUTCFullYear(),month,1))),start:new Date(Date.UTC(activeDate.getUTCFullYear(),month,1)),end:new Date(Date.UTC(activeDate.getUTCFullYear(),month+1,1))})) : activeView==='month' ? Array.from({length:new Date(Date.UTC(activeDate.getUTCFullYear(),activeDate.getUTCMonth()+1,0)).getUTCDate()},(_,index)=>{const start=new Date(Date.UTC(activeDate.getUTCFullYear(),activeDate.getUTCMonth(),index+1));return {key:dayKey(start),label:new Intl.DateTimeFormat('en-US',{weekday:'short',month:'short',day:'numeric',timeZone:'UTC'}).format(start),start,end:addDays(start,1)};}) : activeView==='week' ? Array.from({length:7},(_,index)=>{const start=addDays(startOfWeek(activeDate),index);return {key:dayKey(start),label:new Intl.DateTimeFormat('en-US',{weekday:'long',month:'short',day:'numeric',timeZone:'UTC'}).format(start),start,end:addDays(start,1)};}) : Array.from({length:24},(_,hour)=>{const start=new Date(Date.UTC(activeDate.getUTCFullYear(),activeDate.getUTCMonth(),activeDate.getUTCDate(),hour));return {key:`${dayKey(start)}-${hour}`,label:new Intl.DateTimeFormat('en-US',{hour:'numeric',timeZone:'UTC'}).format(start),start,end:new Date(start.getTime()+3600000)};});
 const periodItems=(start:Date,end:Date)=>appointments.filter(item=>{const value=new Date(item.starts_at);return value>=start&&value<end;});
 return <>
  <div className="page-heading dispatch-heading"><div><span className="eyebrow">{technician ? 'YOUR SERVICE VISITS' : 'WORKSPACE CALENDAR'}</span><h1>Plan the day, week, month, and year.</h1><p>{technician ? 'Appointments for jobs currently assigned to you.' : 'A full front-office calendar with clear job and technician assignment context.'} All times shown in UTC.</p></div><span className="pill">{writable ? 'OFFICE SCHEDULING' : 'READ-ONLY CALENDAR'}</span></div>
  <form className="dispatch-filter calendar-filter" method="get"><label className="field"><span>Calendar date (UTC)</span><input type="date" name="date" defaultValue={rawDate}/></label><label className="field"><span>Appointment status</span><select name="status" defaultValue={status}><option value="">All statuses</option><option value="scheduled">Scheduled</option><option value="cancelled">Cancelled</option></select></label><input type="hidden" name="view" value={activeView}/><button className="button" type="submit">Go to date</button><Link className="button secondary" href={`/workspaces/${tenantId}/calendar`}>Today reset</Link></form>
  {(attentionJobs.length>0 || unassignedJobs.length>0) && !technician && <section className="front-office-alert calendar-attention" role="status" aria-live="polite"><div><span className="eyebrow">CALENDAR NEEDS ATTENTION</span><h2>{attentionJobs.length ? `${attentionJobs.length} urgent or unassigned job${attentionJobs.length===1?'':'s'} in this ${activeView}` : `${unassignedJobs.length} unassigned active job${unassignedJobs.length===1?'':'s'}`}</h2><p>Unassigned and urgent jobs are highlighted before any appointment is promised. SMS, email and external calendar writes stay controlled options until approved.</p></div><Link className="button" href={`/workspaces/${tenantId}/notifications`}>Open notification center ↗</Link></section>}
  {attentionJobs.length>0 && !technician && <section className="panel calendar-attention-panel"><div className="section-heading"><div><span className="eyebrow">URGENT OR UNASSIGNED WORK</span><h2>Review before the office confirms anything</h2></div><Link className="button secondary" href={`/workspaces/${tenantId}/jobs`}>Open dispatch ↗</Link></div><div className="calendar-attention-list">{attentionJobs.map(job=><Link key={job.id} href={`/workspaces/${tenantId}/jobs/${job.id}`}><strong>{job.title}</strong><span>{job.priority} priority · {job.assigned_user_id ? technicianName(job,techInbox.technicians) : 'Unassigned'} · {job.scheduled_date ?? 'date not set'}</span><p>{job.description}</p></Link>)}</div></section>}
  <section className="panel calendar-board-panel"><div className="calendar-menu"><div><span className="eyebrow">CALENDAR MENU</span><h2>{titleFor(activeView,activeDate)}</h2><p className="small">{appointments.length} appointment{appointments.length===1?'':'s'} in this {activeView} view</p></div><nav aria-label="Calendar views">{views.map(view=><Link key={view} className={view===activeView?'active':''} href={`/workspaces/${tenantId}/calendar?view=${view}&date=${rawDate}${status?`&status=${status}`:''}`}>{view[0].toUpperCase()+view.slice(1)}</Link>)}</nav></div><div className={`calendar-board calendar-board-${activeView}`}>{periods.map(period=>{const items=periodItems(period.start,period.end);return <article key={period.key} className={items.length?'has-items':''}><header><strong>{period.label}</strong><span>{items.length}</span></header>{items.slice(0,4).map(item=>{const job=jobsById.get(item.job_id);const techName=technicianName(job,techInbox.technicians);const tone=eventTone(job,item.status);return <Link key={item.id} className={`calendar-event calendar-event-${tone}`} href={`/workspaces/${tenantId}/jobs/${item.job_id}`}><time dateTime={item.starts_at}>{formatTime(item.starts_at)}</time><strong>{item.title}</strong><span>{techName} · {job?.priority ?? 'normal'} priority · {item.status}</span></Link>;})}{items.length>4 && <small>{items.length-4} more appointment{items.length-4===1?'':'s'}</small>}</article>;})}</div></section>
  <div className="section-heading"><h2>{technician ? 'Your appointment details' : 'Appointment list'}</h2><p className="small">{appointments.length} shown · ordered by start time</p></div>
  {appointments.length ? <div className="dispatch-cards">{appointments.map(item=>{const job=jobsById.get(item.job_id);const techName=technicianName(job,techInbox.technicians);const tone=eventTone(job,item.status);return <article className={`dispatch-card calendar-card-${tone}`} key={item.id}><div className="dispatch-card-top"><span className={`dispatch-status dispatch-status-${item.status}`}>{item.status==='scheduled' ? 'Scheduled' : 'Cancelled'}</span><span className="dispatch-priority">{techName}</span>{job && (job.priority==='urgent'||job.priority==='high') && <span className={`dispatch-priority dispatch-priority-${job.priority}`}>{job.priority} priority</span>}{job && !job.assigned_user_id && activeJob(job) && <span className="dispatch-priority dispatch-priority-urgent">Unassigned</span>}</div><h3>{item.title}</h3><dl className="dispatch-meta"><div><dt>Start (UTC)</dt><dd><time dateTime={item.starts_at}>{formatTime(item.starts_at)}</time></dd></div><div><dt>End (UTC)</dt><dd><time dateTime={item.ends_at}>{formatTime(item.ends_at)}</time></dd></div><div><dt>Linked job</dt><dd>{job?.title ?? 'Job details'}</dd></div></dl><Link className="dispatch-open" href={`/workspaces/${tenantId}/jobs/${item.job_id}`}>View linked job <span aria-hidden="true">↗</span></Link>{writable && <details className="dispatch-create"><summary>Edit appointment</summary><ActionForm action={updateAppointment} submitLabel="Save appointment" hidden={{tenantId,appointmentId:item.id}}><AppointmentFields jobs={[]} appointment={item}/></ActionForm></details>}</article>;})}</div> : <section className="panel"><Empty title={inbox.appointments.length ? 'No appointments in this view' : technician ? 'No assigned appointments yet' : 'Your calendar starts here'}>{inbox.appointments.length ? 'Change the date, view, or status to see more appointments.' : writable ? 'Create a service appointment for an existing job below.' : 'Your office team will schedule appointments here.'}</Empty></section>}
  {writable ? <details className="panel dispatch-create"><summary>Create an appointment</summary><p className="small muted">This creates an in-app appointment only. SMS, email and external calendar writes require the controlled automation approval path.</p>{jobInbox.jobs.length ? <ActionForm action={createAppointment} submitLabel="Create appointment" hidden={{tenantId,submissionId:randomUUID()}}><AppointmentFields jobs={jobInbox.jobs}/></ActionForm> : <><p>Create a job before scheduling its first appointment.</p><Link className="button" href={`/workspaces/${tenantId}/jobs`}>Open jobs & dispatch</Link></>}</details> : <p className="notice">Your {workspace.role} role can view appointments. Your office team manages scheduling and cancellations.</p>}
 </>;
}
