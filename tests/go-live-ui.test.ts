import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AUTOMATION_CONTROL_DEFINITIONS, defaultAutomationControl } from '@/lib/automation-controls';

const harness = vi.hoisted(() => ({ workspace: vi.fn(), automationControls: vi.fn() }));
vi.mock('@/lib/server/queries', () => ({ getWorkspace: harness.workspace }));
vi.mock('@/lib/server/automation-control-queries', () => ({ getAutomationControls: harness.automationControls }));

import GoLiveCenter from '@/app/workspaces/[tenantId]/go-live/page';

const tenant = '11111111-1111-4111-8111-111111111111';

beforeEach(() => {
  harness.workspace.mockResolvedValue({ tenant: { id: tenant, name: 'Fictional HVAC', trade: 'HVAC', timezone: 'America/New_York', account_type: 'client' }, role: 'owner' });
  harness.automationControls.mockResolvedValue({
    ready: true,
    canManage: true,
    controls: AUTOMATION_CONTROL_DEFINITIONS.map(definition => defaultAutomationControl(tenant, definition)),
  });
});

async function html() {
  return renderToStaticMarkup(await GoLiveCenter({ params: Promise.resolve({ tenantId: tenant }) }));
}

describe('go live activation center', () => {
  it('shows every full-app live feature as off-by-default setup tracks', async () => {
    const output = await html();
    expect(output).toContain('GO LIVE');
    expect(output).toContain('Prepare live booking, messages, billing, and dispatch without turning them on early.');
    expect(output).toContain('Off by default');
    expect(output).toContain('SMS follow-up');
    expect(output).toContain('Email follow-up');
    expect(output).toContain('External calendar writes');
    expect(output).toContain('Live booking');
    expect(output).toContain('Payment collection');
    expect(output).toContain('Subscription billing');
    expect(output).toContain('Dispatch automation');
    expect(output).toContain('Blocked / off');
    expect(output).toContain('feature requested, owner approval, provider/setup notes, test evidence, rollback plan');
    expect(output).toContain('Recommended live rollout sequence');
  });

  it('states that the page does not perform live customer-impacting actions', async () => {
    const output = await html();
    expect(output).toContain('it does not send customer messages, write outside calendars, confirm bookings, collect payments, create subscriptions, or dispatch technicians');
    expect(output).toContain('No SMS or email is sent from this page.');
    expect(output).toContain('No external calendar event is written from this page.');
    expect(output).toContain('No appointment is confirmed from this page.');
    expect(output).toContain('No payment, card collection, or subscription is created from this page.');
    expect(output).toContain('No technician is dispatched from this page.');
    expect(output).not.toMatch(/sk_live_|Bearer |api key|webhook URL|card number|cvv/i);
  });

  it('links to setup, technicians, calendar, billing, manual and controls', async () => {
    const output = await html();
    for (const path of ['/integrations', '/launch', '/onboarding', '/technicians', '/calendar', '/billing', '/manual']) {
      expect(output).toContain(`/workspaces/${tenant}${path}`);
    }
  });
});
