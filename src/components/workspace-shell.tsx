import Link from 'next/link';
import type { Role,Tenant } from '@/lib/contracts';
import { Brand } from '@/components/ui';
import { signOut } from '@/app/actions/auth';

export function WorkspaceShell({tenant,role,children}: {tenant: Tenant;role: Role;children: React.ReactNode}) {
 const base = `/workspaces/${tenant.id}`;
 const links=[
  {href:base,label:'Overview'},
  ...(tenant.account_type === 'internal' ? [{href:`${base}/clients`,label:'Clients'}] : []),
  {href:`${base}/customers`,label:'Customers'},
  {href:`${base}/leads`,label:'Leads'},
  {href:`${base}/jobs`,label:role === 'technician' ? 'My jobs' : 'Jobs'},
  ...((role === 'owner' || role === 'admin') ? [{href:`${base}/technicians`,label:'Technicians'}] : []),
  {href:`${base}/calendar`,label:'Calendar'},
  {href:`${base}/onboarding`,label:'Setup'},
  {href:`${base}/launch`,label:'Launch'},
  {href:`${base}/integrations`,label:'Integrations'},
  {href:`${base}/settings`,label:'Settings'},
 ];
 return <div className="app-shell topnav-shell"><header className="workspace-topnav"><div className="workspace-topnav-main"><Brand/><div className="workspace-topnav-label"><span className="avatar">{tenant.name.slice(0,1)}</span><div><strong>{tenant.name}</strong><span>{tenant.trade} · {role} access</span></div></div><div className="workspace-topnav-actions"><Link className="card-link" href="/workspaces">Switch workspace ↗</Link><form action={signOut}><button className="text-button" type="submit">Sign out</button></form></div></div><nav className="workspace-topnav-menu" aria-label="Workspace">{links.map(link=><Link key={link.href} href={link.href}>{link.label}</Link>)}</nav></header><div className="workspace-content"><main id="main">{children}</main><footer className="app-footer">Cevanta · Your service business, connected.</footer></div></div>;
}
