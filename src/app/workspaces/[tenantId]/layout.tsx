import { getWorkspace } from '@/lib/server/queries';
import { WorkspaceShell } from '@/components/workspace-shell';
export default async function Layout({children,params}: {children:React.ReactNode;params:Promise<{tenantId:string}>}) { const {tenantId} = await params; const workspace = await getWorkspace(tenantId); return <WorkspaceShell {...workspace}>{children}</WorkspaceShell>; }
