import { canManageSettings } from '@/lib/contracts';
import Link from 'next/link';
import type { Role, Tenant } from '@/lib/contracts';
import { getOnboardingSnapshot } from '@/lib/server/onboarding-rpc';
import { getWorkspace } from '@/lib/server/queries';
import type { OwnerOnboardingSnapshot } from '@/lib/onboarding-contracts';
import { SettingsForm } from './settings-form';

function SettingsDetails({ tenant }: { tenant: Pick<Tenant, 'name' | 'trade' | 'timezone'> }) {
  return <dl className="details"><dt>Business</dt><dd>{tenant.name}</dd><dt>Trade</dt><dd>{tenant.trade}</dd><dt>Time zone</dt><dd>{tenant.timezone}</dd></dl>;
}

function ReadOnlySettings({ tenant, role }: { tenant: Pick<Tenant, 'name' | 'trade' | 'timezone'>; role: Role }) {
  return <><div className="notice">Only workspace owners and admins can update settings. Your {role} access is read-only.</div><SettingsDetails tenant={tenant}/></>;
}

function SettingsUnavailable({ tenant }: { tenant: Pick<Tenant, 'name' | 'trade' | 'timezone'> }) {
  return <><p className="form-error" role="alert">Settings cannot safely save right now. Refresh and try again, or use Setup once the workspace snapshot is available.</p><SettingsDetails tenant={tenant}/><a className="button secondary" href=".">Try again</a></>;
}

function AccountSettings({ email }: { email: string | undefined }) {
  return <section className="panel settings-panel account-settings-panel"><div className="section-heading"><div><span className="eyebrow">ACCOUNT</span><h2>Your sign-in</h2></div></div><dl className="details"><dt>Email</dt><dd>{email ?? 'Email unavailable'}</dd><dt>Password</dt><dd><span className="muted">Hidden for security</span></dd></dl><p className="small muted">Passwords are securely managed by Cevanta authentication and are never displayed in the dashboard.</p><Link className="button secondary" href="/forgot-password">Change password</Link></section>;
}

function ownerSnapshot(snapshot: unknown): snapshot is OwnerOnboardingSnapshot {
  return !!snapshot && typeof snapshot === 'object' && 'projection' in snapshot && snapshot.projection === 'owner_setup';
}

export default async function Settings({params}: {params:Promise<{tenantId:string}>}) {
  const {tenantId}=await params;
  const {tenant,role,user}=await getWorkspace(tenantId);
  let ownerSetup: OwnerOnboardingSnapshot | null = null;
  let safeUnavailable = false;
  if (canManageSettings(role)) {
    const setup = await getOnboardingSnapshot(tenantId);
    if (setup.status === 'available' && ownerSnapshot(setup.snapshot)) ownerSetup = setup.snapshot;
    else safeUnavailable = true;
  }
  return <><div className="page-heading"><span className="eyebrow">WORKSPACE SETTINGS</span><h1>The details behind your business.</h1><p>Keep your shared workspace information up to date.</p></div><section className="panel settings-panel"><h2>Business profile</h2>{canManageSettings(role) ? ownerSetup ? <SettingsForm tenantId={tenant.id} revision={ownerSetup.config_revision} values={{ name: ownerSetup.workspace.name, trade: ownerSetup.workspace.trade, timezone: ownerSetup.workspace.timezone, business_contact_name: ownerSetup.profile?.business_contact_name ?? '', business_email: ownerSetup.profile?.business_email ?? null, business_phone: ownerSetup.profile?.business_phone ?? null }}/> : safeUnavailable ? <SettingsUnavailable tenant={tenant}/> : <SettingsDetails tenant={tenant}/> : <ReadOnlySettings tenant={tenant} role={role}/>}</section><AccountSettings email={user.email}/></>;
}
