import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { OnboardingSnapshotResult, OwnerOnboardingSnapshot } from '@/lib/onboarding-contracts';
import { PENDING_ONBOARDING_READINESS } from '@/lib/onboarding-contracts';

const harness = vi.hoisted(() => ({ workspace: vi.fn(), snapshot: vi.fn(), save: vi.fn(), refresh: vi.fn() }));
vi.mock('@/lib/server/queries', () => ({ getWorkspace: harness.workspace }));
vi.mock('@/lib/server/onboarding-rpc', () => ({ getOnboardingSnapshot: harness.snapshot }));
vi.mock('@/app/actions/onboarding-settings', () => ({ saveOnboardingSettings: harness.save }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: harness.refresh }) }));
import Page from '@/app/workspaces/[tenantId]/settings/page';
import { SettingsForm, settingsFeedback, submitSettings } from '@/app/workspaces/[tenantId]/settings/settings-form';

const tenant = '10000000-0000-4000-8000-000000000001';
const values = { name: 'Fictional Service', trade: 'HVAC', timezone: 'America/New_York', business_contact_name: 'Fictional Operator', business_email: 'fictional@example.invalid', business_phone: '+15550101000' };
const owner: OwnerOnboardingSnapshot = { projection: 'owner_setup', workspace: { id: tenant, name: values.name, trade: values.trade, timezone: values.timezone }, flow_version: 'onboarding-v1', config_revision: 7, profile: { business_contact_name: values.business_contact_name, business_email: values.business_email, business_phone: values.business_phone }, services: [], weekly_hours: [], exceptions: [], booking: null, escalation: [], resume_step: 'profile', resume_version: 0, readiness: PENDING_ONBOARDING_READINESS };

async function render(role = 'owner', result: OnboardingSnapshotResult = { status: 'available', snapshot: owner }) {
  harness.workspace.mockResolvedValue({ tenant: { id: tenant, name: values.name, trade: values.trade, timezone: values.timezone, created_at: '', updated_at: '' }, role });
  harness.snapshot.mockResolvedValue(result);
  return renderToStaticMarkup(await Page({ params: Promise.resolve({ tenantId: tenant }) }));
}

beforeEach(() => { vi.clearAllMocks(); });

describe('settings onboarding action wiring', () => {
  it.each(['owner', 'admin'] as const)('renders %s settings from the reviewed owner/admin snapshot', async role => {
    const html = await render(role);
    expect(harness.snapshot).toHaveBeenCalledWith(tenant);
    expect(html).toContain('Save settings');
    expect(html).toContain('Fictional Service');
    expect(html).toContain('America/New_York');
    expect(html).toContain('keeps your existing business contact details');
    expect(html).not.toMatch(/updateTenantSettings|request_id|expected_config_revision|config_revision|receipt|token|business_email|fictional@example.invalid/);
  });

  it('submits the accepted action shape while preserving existing contact fields', async () => {
    harness.save.mockResolvedValue({ result: { status: 'retryable_failure' }, message: 'Retry with the same request.', refreshRequired: false });
    const input = { tenant_id: tenant, request_id: '20000000-0000-4000-8000-000000000001', expected_config_revision: 7, payload: { ...values, name: ' Updated Fictional Service ' } };
    await submitSettings(input);
    expect(harness.save).toHaveBeenCalledWith({ ...input, payload: { ...values, name: 'Updated Fictional Service' } });
  });

  it('keeps limited roles read-only without loading owner snapshot details', async () => {
    const html = await render('dispatcher');
    expect(harness.snapshot).not.toHaveBeenCalled();
    expect(html).toContain('Your dispatcher access is read-only');
    expect(html).toContain('Fictional Service');
    expect(html).not.toMatch(/<form|Save settings|business_email|fictional@example.invalid/);
  });

  it('shows a safe unavailable state instead of the legacy writer when owner/admin snapshot is unavailable', async () => {
    const html = await render('owner', { status: 'unavailable' });
    expect(html).toContain('Settings cannot safely save right now');
    expect(html).toContain('Try again');
    expect(html).not.toMatch(/<form|Save settings|updateTenantSettings/);
  });

  it('uses safe conflict and retryable copy without false readiness', () => {
    expect(settingsFeedback({ status: 'conflict', reason: 'revision' })).toContain('Your typed values are still shown');
    expect(settingsFeedback({ status: 'retryable_failure' })).toContain('Retry this same save');
    expect(settingsFeedback({ status: 'saved', entity: 'setup', id: tenant, version: 1, config_revision: 8 })).toContain('providers, live booking and production release remain pending');
    expect(settingsFeedback({ status: 'unavailable' })).toContain('Refresh and review');
    expect(settingsFeedback({ status: 'saved', entity: 'setup', id: tenant, version: 1, config_revision: 8 })).not.toMatch(/Ready to launch|Provider connected|Production ready|Live booking enabled|100%/i);
  });

  it('does not render internal fields from form props', () => {
    const html = renderToStaticMarkup(createElement(SettingsForm, { tenantId: tenant, revision: 7, values }));
    expect(html).toContain('Business name');
    expect(html).not.toMatch(/request_id|expected_config_revision|config_revision|receipt|token|business_contact_name|business_email|business_phone|fictional@example.invalid|\+15550101000/);
  });

  it('does not import or use the legacy settings writer in the owned settings UI files', async () => {
    const pageModule = await import('@/app/workspaces/[tenantId]/settings/page');
    const formModule = await import('@/app/workspaces/[tenantId]/settings/settings-form');
    expect(JSON.stringify(Object.keys(pageModule))).not.toContain('updateTenantSettings');
    expect(JSON.stringify(Object.keys(formModule))).not.toContain('updateTenantSettings');
  });
});
