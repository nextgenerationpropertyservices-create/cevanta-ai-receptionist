import Link from 'next/link';
import {getWorkspace} from '@/lib/server/queries';
import {getLeads} from '@/lib/server/intake-queries';
import {getJobs,getTechnicians} from '@/lib/server/jobs-queries';
import {getAppointments} from '@/lib/server/appointments-queries';
import {canManageCustomers} from '@/lib/contracts';
import {isNewAiReceptionistLead} from '@/lib/ai-lead-notifications';
import type { Job,Technician } from '@/lib/jobs-contracts';
import {Empty} from '@/components/ui';

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
 const openJobs=jobs.filter(activeJob);
 const unassignedJobs=writable ? openJobs.filter(job=>!job.assigned_user_id) : [];
 const urgentJobs=writable ? openJobs.filter(job=>job.priority==='urgent'||job.priority==='high') : [];
 const today=todayKey();
 const todaysAppointments=appointments.filter(item=>item.status==='scheduled'&&item.starts_at.slice(0,10)===today);
 const jobById=new Map(jobs.map(job=>[job.id,job]));
 const needsAttention=[
  ...urgentAiLeads.map(lead=>({kind:'Urgent AI lead',title:lead.name,detail:lead.description,href:`/workspaces/${tenantId}/leads/${lead.id}`,badge:`${lead.priority} priority`})),
  ...aiLeads.filter(lead=>!urgentAiLeads.some(urgent=>urgent.id===lead.id)).map(lead=>({kind:'New AI lead',title:lead.name,detail:lead.description,href:`/workspaces/${tenantId}/leads/${lead.id}`,badge:'office review'})),
  ...unassignedJobs.map(job=>({kind:'Unassigned job',title:job.title,detail:job.description,href:`/workspaces/${tenantId}/jobs/${job.id}`,badge:`${job.priority} priority`})),
  ...urgentJobs.filter(job=>job.assigned_user_id).map(job=>({kind:'Urgent assigned job',title:job.title,detail:job.description,href:`/workspaces/${tenantId}/jobs/${job.id}`,badge:technicianName(job,techs)})),
 ].slice(0,12);
 const unavailable=!inbox.ready || !jobsInbox.ready || !appointmentsInbox.ready || !technicians.ready;
 return <>
  <div className="page-heading dispatch-heading"><div><span className="eyebrow">NOTIFICATION CENTER</span><h1>Make new leads and urgent work impossible to miss.</h1><p>This first version is in-app only. SMS, email and external calendar writes are controlled options; automatic booking, payment collection and dispatch automation stay off.</p></div><span className="pill">IN-APP ALERTS</span></div>
  {unavailable && <section className="notice" role="status"><h2>Some attention data is unavailable</h2><p>One or more workspace tables are still being prepared. The notification center will show everything once those records are ready.</p></section>}
  <section className="front-office-stats" aria-label="Notification summary"><article><span>New AI leads</span><strong>{aiLeads.length}</strong><p>{urgentAiLeads.length} urgent or high priority</p></article><article><span>Urgent jobs</span><strong>{urgentJobs.length}</strong><p>Needs office confirmation before promises</p></article><article><span>Unassigned jobs</span><strong>{unassignedJobs.length}</strong><p>Assign manually before dispatch</p></article><article><span>Visits today</span><strong>{todaysAppointments.length}</strong><p>In-app calendar only</p></article></section>
  <section className="panel notification-center-panel"><div className="section-heading"><div><span className="eyebrow">NEEDS ATTENTION QUEUE</span><h2>Handle these first</h2></div><Link className="button secondary" href={`/workspaces/${tenantId}/leads`}>Open leads ↗</Link></div>{needsAttention.length ? <div className="notification-list">{needsAttention.map(item=><Link key={`${item.kind}-${item.href}`} href={item.href}><span>{item.kind}</span><strong>{item.title}</strong><em>{item.badge}</em><p>{item.detail}</p></Link>)}</div> : <Empty title="Nothing needs urgent attention">New AI receptionist leads, urgent work, and unassigned jobs will appear here.</Empty>}</section>
  <div className="split-layout"><section className="panel"><span className="eyebrow">TODAY&apos;S SCHEDULE</span><h2>Visits the office should watch</h2>{todaysAppointments.length ? <div className="notification-list compact">{todaysAppointments.slice(0,8).map(item=>{const job=jobById.get(item.job_id);return <Link key={item.id} href={`/workspaces/${tenantId}/jobs/${item.job_id}`}><span>{formatDateTime(item.starts_at)}</span><strong>{item.title}</strong><em>{technicianName(job,techs)}</em><p>{job?.priority ?? 'normal'} priority · {item.status}</p></Link>;})}</div> : <Empty title="No visits scheduled today">Scheduled visits will show here with the assigned technician.</Empty>}</section><section className="panel"><span className="eyebrow">CONTROLLED OPTIONS</span><h2>What can be enabled later</h2><ul className="setup-readiness-list"><li>SMS and email notices after provider rules, consent language, and owner approval.</li><li>External calendar writes after conflict checks, test call evidence, and rollback plan.</li><li>Automatic booking remains off until a separate approval and verified booking result exist.</li><li>Payment collection and dispatch automation remain off for this build.</li></ul><Link className="button secondary" href={`/workspaces/${tenantId}/integrations`}>Open integration controls ↗</Link></section></div>
 </>;
}
