import { getWorkspaceRecord } from '@/lib/server/queries';
import { getLeads } from '@/lib/server/intake-queries';
import { getJobs } from '@/lib/server/jobs-queries';
import { isNewAiReceptionistLead } from '@/lib/ai-lead-notifications';
import { canManageCustomers } from '@/lib/contracts';
import { WorkspaceShell } from '@/components/workspace-shell';
import { getWorkspacePlanSummary } from '@/lib/server/workspace-plan-queries';

export default async function Layout({children,params}: {children:React.ReactNode;params:Promise<{tenantId:string}>}) {
 const {tenantId} = await params;
 const [workspace,leads,jobs,planSummary] = await Promise.all([getWorkspaceRecord(tenantId),getLeads(tenantId),getJobs(tenantId),getWorkspacePlanSummary(tenantId)]);
 const officeView=canManageCustomers(workspace.role);
 const aiLeadItems=leads.ready ? leads.leads.filter(isNewAiReceptionistLead) : [];
 const aiLeads=aiLeadItems.length;
 const urgentAiLeads=aiLeadItems.filter(lead=>lead.priority==='urgent' || lead.priority==='high').length;
 const newestAiLeadId=aiLeadItems[0]?.id ?? null;
 const unassignedJobs=officeView && jobs.ready ? jobs.jobs.filter(job=>job.status!=='completed' && job.status!=='cancelled' && !job.assigned_user_id).length : 0;
 return <WorkspaceShell {...workspace} planSummary={planSummary} attention={{aiLeads,urgentAiLeads,unassignedJobs,newestAiLeadId}}>{children}</WorkspaceShell>;
}
