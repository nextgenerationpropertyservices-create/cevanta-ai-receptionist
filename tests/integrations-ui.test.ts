import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AUTOMATION_CONTROL_DEFINITIONS, defaultAutomationControl } from '@/lib/automation-controls';

const harness = vi.hoisted(() => ({ workspace: vi.fn(), automationControls: vi.fn(), retellHealth: vi.fn() }));
vi.mock('@/lib/server/queries', () => ({ getWorkspace: harness.workspace }));
vi.mock('@/lib/server/automation-control-queries', () => ({ getAutomationControls: harness.automationControls }));
vi.mock('@/app/actions/retell-provisioning', () => ({ getRetellAgentMappingHealth: harness.retellHealth, registerRetellAgentMapping: vi.fn(), pauseRetellAgentMapping: vi.fn() }));

import IntegrationsReadiness from '@/app/workspaces/[tenantId]/integrations/page';

const tenant = '11111111-1111-4111-8111-111111111111';

beforeEach(() => {
  harness.workspace.mockResolvedValue({ tenant: { id: tenant, name: 'Fictional HVAC', trade: 'HVAC', timezone: 'America/New_York' }, role: 'owner' });
  harness.automationControls.mockResolvedValue({
    ready: true,
    canManage: true,
    controls: AUTOMATION_CONTROL_DEFINITIONS.map(definition => defaultAutomationControl(tenant, definition)),
  });
  harness.retellHealth.mockResolvedValue({ status: 'not_mapped' });
});

async function html() {
  return renderToStaticMarkup(await IntegrationsReadiness({ params: Promise.resolve({ tenantId: tenant }) }));
}

describe('integrations readiness page', () => {
  it('shows provider readiness and client-specific optional automation gates', async () => {
    const output = await html();
    expect(output).toContain('Safe integration posture');
    expect(output).toContain('MAKE HANDOFF');
    expect(output).toContain('Reuse one safe scenario pattern for every client');
    expect(output).toContain('1. Receive');
    expect(output).toContain('2. Map');
    expect(output).toContain('3. Act');
    expect(output).toContain('4. Prove');
    expect(output).toContain('prevent duplicates');
    expect(output).toContain('QUICK SETUP');
    expect(output).toContain('OWNER QUICK PATH');
    expect(output).toContain('AUTOMATED AFTER SAVE');
    expect(output).toContain('Setup tracking');
    expect(output).toContain('Manual approval');
    expect(output).toContain('Your simplest setup order');
    expect(output).toContain('Create the client workspace');
    expect(output).toContain('Send private access');
    expect(output).toContain('Connect and test Retell');
    expect(output).toContain('Choose one simple client feature to prepare');
    expect(output).toContain('Open email setup ↗');
    expect(output).toContain('Open SMS setup ↗');
    expect(output).toContain('Open booking setup ↗');
    expect(output).toContain('id="automation-email"');
    expect(output).toContain('id="automation-sms"');
    expect(output).toContain('id="automation-automatic_booking"');
    expect(output).toContain('Retell voice agent');
    expect(output).toContain('Phone answering tested');
    expect(output).toContain('Make intake scenario');
    expect(output).toContain('Safe receiver tested');
    expect(output).toContain('Twilio and SMS');
    expect(output).toContain('Optional controlled write');
    expect(output).toContain('Provider writes');
    expect(output).toContain('Optional');
    expect(output).toContain('High-risk actions');
    expect(output).toContain('Gated');
    expect(output).toContain('SMS follow-up');
    expect(output).toContain('Email follow-up');
    expect(output).toContain('External calendar writes');
    expect(output).toContain('Automatic booking');
    expect(output).toContain('Payment collection');
    expect(output).toContain('Subscription billing');
    expect(output).toContain('Dispatch automation');
    expect(output).toContain('Owner approved after reviewing scope, risk, and provider requirements');
    expect(output).toContain('Open Go Live to see the complete setup, test, approval and rollback path');
    expect(output).toContain(`/workspaces/${tenant}/go-live`);
    expect(output).toContain('Pause Retell routing');
    expect(output).toContain('does not delete the Retell agent, change phone routing, or revoke the API key');
    expect(output).toContain('Route status:');
    expect(output).toContain('Not mapped');
    expect(output).toContain('Connect this client’s receptionist');
    expect(output).toContain('Assign the client phone number in Retell');
    expect(output).toContain('Connect receptionist');
    expect(output).toContain('Make one fictional test call');
    expect(output).toContain('Make webhook is already configured once on the server');
  });

  it('shows catalog-only messaging for non-manager roles', async () => {
    harness.workspace.mockResolvedValueOnce({ tenant: { id: tenant, name: 'Fictional HVAC', trade: 'HVAC', timezone: 'America/New_York' }, role: 'dispatcher' });
    harness.automationControls.mockResolvedValueOnce({
      ready: true,
      canManage: false,
      controls: AUTOMATION_CONTROL_DEFINITIONS.map(definition => defaultAutomationControl(tenant, definition)),
    });
    const output = await html();
    expect(output).toContain('automation catalog only');
    expect(output).toContain('Status restricted');
    expect(output).not.toContain('Shown to client');
    expect(output).not.toContain('Not approved');
  });

  it('links to the workspace launch and setup paths', async () => {
    const output = await html();
    expect(output).toContain(`/workspaces/${tenant}/launch`);
    expect(output).toContain(`/workspaces/${tenant}/onboarding`);
    expect(output).toContain(`/workspaces/${tenant}/leads`);
    expect(output).toContain(`/workspaces/${tenant}/calendar`);
    expect(output).toContain(`/workspaces/${tenant}/settings`);
  });
});
