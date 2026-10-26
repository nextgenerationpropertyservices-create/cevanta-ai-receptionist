import Link from 'next/link';
import { getWorkspace } from '@/lib/server/queries';
import { getLeads } from '@/lib/server/intake-queries';
import { getJobs,getTechnicians } from '@/lib/server/jobs-queries';
import { getAppointments } from '@/lib/server/appointments-queries';
import { canManageCustomers } from '@/lib/contracts';
import { isNewAiReceptionistLead,isAiReceptionistLead } from '@/lib/ai-lead-notifications';
import { getLeadDisplayDetails } from '@/lib/lead-display';
import { Empty } from '@/components/ui';
import { RoiCalculator } from '@/components/roi-calculator';
import type { Job,Technician } from '@/lib/jobs-contracts';
import { DashboardWidgets } from '@/components/dashboard-widgets';
import { ActionForm, Field } from '@/components/action-form';
import { archiveManagedClientWorkspace } from '@/app/actions/managed-clients';
import { getManagedClientWorkspaces, type ManagedClientWorkspace } from '@/lib/server/queries';

const todayKey = () => new Date().toISOString().slice(0,10);
const formatDateTime = (value:string) => new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZone:'UTC'}).format(new Date(value));
const technicianName = (job:Job|undefined,technicians:Technician[]) => job?.assigned_user_id ? technicians.find(tech=>tech.user_id===job.assigned_user_id)?.display_name ?? 'Assigned field tech' : 'Unassigned';

async function InternalOperationsDashboard({ tenantId, name }: { tenantId: string; name: string }) {
 const { clients, allowed } = await getManagedClientWorkspaces(tenantId);
 if (!allowed) return <section className="panel"><span className="eyebrow">CEVANTA OPERATIONS</span><h1>Internal access required</h1><p>Your account does not have owner/admin access to the Cevanta operations workspace.</p></section>;
 const onboarding = clients.filter(client => client.status === 'onboarding');
 const live = clients.filter(client => client.status === 'active' || client.status === 'pilot');
 const paused = clients.filter(client => client.status === 'paused');
 return <>
  <section className="internal-ops-hero"><div><span className="eyebrow">CEVANTA OPERATIONS</span><h1>Run your client portfolio from one place.</h1><p>{name} is your internal command center for onboarding, pilot readiness, client support, payment follow-up, and launch decisions. Open a client workspace when you need trade-specific dispatch tools.</p></div><div className="internal-ops-actions"><Link className="button" href={`/workspaces/${tenantId}/clients`}>Manage clients ↗</Link><Link className="button secondary" href={`/workspaces/${tenantId}/reports`}>View reports ↗</Link></div></section>
  <section className="internal-ops-stats" aria-label="Cevanta operations summary"><article><span>Managed clients</span><strong>{clients.length}</strong><p>Every client workspace connected to Cevanta.</p></article><article><span>Onboarding</span><strong>{onboarding.length}</strong><p>Clients still completing setup and paperwork.</p></article><article><span>Live or pilot</span><strong>{live.length}</strong><p>Clients currently in pilot or active service.</p></article><article><span>Paused</span><strong>{paused.length}</strong><p>Clients needing a follow-up decision.</p></article></section>
  <div className="internal-ops-grid"><section className="panel"><div className="section-heading"><div><span className="eyebrow">CLIENT PORTFOLIO</span><h2>What needs your attention</h2></div><Link className="card-link" href={`/workspaces/${tenantId}/clients`}>Open full client monitor ↗</Link></div>{clients.length ? <div className="internal-client-list">{clients.slice(0, 8).map((client: ManagedClientWorkspace) => <Link key={client.id} href={`/workspaces/${client.id}`}><div><strong>{client.name}</strong><span>{client.trade} · {client.timezone}</span></div><em className={`internal-status internal-status-${client.status}`}>{client.status}</em><small>Open workspace ↗</small></Link>)}</div> : <Empty title="No managed clients yet">Create your first client workspace when a prospect accepts the managed pilot.</Empty>}</section><section className="panel"><span className="eyebrow">OWNER SHORTCUTS</span><h2>Keep operations moving</h2><div className="internal-shortcuts"><Link href={`/workspaces/${tenantId}/clients`}><strong>Onboard a client</strong><span>Create a workspace, issue private access, and track setup.</span></Link><Link href={`/workspaces/${tenantId}/billing`}><strong>Payment follow-up</strong><span>Review manual Stripe requests and payment status.</span></Link><Link href={`/workspaces/${tenantId}/manual`}><strong>Operating manual</strong><span>Use the same launch and support process every time.</span></Link><Link href={`/workspaces/${tenantId}/settings`}><strong>Internal settings</strong><span>Manage your Cevanta workspace preferences.</span></Link></div></section></div>
  <section className="panel internal-ops-boundary"><span className="eyebrow">WORKSPACE BOUNDARY</span><h2>Trade tools stay with the client</h2><p>Technicians, jobs, calendars, leads, receptionist settings, and automation controls belong inside each client workspace. This internal dashboard stays focused on your portfolio and the next owner action.</p><div className="internal-ops-boundary-actions"><Link className="button secondary" href={`/workspaces/${tenantId}/clients`}>Review onboarding queue</Link><Link className="button secondary" href={`/workspaces/${tenantId}/launch`}>Check launch readiness</Link></div></section>
 </>;
}

