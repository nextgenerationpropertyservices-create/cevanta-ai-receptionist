'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

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
  const moreRef = useRef<HTMLDetailsElement>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const primary = links.filter(link => PRIMARY_LABELS.has(link.label));
  const secondary = links.filter(link => !PRIMARY_LABELS.has(link.label));
  const renderLink = (link: WorkspaceNavLink) => {
    const active = isActivePath(pathname, link.href, link.label);
    return <Link key={link.href} href={link.href} aria-current={active ? 'page' : undefined} className={active ? 'active' : undefined}>{link.label}{!!link.count && <span className="workspace-nav-badge" aria-label={`${link.count} need attention`}>{link.count}</span>}</Link>;
  };
  const secondaryActive = secondary.some(link => isActivePath(pathname, link.href, link.label));
  useEffect(() => {
    if (!moreOpen) return;
    const closeIfOutside = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && !moreRef.current?.contains(target)) setMoreOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMoreOpen(false);
        moreRef.current?.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', closeIfOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeIfOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [moreOpen]);
  return <nav className="workspace-topnav-menu" aria-label="Workspace destinations"><div className="workspace-topnav-primary">{primary.map(link => renderLink(link))}</div>{secondary.length > 0 && <details ref={moreRef} open={moreOpen} onToggle={event => setMoreOpen(event.currentTarget.open)} className={secondaryActive ? 'workspace-nav-more active' : 'workspace-nav-more'}><summary aria-expanded={moreOpen}>More <span className="workspace-nav-more-count">{secondary.length}</span></summary><div className="workspace-nav-more-menu">{secondary.map(link => renderLink(link))}</div></details>}</nav>;
}
