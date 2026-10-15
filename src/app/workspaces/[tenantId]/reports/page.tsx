import Link from 'next/link';
import { getWorkspace } from '@/lib/server/queries';
import { getLeads } from '@/lib/server/intake-queries';
import { getJobs } from '@/lib/server/jobs-queries';
import { getAppointments } from '@/lib/server/appointments-queries';
import { isAiReceptionistLead } from '@/lib/ai-lead-notifications';
import { RoiCalculator } from '@/components/roi-calculator';

export default async function Reports({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const [{ tenant }, leadsInbox, jobsInbox, appointmentsInbox] = await Promise.all([getWorkspace(tenantId), getLeads(tenantId), getJobs(tenantId), getAppointments(tenantId)]);
  const leads = leadsInbox.ready ? leadsInbox.leads : [];
  const jobs = jobsInbox.ready ? jobsInbox.jobs : [];
  const appointments = appointmentsInbox.ready ? appointmentsInbox.appointments : [];
  const aiLeads = leads.filter(isAiReceptionistLead);
  const closedLeads = leads.filter(lead => lead.status === 'closed' || lead.status === 'scheduled');
  const openJobs = jobs.filter(job => !['completed', 'cancelled'].includes(job.status));
  const scheduledVisits = appointments.filter(appointment => appointment.status === 'scheduled');
  const conversionRate = aiLeads.length ? Math.round((closedLeads.filter(lead => isAiReceptionistLead(lead)).length / aiLeads.length) * 100) : 0;
  return <>
    <div className="page-heading"><span className="eyebrow">OWNER INSIGHTS</span><h1>See where the front office is creating momentum.</h1><p>{tenant.name} performance signals, workload pressure, and estimated recovered value in one read-only view.</p></div>
    <section className="insight-grid" aria-label="Owner insights"><Link className="insight-card" href={`/workspaces/${tenantId}/leads?source=ai`}><span>AI leads captured</span><strong>{aiLeads.length}</strong><p>Open the AI receptionist lead inbox ↗</p></Link><Link className="insight-card" href={`/workspaces/${tenantId}/leads?source=ai&status=closed`}><span>AI lead conversion</span><strong>{conversionRate}%</strong><p>{closedLeads.length} scheduled or closed across all leads ↗</p></Link><Link className="insight-card" href={`/workspaces/${tenantId}/jobs`}><span>Open workload</span><strong>{openJobs.length}</strong><p>Jobs still moving through the office ↗</p></Link><Link className="insight-card" href={`/workspaces/${tenantId}/calendar`}><span>Scheduled visits</span><strong>{scheduledVisits.length}</strong><p>Appointments on the calendar ↗</p></Link></section>
    <div className="split-layout"><RoiCalculator capturedLeadCount={aiLeads.length}/><section className="panel"><span className="eyebrow">OWNER QUESTIONS</span><h2>Use these signals in your weekly review</h2><ul className="setup-readiness-list"><li>Are urgent AI leads reviewed before the end of the day?</li><li>Are unassigned jobs waiting because of skills, availability, or missing details?</li><li>Which service requests are converting into scheduled work?</li><li>Is the estimated recovered value comfortably above the monthly pilot cost?</li></ul><Link className="button secondary" href={`/workspaces/${tenantId}/notifications`}>Open needs attention ↗</Link></section></div>
    <section className="panel insight-disclaimer"><span className="eyebrow">READ-ONLY ESTIMATES</span><p>These insights summarize records already in Cevanta. Revenue and recovered value are estimates only; this page does not charge customers, send messages, book appointments, write external calendars, or dispatch technicians.</p></section>
  </>;
}
