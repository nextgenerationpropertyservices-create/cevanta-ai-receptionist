import Link from 'next/link';
import { randomUUID } from 'node:crypto';
import { getWorkspaces } from '@/lib/server/queries';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { Brand,Setup } from '@/components/ui';
import { provisionWorkspace, signOut } from '@/app/actions/auth';
import { ActionForm,Field } from '@/components/action-form';
export default async function Workspaces() {
  if (!isSupabaseConfigured()) return <Setup/>;
  const workspaces = await getWorkspaces();
  const internalWorkspaces = workspaces.filter((tenant) => tenant.account_type === 'internal');
  const clientWorkspaces = workspaces.filter((tenant) => tenant.account_type !== 'internal');

  return <main id="main" className="workspace-picker">
    <header className="workspace-picker-header"><Brand/><form action={signOut}><button className="text-button" type="submit">Sign out</button></form></header>
    <section className="workspace-welcome" aria-labelledby="workspace-title">
      <div><span className="eyebrow">CEVANTA WORKSPACE</span><h1 id="workspace-title">Pick up where you left off.</h1><p>Your operations hub and each client workspace stay organized in one secure place.</p></div>
      <div className="workspace-welcome-note"><span className="workspace-welcome-icon" aria-hidden="true">→</span><div><strong>Start with one workspace</strong><span>Open a card below, then continue setup when you’re ready.</span></div></div>
    </section>
    {internalWorkspaces.length > 0 && <section className="workspace-section" aria-labelledby="internal-workspaces-title"><div className="workspace-section-heading"><div><span className="eyebrow">YOUR OPERATIONS</span><h2 id="internal-workspaces-title">Internal dashboard</h2></div><span className="workspace-section-count">{internalWorkspaces.length} workspace{internalWorkspaces.length === 1 ? '' : 's'}</span></div><div className="workspace-grid">{internalWorkspaces.map((tenant) => <WorkspaceCard key={tenant.id} tenant={tenant} internal/>)}</div></section>}
    {clientWorkspaces.length > 0 && <section className="workspace-section" aria-labelledby="client-workspaces-title"><div className="workspace-section-heading"><div><span className="eyebrow">MANAGED CLIENTS</span><h2 id="client-workspaces-title">Client workspaces</h2></div><span className="workspace-section-count">{clientWorkspaces.length} workspace{clientWorkspaces.length === 1 ? '' : 's'}</span></div><div className="workspace-grid">{clientWorkspaces.map((tenant) => <WorkspaceCard key={tenant.id} tenant={tenant}/>)}</div></section>}
    {!workspaces.length && <section className="panel workspace-first-run"><div className="workspace-first-run-copy"><span className="eyebrow">FIRST TIME HERE?</span><h2>Create your first workspace</h2><p>Set up a client workspace for the receptionist pilot. You can add services, hours, call rules, and your team after it is created.</p></div><ActionForm action={provisionWorkspace} submitLabel="Create workspace" hidden={{request_id: randomUUID()}}><Field label="Business name" name="name" required maxLength={160} autoComplete="organization"/><Field label="Trade" name="trade" required maxLength={80} defaultValue="HVAC"/><Field label="Timezone" name="timezone" required maxLength={80} defaultValue="America/New_York"/></ActionForm></section>}
    {workspaces.length > 0 && <p className="workspace-picker-help">Need another client workspace? Ask your Cevanta admin to create one, then return here to open it.</p>}
    <section className="workspace-tour" aria-labelledby="workspace-tour-title"><div className="workspace-section-heading"><div><span className="eyebrow">QUICK TOUR</span><h2 id="workspace-tour-title">What each page is for</h2></div><span className="workspace-section-count">Simple examples to get started</span></div><div className="workspace-tour-grid"><TourCard step="01" title="Setup" text="Add services, hours, service area, escalation contacts, and call rules." example="Example: after-hours emergency calls go to the owner."/><TourCard step="02" title="Leads" text="Review new enquiries captured by the receptionist and decide what needs follow-up." example="Example: a no-cooling call is marked urgent for office review."/><TourCard step="03" title="Jobs & calendar" text="Turn approved work into a job, choose a time, and assign a qualified technician." example="Example: Tuesday at 10:00 AM with the maintenance team."/><TourCard step="04" title="Technicians" text="Keep names, phones, skills, service areas, and availability in one roster." example="Example: add a technician with furnace and heat-pump skills."/><TourCard step="05" title="Notifications" text="Open new leads, urgent jobs, unassigned work, and today’s visits from one queue." example="Example: start the day by clearing the urgent items first."/><TourCard step="06" title="Reports" text="See workload, lead conversion, visits, and an editable estimate of recovered losses." example="Example: change the average job value to match your business."/></div></section>
  </main>;
}

function WorkspaceCard({ tenant, internal = false }: { tenant: Awaited<ReturnType<typeof getWorkspaces>>[number]; internal?: boolean }) {
  return <Link className={`panel workspace-card${internal ? ' workspace-card-internal' : ''}`} href={`/workspaces/${tenant.id}`} aria-label={`Open ${tenant.name}`}>
    <div className="workspace-card-topline">{internal ? <span className="workspace-card-kicker">CEVANTA INTERNAL</span> : <span className="workspace-card-kicker">CLIENT WORKSPACE</span>}<span className="workspace-card-arrow" aria-hidden="true">↗</span></div>
    <span className="avatar">{tenant.name.slice(0, 1)}</span><h3>{tenant.name}</h3><p>{internal ? 'Internal owner dashboard · your command center' : `${tenant.trade} service operations`}</p>
    <span className="pill">{internal ? 'Manage clients' : 'Open client workspace'}</span><span className="card-link">{internal ? 'Open clients dashboard' : 'Open workspace'} <span aria-hidden="true">↗</span></span>
  </Link>;
}

function TourCard({ step, title, text, example }: { step: string; title: string; text: string; example: string }) {
  return <article className="workspace-tour-card"><span className="workspace-tour-step">{step}</span><h3>{title}</h3><p>{text}</p><small>{example}</small></article>;
}
