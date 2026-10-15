'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface WorkspaceNavLink {
  href: string;
  label: string;
  count?: number;
}

const PRIMARY_LABELS = new Set(['Overview', 'Notifications', 'Clients', 'Leads', 'Jobs', 'Calendar']);

function isActivePath(pathname: string, href: string, label: string) {
  if (label === 'Overview') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function WorkspaceNav({links}: {links: WorkspaceNavLink[]}) {
  const pathname = usePathname();
  const primary = links.filter(link => PRIMARY_LABELS.has(link.label));
  const secondary = links.filter(link => !PRIMARY_LABELS.has(link.label));
  const renderLink = (link: WorkspaceNavLink) => {
    const active = isActivePath(pathname, link.href, link.label);
    return <Link key={link.href} href={link.href} aria-current={active ? 'page' : undefined} className={active ? 'active' : undefined}>{link.label}{!!link.count && <span className="workspace-nav-badge" aria-label={`${link.count} need attention`}>{link.count}</span>}</Link>;
  };
  const secondaryActive = secondary.some(link => isActivePath(pathname, link.href, link.label));
  return <nav className="workspace-topnav-menu" aria-label="Workspace"><div className="workspace-topnav-primary">{primary.map(link => renderLink(link))}</div>{secondary.length > 0 && <details className={secondaryActive ? 'workspace-nav-more active' : 'workspace-nav-more'}><summary>More</summary><div className="workspace-nav-more-menu">{secondary.map(link => renderLink(link))}</div></details>}</nav>;
}
