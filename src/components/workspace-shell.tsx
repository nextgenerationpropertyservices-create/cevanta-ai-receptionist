import Link from 'next/link';
import type { Role,Tenant } from '@/lib/contracts';
import { Brand } from '@/components/ui';
import { signOut } from '@/app/actions/auth';

export interface WorkspaceAttention { aiLeads: number; unassignedJobs: number }

export function WorkspaceShell({tenant,role,children,attention={aiLeads:0,unassignedJobs:0}}: {tenant: Tenant;role: Role;children?: React.ReactNode;attention?: WorkspaceAttention}) {
 const base = `/workspaces/${tenant.id}`;
 const totalAttention=attention.aiLeads+attention.unassignedJobs;
 const links=[
  {href:base,label:'Overview'},
  {href:`${base}/notifications`,label:'Notifications',count:totalAttention},
  ...(tenant.account_type === 'internal' ? [{href:`${base}/clients`,label:'Back office'}] : []),
  {href:`${base}/customers`,label:'Customers'},
  {href:`${base}/leads`,label:'Leads',count:attention.aiLeads},
  {href:`${base}/jobs`,label:role === 'technician' ? 'My jobs' : 'Jobs',count:attention.unassignedJobs},
  ...((role === 'owner' || role === 'admin') ? [{href:`${base}/technicians`,label:'Technicians'}] : []),
  {href:`${base}/calendar`,label:'Calendar'},
  {href:`${base}/onboarding`,label:'Setup'},
  {href:`${base}/launch`,label:'Launch'},
  {href:`${base}/integrations`,label:'Integrations'},
  {href:`${base}/settings`,label:'Settings'},
 ];
 return <div className="app-shell topnav-shell"><header className="workspace-topnav"><div className="workspace-topnav-main"><Brand/><div className="workspace-topnav-label"><span className="avatar">{tenant.name.slice(0,1)}</span><div><strong>{tenant.name}</strong><span>{tenant.trade} · {role} access</span></div></div><div className="workspace-topnav-actions">{totalAttention>0 && <Link className="workspace-attention-link" href={`${base}/notifications`} aria-label={`${totalAttention} items need attention`}><strong>{totalAttention}</strong> need attention</Link>}<Link className="card-link" href="/workspaces">Switch workspace ↗</Link><form action={signOut}><button className="text-button" type="submit">Sign out</button></form></div></div><nav className="workspace-topnav-menu" aria-label="Workspace">{links.map(link=><Link key={link.href} href={link.href}>{link.label}{!!link.count && <span className="workspace-nav-badge" aria-label={`${link.count} need attention`}>{link.count}</span>}</Link>)}</nav></header><div className="workspace-content"><main id="main">{children}</main><footer className="app-footer">Cevanta · Your service business, connected.</footer></div></div>;
}






