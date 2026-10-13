'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface WorkspaceNavLink {
  href: string;
  label: string;
  count?: number;
}

function isActivePath(pathname: string, href: string, index: number) {
  if (index === 0) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function WorkspaceNav({links}: {links: WorkspaceNavLink[]}) {
  const pathname = usePathname();
  return <nav className="workspace-topnav-menu" aria-label="Workspace">{links.map((link,index)=>{
    const active = isActivePath(pathname, link.href, index);
    return <Link key={link.href} href={link.href} aria-current={active ? 'page' : undefined} className={active ? 'active' : undefined}>{link.label}{!!link.count && <span className="workspace-nav-badge" aria-label={`${link.count} need attention`}>{link.count}</span>}</Link>;
  })}</nav>;
}
