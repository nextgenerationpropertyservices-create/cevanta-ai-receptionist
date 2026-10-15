import { Suspense } from 'react';
import Link from 'next/link';
import type { Role,Tenant } from '@/lib/contracts';
import { Brand } from '@/components/ui';
import { signOut } from '@/app/actions/auth';
import { WorkspaceNav,type WorkspaceNavLink } from '@/components/workspace-nav';

export interface WorkspaceAttention { aiLeads: number; urgentAiLeads?: number; unassignedJobs: number; newestAiLeadId?: string | null }

export function WorkspaceShell({tenant,role,children,attention={aiLeads:0,unassignedJobs:0}}: {tenant: Tenant;role: Role;children?: React.ReactNode;attention?: WorkspaceAttention}) {
 const base = `/workspaces/${tenant.id}`;
 const totalAttention=attention.aiLeads+attention.unassignedJobs;
 const leadAlert=attention.aiLeads>0 && attention.newestAiLeadId;
 const urgentLeadText=attention.urgentAiLeads ? `, including ${attention.urgentAiLeads} urgent or high-priority` : "";
 const links: WorkspaceNavLink[]=[
  {href:base,label:'Overview'},
  {href:`${base}/notifications`,label:'Notifications',count:totalAttention},
  ...(tenant.account_type === 'internal' ? [{href:`${base}/clients`,label:'Clients'}] : []),
  {href:`${base}/customers`,label:'Customers'},
  {href:`${base}/leads`,label:'Leads',count:attention.aiLeads},
  {href:`${base}/jobs`,label:role === 'technician' ? 'My jobs' : 'Jobs',count:attention.unassignedJobs},
  ...((role === 'owner' || role === 'admin') ? [{href:`${base}/technicians`,label:'Technicians'}] : []),
  {href:`${base}/calendar`,label:'Calendar'},
  {href:`${base}/onboarding`,label:'Setup'},
  {href:`${base}/launch`,label:'Launch'},
  {href:`${base}/go-live`,label:'Go Live'},
  {href:`${base}/billing`,label:'Billing'},
  {href:`${base}/manual`,label:'Manual'},
  {href:`${base}/receptionist`,label:'Receptionist'},
  {href:`${base}/reports`,label:'Reports'},
  {href:`${base}/integrations`,label:'Integrations'},
  {href:`${base}/settings`,label:'Settings'},
 ];
 return <div className="app-shell topnav-shell"><header className="workspace-topnav"><div className="workspace-topnav-main"><Brand/><div className="workspace-topnav-label"><span className="avatar">{tenant.name.slice(0,1)}</span><div><strong>{tenant.name}</strong><span>{tenant.trade} · {role} access</span></div></div><div className="workspace-topnav-actions">{tenant.account_type === 'client' && (role === 'owner' || role === 'admin') && <Link className="button workspace-setup-cta" href={`${base}/onboarding`}>Start setup</Link>}{totalAttention>0 && <Link className="workspace-attention-link" href={`${base}/notifications`} aria-label={`${totalAttention} items need attention`}><strong>{totalAttention}</strong> need attention</Link>}<Link className="card-link" href="/workspaces">Switch workspace ↗</Link><form action={signOut}><button className="text-button" type="submit">Sign out</button></form></div></div><Suspense fallback={<nav className="workspace-topnav-menu" aria-label="Workspace"><div className="workspace-topnav-primary">{links.slice(0, 6).map(link=><Link key={link.href} href={link.href}>{link.label}{!!link.count && <span className="workspace-nav-badge" aria-label={`${link.count} need attention`}>{link.count}</span>}</Link>)}</div><details className="workspace-nav-more"><summary>More</summary><div className="workspace-nav-more-menu">{links.slice(6).map(link=><Link key={link.href} href={link.href}>{link.label}{!!link.count && <span className="workspace-nav-badge" aria-label={`${link.count} need attention`}>{link.count}</span>}</Link>)}</div></details></nav>}><WorkspaceNav links={links}/></Suspense>{leadAlert && <section className="workspace-lead-alert" role="status" aria-live="polite" aria-label="New AI receptionist lead alert"><div><span className="eyebrow">NEEDS ATTENTION</span><strong>{attention.aiLeads} new lead{attention.aiLeads===1?"":"s"} {attention.aiLeads===1?"needs":"need"} office review{urgentLeadText}</strong><p>Review the lead details before contacting the customer. In-app only — no messages, bookings, payments, calendar writes, or dispatch.</p></div><Link className="button" href={`${base}/leads/${attention.newestAiLeadId}`}>Review newest lead ↗</Link></section>}</header><div className="workspace-content"><main id="main">{children}</main><footer className="app-footer">Cevanta · Your service business, connected.</footer></div></div>;
}