export default async function Dashboard({params}: {params:Promise<{tenantId:string}>}) {
 const {tenantId}=await params;
 const workspace=await getWorkspace(tenantId);
 const {tenant,role}=workspace;
 if (tenant.account_type === 'internal') return await InternalOperationsDashboard({ tenantId, name: tenant.name });
 const [inbox,jobsInbox,appointmentsInbox]=await Promise.all([getLeads(tenantId),getJobs(tenantId),getAppointments(tenantId)]);
 let operatorTenantId: string | null = null;
 if (tenant.account_type === 'client' && (role === 'owner' || role === 'admin') && 'client' in workspace && workspace.client) {
  const managed = await workspace.client.from('managed_client_workspaces').select('operator_tenant_id').eq('client_tenant_id', tenantId).maybeSingle();
  operatorTenantId = managed.error ? null : (managed.data?.operator_tenant_id as string | null ?? null);
 }
 const writable=canManageCustomers(role);
 const technicians=writable ? await getTechnicians(tenantId) : {ready:true,technicians:[]};
 const leads=inbox.ready ? inbox.leads : [];
 const aiLeads=leads.filter(isNewAiReceptionistLead);
 const newLeads=leads.filter(lead=>lead.status==='new');
 const newUrgentLeads=newLeads.filter(lead=>lead.priority==='urgent'||lead.priority==='high');
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
  newLeads.length ? (newLeads.length===aiLeads.length ? `${newLeads.length} new AI lead${newLeads.length===1?'':'s'} ${newLeads.length===1?'needs':'need'} office review` : `${newLeads.length} new lead${newLeads.length===1?'':'s'} ${newLeads.length===1?'needs':'need'} office review`) : '',
  newUrgentLeads.length ? (newUrgentLeads.length===urgentAiLeads.length && newLeads.length===aiLeads.length ? `${newUrgentLeads.length} urgent/high-priority AI lead${newUrgentLeads.length===1?'':'s'}` : `${newUrgentLeads.length} urgent/high-priority lead${newUrgentLeads.length===1?'':'s'}`) : '',
  unassignedJobs.length ? `${unassignedJobs.length} open job${unassignedJobs.length===1?'':'s'} unassigned` : '',
  todaysAppointments.length ? `${todaysAppointments.length} scheduled visit${todaysAppointments.length===1?'':'s'} today` : '',
 ].filter(Boolean);
 const jobById=new Map(jobs.map(job=>[job.id,job]));
 return <>
  <div className="front-office-hero"><div><span className="eyebrow">FRONT OFFICE COMMAND CENTER</span><h1>Make every call, lead, and job impossible to miss.</h1><p>{tenant.name} gets one clean front-office workspace for {tenant.trade.toLowerCase()} and other trade-service work: review AI receptionist leads, see dispatch pressure, watch the calendar, and prove the money Cevanta is helping recover.</p></div><RoiCalculator capturedLeadCount={aiCaptured} /></div>
  {notifications.length>0 && <section className="front-office-alert" role="status" aria-live="polite"><div><span className="eyebrow">NEEDS ATTENTION</span><h2>{notifications[0]}</h2><p>{notifications.slice(1).join(' · ') || 'Review this now so the customer does not wait.'}</p></div><div className="front-office-alert-actions"><Link className="button" href={newLeads[0] ? `/workspaces/${tenantId}/leads/${newLeads[0].id}` : `/workspaces/${tenantId}/jobs`}>{newLeads[0] ? 'Review newest lead' : 'Open dispatch'} ↗</Link><Link className="front-office-alert-secondary" href={`/workspaces/${tenantId}/notifications`}>Open attention queue</Link></div></section>}
  <DashboardWidgets tenantId={tenantId} widgets={[
   { id:'summary', label:'Summary cards', href:`/workspaces/${tenantId}/reports`, node:<section className="front-office-stats" aria-label="Front office summary"><article><span>New leads</span><strong>{newLeads.length}</strong><p>{newUrgentLeads.length} urgent/high priority</p></article><article><span>Open jobs</span><strong>{openJobs.length}</strong><p>{unassignedJobs.length} waiting for field assignment</p></article><article><span>Scheduled visits today</span><strong>{todaysAppointments.length}</strong><p>{scheduledJobs.length} jobs marked scheduled</p></article><article><span>Field team</span><strong>{techs.length}</strong><p>{writable ? 'Available in roster' : 'Managed by office roles'}</p></article></section> },
   { id:'queue', label:'Today’s queue', href:`/workspaces/${tenantId}/notifications`, node:<div className="front-office-grid"><section className="panel"><div className="section-heading"><div><span className="eyebrow">TODAY&apos;S QUEUE</span><h2>What the office should handle first</h2></div><Link className="button secondary" href={`/workspaces/${tenantId}/leads`}>Open leads ↗</Link></div><div className="front-office-queue">{newLeads.slice(0,4).map(lead=><Link key={lead.id} href={`/workspaces/${tenantId}/leads/${lead.id}`}><strong>{getLeadDisplayDetails(lead).name}</strong><span>{lead.priority} priority · {isAiReceptionistLead(lead) ? "AI receptionist" : "manually added"} lead · <time dateTime={lead.created_at}>{formatDateTime(lead.created_at)}</time></span><p>{getLeadDisplayDetails(lead).serviceRequest}</p></Link>)}{!newLeads.length && unassignedJobs.slice(0,4).map(job=><Link key={job.id} href={`/workspaces/${tenantId}/jobs/${job.id}`}><strong>{job.title}</strong><span>{job.priority} priority · unassigned job</span><p>{job.description}</p></Link>)}{!newLeads.length && !unassignedJobs.length && <Empty title="Front office is clear">New leads, urgent calls, and unassigned jobs will stand out here.</Empty>}</div></section>
   <section className="panel"><div className="section-heading"><div><span className="eyebrow">DISPATCH COVERAGE</span><h2>Field team and workload</h2></div><Link className="button secondary" href={`/workspaces/${tenantId}/jobs`}>Open dispatch ↗</Link></div>{techs.length ? <div className="tech-load-list">{techs.map(tech=>{const assigned=openJobs.filter(job=>job.assigned_user_id===tech.user_id);return <article key={tech.user_id}><div><strong>{tech.display_name}</strong><span>{assigned.length} open job{assigned.length===1?'':'s'}</span></div><p>{assigned[0]?.title ?? 'No active assignment shown'}</p></article>})}</div> : <Empty title="Field team roster starts here">Add field techs, then fill in their skills and availability so Cevanta can suggest stronger assignments.</Empty>}</section></div> },
   { id:'calendar', label:'Calendar pulse', href:`/workspaces/${tenantId}/calendar`, node:<section className="panel front-office-calendar"><div className="section-heading"><div><span className="eyebrow">CALENDAR PULSE</span><h2>Upcoming jobs by field team</h2></div><Link className="button secondary" href={`/workspaces/${tenantId}/calendar`}>Open full calendar ↗</Link></div>{nextAppointments.length ? <div className="calendar-pulse-list">{nextAppointments.map(item=>{const job=jobById.get(item.job_id);return <article key={item.id}><time dateTime={item.starts_at}>{formatDateTime(item.starts_at)}</time><div><strong>{item.title}</strong><span>{technicianName(job,techs)} · {job?.priority ?? 'normal'} priority</span></div><Link className="card-link" href={`/workspaces/${tenantId}/jobs/${item.job_id}`}>Job ↗</Link></article>})}</div> : <Empty title="Calendar is open">Scheduled jobs will show here with the assigned field tech so the office can see the day at a glance.</Empty>}</section> },
   { id:'actions', label:'Front office actions', href:`/workspaces/${tenantId}/integrations`, node:<section className="panel front-office-next"><span className="eyebrow">RUN YOUR FRONT OFFICE</span><h2>Everything your team needs to respond faster and stay organized</h2><div className="button-row"><Link className="button secondary" href={`/workspaces/${tenantId}/technicians`}>Manage field team</Link><Link className="button secondary" href={`/workspaces/${tenantId}/calendar`}>View schedule</Link><Link className="button secondary" href={`/workspaces/${tenantId}/integrations`}>Review communication settings</Link></div><p className="small muted">Keep technicians, jobs, appointments, service areas, and customer follow-up in one place. Cevanta helps your office see what needs attention, assign the right work, and review any automation before it goes live.</p></section> },
   ...(operatorTenantId ? [{ id:'workspace-control', label:'Workspace control', href:`/workspaces/${operatorTenantId}/clients`, node:<section className="panel danger-zone"><span className="eyebrow">INTERNAL WORKSPACE CONTROL</span><h2>Remove this client workspace</h2><p className="notice">This archives the workspace from active Cevanta operations, revokes internal access, and preserves records for audit.</p><ActionForm action={archiveManagedClientWorkspace} submitLabel="Archive workspace" hidden={{operatorTenantId, clientTenantId:tenantId}}><Field label="Type DELETE WORKSPACE to confirm" name="confirmation" required autoComplete="off"/><p className="small muted">This control is visible only to an authorized Cevanta internal owner or admin.</p></ActionForm></section> }] : []),
  ]} />
 </>;
}









