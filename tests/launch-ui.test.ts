import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const harness = vi.hoisted(() => ({ workspace: vi.fn(), onboarding: vi.fn(), automation: vi.fn() }));
vi.mock('@/lib/server/queries', () => ({ getWorkspace: harness.workspace }));
vi.mock('@/lib/server/onboarding-rpc', () => ({ getOnboardingSnapshot: harness.onboarding }));
vi.mock('@/lib/server/automation-control-queries', () => ({ getAutomationControls: harness.automation }));

import { AUTOMATION_CONTROL_DEFINITIONS, defaultAutomationControl } from '@/lib/automation-controls';
import LaunchReadiness from '@/app/workspaces/[tenantId]/launch/page';

const tenant = '11111111-1111-4111-8111-111111111111';

beforeEach(() => {
  vi.clearAllMocks();
  harness.workspace.mockResolvedValue({ tenant: { id: tenant, name: 'Fictional HVAC', trade: 'HVAC', timezone: 'America/New_York' }, role: 'owner' });
  harness.automation.mockResolvedValue({ ready: true, canManage: true, controls: AUTOMATION_CONTROL_DEFINITIONS.map(definition => defaultAutomationControl(tenant, definition)) });
  harness.onboarding.mockResolvedValue({
    status: 'available',
    snapshot: {
      projection: 'owner_setup',
      workspace: { id: tenant, name: 'Fictional HVAC', trade: 'HVAC', timezone: 'America/New_York' },
      flow_version: 'onboarding-v1',
      config_revision: 1,
      profile: { business_contact_name: 'Fictional Owner', business_email: 'owner@example.invalid', business_phone: null },
      services: [{ id: '22222222-2222-4222-8222-222222222222', name: 'No cooling', description: 'Fictional service', enabled: true, position: 0, version: 1 }],
      weekly_hours: [{ weekday: 1, closed: false, intervals: [{ start_minute: 480, end_minute: 1020 }] }],
      exceptions: [],
      booking: { mode: 'request_only', lead_time_minutes: null, buffer_before_minutes: null, buffer_after_minutes: null, horizon_days: null, notes: 'Office review only. Never promise confirmed appointments.', acknowledged: true },
      escalation: [{ id: '33333333-3333-4333-8333-333333333333', label: 'Office', contact_name: 'Fictional Dispatcher', email: 'dispatch@example.invalid', phone: null, enabled: true, position: 0, version: 1 }],
      resume_step: 'review',
      resume_version: 1,
      readiness: { configuration_state: 'not_evaluated', manual_workspace_state: 'not_evaluated', reason: 'setup_policy_pending', next_action: 'platform_operator', booking_state: 'blocked', release_state: 'not_evaluated', hostedReady: false, providerConnectionAuthorized: false },
    },
  });
});

async function html() {
  return renderToStaticMarkup(await LaunchReadiness({ params: Promise.resolve({ tenantId: tenant }) }));
}

describe('launch readiness page', () => {
  it('shows the controlled self-service client path and shared onboarding boundaries', async () => {
    const output = await html();
    expect(output).toContain('PROVISIONING READINESS');
    expect(output).toContain('Client go-live checklist');
    expect(output).toContain('Client setup data');
    expect(output).toContain('Trusted tenant route');
    expect(output).toContain('Test call and recovery proof');
    expect(output).toContain('Preparation only: no Retell publishing');
    expect(output).toContain('SELF-SERVICE CLIENT PATH');
    expect(output).toContain('Use one controlled path for every client');
    expect(output).toContain('HVAC and mechanical service');
    expect(output).toContain('Account and workspace');
    expect(output).toContain('Industry template');
    expect(output).toContain('Secure connections');
    expect(output).toContain('Receptionist review');
    expect(output).toContain('Activation approval');
    expect(output).toContain('MAKE / RETELL / CEVANTA BOUNDARY');
    expect(output).toContain('Use one reusable Make intake workflow');
    expect(output).toContain('trusted server-side mapping');
    expect(output).toContain('received, pending, failed, and delivered');
    expect(output).toContain('Office review first');
    expect(output).toContain('does not expose webhook URLs, API keys, provider secrets');
    expect(output).not.toMatch(/booking confirmed|payment collected|dispatch confirmed|sk_live_|Bearer /i);
  });
});

