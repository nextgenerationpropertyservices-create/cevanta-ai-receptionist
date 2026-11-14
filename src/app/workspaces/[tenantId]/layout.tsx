import { permitsEnabled } from "@/lib/server/permits";
import { getWorkspaceRecord } from '@/lib/server/queries';
import { getLeads } from '@/lib/server/intake-queries';
import { getJobs } from '@/lib/server/jobs-queries';
import { isNewAiReceptionistLead } from '@/lib/ai-lead-notifications';
import { canManageCustomers } from '@/lib/contracts';
import { WorkspaceShell } from '@/components/workspace-shell';

export default async function Layout({children,params}: {children:React.ReactNode;params:Promise<{tenantId:string}>}) {
 const {tenantId} = await params;
 const workspace = await getWorkspaceRecord(tenantId);
 const permitsAvailable = await permitsEnabled(workspace.client,workspace.tenant,workspace.role);
 if (workspace.tenant.permitdesk_only) return <WorkspaceShell {...workspace} permitsAvailable={permitsAvailable}>{children}</WorkspaceShell>;
 const [leads,jobs] = await Promise.all([getLeads(tenantId),getJobs(tenantId)]);
 const officeView=canManageCustomers(workspace.role);
 const aiLeadItems=leads.ready ? leads.leads.filter(isNewAiReceptionistLead) : [];
 const aiLeads=aiLeadItems.length;
 const urgentAiLeads=aiLeadItems.filter(lead=>lead.priority==='urgent' || lead.priority==='high').length;
 const newestAiLeadId=aiLeadItems[0]?.id ?? null;
 const unassignedJobs=officeView && jobs.ready ? jobs.jobs.filter(job=>job.status!=='completed' && job.status!=='cancelled' && !job.assigned_user_id).length : 0;

 return <WorkspaceShell {...workspace} permitsAvailable={permitsAvailable} attention={{aiLeads,urgentAiLeads,unassignedJobs,newestAiLeadId}}>{children}</WorkspaceShell>;
}
