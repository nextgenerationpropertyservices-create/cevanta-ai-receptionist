import Link from 'next/link';
import { getWorkspace } from '@/lib/server/queries';
import { getLeads } from '@/lib/server/intake-queries';
import { getJobs,getTechnicians } from '@/lib/server/jobs-queries';
import { getAppointments } from '@/lib/server/appointments-queries';
import { canManageCustomers } from '@/lib/contracts';
import { isNewAiReceptionistLead,isAiReceptionistLead } from '@/lib/ai-lead-notifications';
import { Empty } from '@/components/ui';
import { RoiCalculator } from '@/components/roi-calculator';
import type { Job,Technician } from '@/lib/jobs-contracts';
import { DashboardWidgets } from '@/components/dashboard-widgets';

const todayKey = () => new Date().toISOString().slice(0,10);
const formatDateTime = (value:string) => new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZone:'UTC'}).format(new Date(value));
const technicianName = (job:Job|undefined,technicians:Technician[]) => job?.assigned_user_id ? technicians.find(tech=>tech.user_id===job.assigned_user_id)?.display_name ?? 'Assigned field tech' : 'Unassigned';

export default async function Dashboard({params}: {params:Promise<{tenantId:string}>}) {
 const {tenantId}=await params;
 const [{tenant,role},inbox,jobsInbox,appointmentsInbox]=await Promise.all([getWorkspace(tenantId),getLeads(tenantId),getJobs(tenantId),getAppointments(tenantId)]);
 const writable=canManageCustomers(role);
 const technicians=writable ? await getTechnicians(tenantId) : {ready:true,technicians:[]};
 const leads=inbox.ready ? inbox.leads : [];
 const aiLeads=leads.filter(isNewAiReceptionistLead);
 const urgentAiLeads=aiLeads.filter(lead=>lead.priority==='urgent'||lead.priority==='high');
 const jobs=jobsInbox.ready ? jobsInbox.jobs : [];
 const appointments=appointmentsInbox.ready ? appointmentsInbox.appointments : [];
 const techs=technicians.ready ? technicians.technicians : [];
 const openJobs=jobs.filter(job=>job.status!=='completed'&&job.status!=='cancelled');
 const unassignedJobs=openJobs.filter(job=>!job.assigned_user_id);
 const scheduledJobs=openJobs.filter(job=>job.status==='scheduled');
 const today=todayKey();
 const todaysAppointments=appointments.filter(item=>item.status==='scheduled'&&item.starts_at.slice(0,10)===today);
 const nextAppointments=appointments.filter(item=>item.status==='scheduled').slice(0,4);
 const aiCaptured=leads.filter(isAiReceptionistLead).length;
 const notifications=[
  aiLeads.length ? `${aiLeads.length} new AI lead${aiLeads.length===1?'':'s'} ${aiLeads.length===1?'needs':'need'} office review` : '',
  urgentAiLeads.length ? `${urgentAiLeads.length} urgent/high-priority AI lead${urgentAiLeads.length===1?'':'s'}` : '',
  unassignedJobs.length ? `${unassignedJobs.length} open job${unassignedJobs.length===1?'':'s'} unassigned` : '',
  todaysAppointments.length ? `${todaysAppointments.length} scheduled visit${todaysAppointments.length===1?'':'s'} today` : '',
 ].filter(Boolean);
 const jobById=new Map(jobs.map(job=>[job.id,job]));
 return <>
  <div className="front-office-hero"><div><span className="eyebrow">FRONT OFFICE COMMAND CENTER</span><h1>Make every call, lead, and job impossible to miss.</h1><p>{tenant.name} gets one clean front-office workspace for {tenant.trade.toLowerCase()} and other trade-service work: review AI receptionist leads, see dispatch pressure, watch the calendar, and prove the money Cevanta is helping recover.</p></div><RoiCalculator capturedLeadCount={aiCaptured} /></div>
  {notifications.length>0 && <section className="front-office-alert" role="status" aria-live="polite"><div><span className="eyebrow">NEEDS ATTENTION</span><h2>{notifications[0]}</h2><p>{notifications.slice(1).join(' · ') || 'Review this now so the customer does not wait.'}</p></div><Link className="button" href={aiLeads[0] ? `/workspaces/${tenantId}/leads/${aiLeads[0].id}` : `/workspaces/${tenantId}/jobs`}>{aiLeads[0] ? 'Review newest lead' : 'Open dispatch'} ↗</Link></section>}
  <DashboardWidgets tenantId={tenantId} widgets={[
   { id:'summary', label:'Summary cards', href:`/workspaces/${tenantId}/reports`, node:<section className="front-office-stats" aria-label="Front office summary"><article><span>New AI leads</span><strong>{aiLeads.length}</strong><p>{urgentAiLeads.length} urgent/high priority</p></article><article><span>Open jobs</span><strong>{openJobs.length}</strong><p>{unassignedJobs.length} waiting for field assignment</p></article><article><span>Scheduled visits today</span><strong>{todaysAppointments.length}</strong><p>{scheduledJobs.length} jobs marked scheduled</p></article><article><span>Field team</span><strong>{techs.length}</strong><p>{writable ? 'Available in roster' : 'Managed by office roles'}</p></article></section> },
   { id:'queue', label:'Today’s queue', href:`/workspaces/${tenantId}/notifications`, node:<div className="front-office-grid"><section className="panel"><div className="section-heading"><div><span className="eyebrow">TODAY&apos;S QUEUE</span><h2>What the office should handle first</h2></div><Link className="button secondary" href={`/workspaces/${tenantId}/leads`}>Open leads ↗</Link></div><div className="front-office-queue">{aiLeads.slice(0,4).map(lead=><Link key={lead.id} href={`/workspaces/${tenantId}/leads/${lead.id}`}><strong>{lead.name}</strong><span>{lead.priority} priority · AI receptionist lead</span><p>{lead.description}</p></Link>)}{!aiLeads.length && unassignedJobs.slice(0,4).map(job=><Link key={job.id} href={`/workspaces/${tenantId}/jobs/${job.id}`}><strong>{job.title}</strong><span>{job.priority} priority · unassigned job</span><p>{job.description}</p></Link>)}{!aiLeads.length && !unassignedJobs.length && <Empty title="Front office is clear">New AI leads, urgent calls, and unassigned jobs will stand out here.</Empty>}</div></section>
   <section className="panel"><div className="section-heading"><div><span className="eyebrow">DISPATCH COVERAGE</span><h2>Field team and workload</h2></div><Link className="button secondary" href={`/workspaces/${tenantId}/jobs`}>Open dispatch ↗</Link></div>{techs.length ? <div className="tech-load-list">{techs.map(tech=>{const assigned=openJobs.filter(job=>job.assigned_user_id===tech.user_id);return <article key={tech.user_id}><div><strong>{tech.display_name}</strong><span>{assigned.length} open job{assigned.length===1?'':'s'}</span></div><p>{assigned[0]?.title ?? 'No active assignment shown'}</p></article>})}</div> : <Empty title="Field team roster starts here">Add field techs, then fill in their skills and availability so Cevanta can suggest stronger assignments.</Empty>}</section></div> },
   { id:'calendar', label:'Calendar pulse', href:`/workspaces/${tenantId}/calendar`, node:<section className="panel front-office-calendar"><div className="section-heading"><div><span className="eyebrow">CALENDAR PULSE</span><h2>Upcoming jobs by field team</h2></div><Link className="button secondary" href={`/workspaces/${tenantId}/calendar`}>Open full calendar ↗</Link></div>{nextAppointments.length ? <div className="calendar-pulse-list">{nextAppointments.map(item=>{const job=jobById.get(item.job_id);return <article key={item.id}><time dateTime={item.starts_at}>{formatDateTime(item.starts_at)}</time><div><strong>{item.title}</strong><span>{technicianName(job,techs)} · {job?.priority ?? 'normal'} priority</span></div><Link className="card-link" href={`/workspaces/${tenantId}/jobs/${item.job_id}`}>Job ↗</Link></article>})}</div> : <Empty title="Calendar is open">Scheduled jobs will show here with the assigned field tech so the office can see the day at a glance.</Empty>}</section> },
   { id:'actions', label:'Front office actions', href:`/workspaces/${tenantId}/integrations`, node:<section className="panel front-office-next"><span className="eyebrow">RUN YOUR FRONT OFFICE</span><h2>Everything your team needs to respond faster and stay organized</h2><div className="button-row"><Link className="button secondary" href={`/workspaces/${tenantId}/technicians`}>Manage field team</Link><Link className="button secondary" href={`/workspaces/${tenantId}/calendar`}>View schedule</Link><Link className="button secondary" href={`/workspaces/${tenantId}/integrations`}>Review communication settings</Link></div><p className="small muted">Keep technicians, jobs, appointments, service areas, and customer follow-up in one place. Cevanta helps your office see what needs attention, assign the right work, and review any automation before it goes live.</p></section> },
  ]} />
 </>;
}









