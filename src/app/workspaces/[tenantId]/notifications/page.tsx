import Link from 'next/link';
import {getWorkspace} from '@/lib/server/queries';
import {getLeads} from '@/lib/server/intake-queries';
import {getJobs,getTechnicians} from '@/lib/server/jobs-queries';
import {getAppointments} from '@/lib/server/appointments-queries';
import {canManageCustomers} from '@/lib/contracts';
import {isNewAiReceptionistLead} from '@/lib/ai-lead-notifications';
import type { Job,Technician } from '@/lib/jobs-contracts';
import {Empty} from '@/components/ui';
import {getLeadDisplayDetails} from '@/lib/lead-display';

const todayKey=()=>new Date().toISOString().slice(0,10);
const formatDateTime=(value:string)=>new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZone:'UTC'}).format(new Date(value));
const activeJob=(job:Job)=>job.status!=='completed'&&job.status!=='cancelled';
const technicianName=(job:Job|undefined,technicians:Technician[])=>job?.assigned_user_id ? technicians.find(tech=>tech.user_id===job.assigned_user_id)?.display_name ?? 'Assigned technician' : 'Unassigned';

export default async function Notifications({params}:{params:Promise<{tenantId:string}>}) {
 const {tenantId}=await params;
 const [workspace,inbox,jobsInbox,appointmentsInbox]=await Promise.all([getWorkspace(tenantId),getLeads(tenantId),getJobs(tenantId),getAppointments(tenantId)]);
 const writable=canManageCustomers(workspace.role);
 const technicians=writable ? await getTechnicians(tenantId) : {ready:true,technicians:[]};
 const leads=inbox.ready ? inbox.leads : [];
 const jobs=jobsInbox.ready ? jobsInbox.jobs : [];
 const appointments=appointmentsInbox.ready ? appointmentsInbox.appointments : [];
 const techs=technicians.ready ? technicians.technicians : [];
 const aiLeads=leads.filter(isNewAiReceptionistLead);
 const urgentAiLeads=aiLeads.filter(lead=>lead.priority==='urgent'||lead.priority==='high');
 const today=todayKey();
 const activeLeads=leads.filter(lead=>lead.status!=='closed');
 const callbacksDue=activeLeads.filter(lead=>!!lead.follow_up_date && lead.follow_up_date <= today);
 const missingInfo=activeLeads.filter(lead=>{const details=getLeadDisplayDetails(lead); return !details.phone && !details.email;});
 const openJobs=jobs.filter(activeJob);
 const unassignedJobs=writable ? openJobs.filter(job=>!job.assigned_user_id) : [];
 const urgentJobs=writable ? openJobs.filter(job=>job.priority==='urgent'||job.priority==='high') : [];
 const todaysAppointments=appointments.filter(item=>item.status==='scheduled'&&item.starts_at.slice(0,10)===today);
 const jobById=new Map(jobs.map(job=>[job.id,job]));
 const newLeadHref=aiLeads[0] ? `/workspaces/${tenantId}/leads/${aiLeads[0].id}` : `/workspaces/${tenantId}/leads`;
 const urgentJobHref=urgentJobs[0] ? `/workspaces/${tenantId}/jobs/${urgentJobs[0].id}` : `/workspaces/${tenantId}/jobs`;
 const unassignedJobHref=unassignedJobs[0] ? `/workspaces/${tenantId}/jobs/${unassignedJobs[0].id}` : `/workspaces/${tenantId}/jobs`;
 const visitHref=todaysAppointments[0] ? `/workspaces/${tenantId}/jobs/${todaysAppointments[0].job_id}` : `/workspaces/${tenantId}/calendar?view=day&date=${today}`;
 const needsAttention=[
  ...urgentAiLeads.map(lead=>({kind:'Urgent AI lead',title:lead.name,detail:lead.description,href:`/workspaces/${tenantId}/leads/${lead.id}`,badge:`${lead.priority} priority`})),
  ...aiLeads.filter(lead=>!urgentAiLeads.some(urgent=>urgent.id===lead.id)).map(lead=>({kind:'New AI lead',title:lead.name,detail:lead.description,href:`/workspaces/${tenantId}/leads/${lead.id}`,badge:'office review'})),
  ...callbacksDue.map(lead=>({kind:'Callback due',title:lead.name,detail:lead.description,href:`/workspaces/${tenantId}/leads/${lead.id}`,badge:`follow-up ${lead.follow_up_date}`})),
  ...missingInfo.filter(lead=>!callbacksDue.some(callback=>callback.id===lead.id)).map(lead=>({kind:'Missing lead info',title:lead.name,detail:'Add a phone or email before the office follows up.',href:`/workspaces/${tenantId}/leads/${lead.id}`,badge:'contact details needed'})),
  ...unassignedJobs.map(job=>({kind:'Unassigned job',title:job.title,detail:job.description,href:`/workspaces/${tenantId}/jobs/${job.id}`,badge:`${job.priority} priority`})),
  ...urgentJobs.filter(job=>job.assigned_user_id).map(job=>({kind:'Urgent assigned job',title:job.title,detail:job.description,href:`/workspaces/${tenantId}/jobs/${job.id}`,badge:technicianName(job,techs)})),
 ].slice(0,12);
 const unavailable=!inbox.ready || !jobsInbox.ready || !appointmentsInbox.ready || !technicians.ready;
 return <>
  <div className="page-heading dispatch-heading"><div><span className="eyebrow">NOTIFICATION CENTER</span><h1>Make new leads and urgent work impossible to miss.</h1><p>This first version is in-app only. SMS, email and external calendar writes are controlled options; automatic booking, payment collection and dispatch automation stay off.</p></div><span className="pill">IN-APP ALERTS</span></div>
  {unavailable && <section className="notice" role="status"><h2>Some attention data is unavailable</h2><p>One or more workspace tables are still being prepared. The notification center will show everything once those records are ready.</p></section>}
  <section className="front-office-stats notification-action-grid" aria-label="Notification shortcuts"><Link href={newLeadHref}><span>New AI leads</span><strong>{aiLeads.length}</strong><p>{aiLeads.length ? 'Open the newest lead for office review.' : 'Open the lead inbox.'}</p></Link><Link href={callbacksDue[0] ? `/workspaces/${tenantId}/leads/${callbacksDue[0].id}` : `/workspaces/${tenantId}/leads?view=all&date=today`}><span>Callbacks due</span><strong>{callbacksDue.length}</strong><p>{callbacksDue.length ? 'Open the next follow-up.' : 'No callbacks are due.'}</p></Link><Link href={missingInfo[0] ? `/workspaces/${tenantId}/leads/${missingInfo[0].id}` : `/workspaces/${tenantId}/leads`}><span>Missing info</span><strong>{missingInfo.length}</strong><p>{missingInfo.length ? 'Complete contact details.' : 'Lead details are complete.'}</p></Link><Link href={urgentJobHref}><span>Urgent jobs</span><strong>{urgentJobs.length}</strong><p>{urgentJobs.length ? 'Open the highest-priority job.' : 'Open the jobs board.'}</p></Link><Link href={unassignedJobHref}><span>Unassigned jobs</span><strong>{unassignedJobs.length}</strong><p>{unassignedJobs.length ? 'Assign a technician now.' : 'Open dispatch.'}</p></Link><Link href={visitHref}><span>Visits today</span><strong>{todaysAppointments.length}</strong><p>{todaysAppointments.length ? 'Open the next visit.' : 'Open today on the calendar.'}</p></Link></section>
  <section className="panel notification-center-panel"><div className="section-heading"><div><span className="eyebrow">NEEDS ATTENTION QUEUE</span><h2>Handle these first</h2><p>Click any item to open the exact lead, job, or visit record.</p></div><Link className="button secondary" href={`/workspaces/${tenantId}/leads`}>Open leads ↗</Link></div>{needsAttention.length ? <div className="notification-list">{needsAttention.map(item=><Link key={`${item.kind}-${item.href}`} href={item.href}><span>{item.kind}</span><strong>{item.title}</strong><em>{item.badge}</em><p>{item.detail}</p></Link>)}</div> : <Empty title="Nothing needs urgent attention">New AI receptionist leads, urgent work, and unassigned jobs will appear here.</Empty>}</section>
  <section className="panel notification-health-panel"><div className="section-heading"><div><span className="eyebrow">SYSTEM HEALTH</span><h2>Know what is ready before you act</h2><p>These checks reflect Cevanta data availability. They do not confirm that an external provider delivered a message or booking.</p></div><Link className="button secondary" href={`/workspaces/${tenantId}/integrations`}>Review integrations ↗</Link></div><div className="front-office-stats"><article><span>Lead intake</span><strong>{inbox.ready ? 'Ready' : 'Needs attention'}</strong><p>{inbox.ready ? 'Leads can be reviewed in this workspace.' : 'Lead records are unavailable.'}</p></article><article><span>Jobs</span><strong>{jobsInbox.ready ? 'Ready' : 'Needs attention'}</strong><p>{jobsInbox.ready ? 'Dispatch records are available.' : 'Job records are unavailable.'}</p></article><article><span>Calendar</span><strong>{appointmentsInbox.ready ? 'Ready' : 'Needs attention'}</strong><p>{appointmentsInbox.ready ? 'Visits can be reviewed here.' : 'Calendar records are unavailable.'}</p></article><article><span>Field roster</span><strong>{technicians.ready ? 'Ready' : 'Needs attention'}</strong><p>{technicians.ready ? 'Technician records are available.' : 'Roster records are unavailable.'}</p></article></div></section>
  <div className="split-layout"><section className="panel"><span className="eyebrow">TODAY&apos;S SCHEDULE</span><h2>Visits the office should watch</h2>{todaysAppointments.length ? <div className="notification-list compact">{todaysAppointments.slice(0,8).map(item=>{const job=jobById.get(item.job_id);return <Link key={item.id} href={`/workspaces/${tenantId}/jobs/${item.job_id}`}><span>{formatDateTime(item.starts_at)}</span><strong>{item.title}</strong><em>{technicianName(job,techs)}</em><p>{job?.priority ?? 'normal'} priority · {item.status}</p></Link>;})}</div> : <Empty title="No visits scheduled today">Scheduled visits will show here with the assigned technician.</Empty>}</section><section className="panel"><span className="eyebrow">CONTROLLED OPTIONS</span><h2>What can be enabled later</h2><ul className="setup-readiness-list"><li>SMS and email notices after provider rules, consent language, and owner approval.</li><li>External calendar writes after conflict checks, test call evidence, and rollback plan.</li><li>Automatic booking remains off until a separate approval and verified booking result exist.</li><li>Payment collection and dispatch automation remain off for this build.</li></ul><Link className="button secondary" href={`/workspaces/${tenantId}/integrations`}>Open integration controls ↗</Link></section></div>
 </>;
}

