import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AUTOMATION_CONTROL_DEFINITIONS, defaultAutomationControl } from '@/lib/automation-controls';

const harness = vi.hoisted(() => ({ workspace: vi.fn(), automationControls: vi.fn() }));
vi.mock('@/lib/server/queries', () => ({ getWorkspace: harness.workspace }));
vi.mock('@/lib/server/automation-control-queries', () => ({ getAutomationControls: harness.automationControls }));

import IntegrationsReadiness from '@/app/workspaces/[tenantId]/integrations/page';

const tenant = '11111111-1111-4111-8111-111111111111';

beforeEach(() => {
  harness.workspace.mockResolvedValue({ tenant: { id: tenant, name: 'Fictional HVAC', trade: 'HVAC', timezone: 'America/New_York' }, role: 'owner' });
  harness.automationControls.mockResolvedValue({
    ready: true,
    canManage: true,
    controls: AUTOMATION_CONTROL_DEFINITIONS.map(definition => defaultAutomationControl(tenant, definition)),
  });
});

async function html() {
  return renderToStaticMarkup(await IntegrationsReadiness({ params: Promise.resolve({ tenantId: tenant }) }));
}

describe('integrations readiness page', () => {
  it('shows provider readiness and client-specific optional automation gates', async () => {
    const output = await html();
    expect(output).toContain('Safe integration posture');
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
    expect(output).toContain('These controls store decisions and readiness.');
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


