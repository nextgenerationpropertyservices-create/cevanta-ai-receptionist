import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./permitdesk.module.css";

export default async function PermitDeskLayout({ children, params }: {
  children: ReactNode;
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const base = `/workspaces/${tenantId}/permits`;
  const groups = [
    { label: "Workspace", links: [
      ["Overview", ""], ["Permit Queue", "?view=queue"], ["Field Intake", "?view=field"],
      ["Utility Coordination", "?view=utility"], ["Inspections", "?view=inspections"], ["Closeout", "?view=closeout"],
    ] },
    { label: "Reference", links: [
      ["AHJ Matrix", "/library#jurisdictions"], ["Scope Templates", "/library#templates"], ["Documents", "/documents"],
    ] },
  ];
  return (
    <div className={styles.shell} data-permitdesk>
      <aside className={styles.sidebar}>
        <Link className={styles.brand} href={base}>PermitDesk <small>By Cevanta</small></Link>
        <nav aria-label="PermitDesk work areas">
          {groups.map(group => (
            <div className={styles.group} key={group.label}>
              <p>{group.label}</p>
              {group.links.map(([label, path]) => <Link key={label} href={base + path}>{label}</Link>)}
            </div>
          ))}
        </nav>
      </aside>
      <div className={styles.content}>
        <header className={styles.topbar}>
          <span>Workspace / <strong>PermitDesk</strong></span>
          <Link href={`/workspaces/${tenantId}`}>Back to Cevanta</Link>
        </header>
        {children}
      </div>
    </div>
  );
}
