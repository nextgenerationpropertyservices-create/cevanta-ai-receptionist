import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const harness = vi.hoisted(() => ({ workspace: vi.fn() }));
vi.mock('@/lib/server/queries', () => ({ getWorkspace: harness.workspace }));

import PilotRunbook from '@/app/workspaces/[tenantId]/pilot/page';

const tenant = '11111111-1111-4111-8111-111111111111';

beforeEach(() => {
  harness.workspace.mockResolvedValue({ tenant: { id: tenant, name: 'Fictional HVAC', trade: 'HVAC', timezone: 'America/New_York' }, role: 'owner' });
});

async function html() {
  return renderToStaticMarkup(await PilotRunbook({ params: Promise.resolve({ tenantId: tenant }) }));
}

describe('pilot runbook page', () => {
  it('shows managed-pilot operating rules and stop rules', async () => {
    const output = await html();
    expect(output).toContain('PILOT RUNBOOK');
    expect(output).toContain('Run the first client safely.');
    expect(output).toContain('Before the first live call');
    expect(output).toContain('After each AI lead');
    expect(output).toContain('STOP RULES');
    expect(output).toContain('The AI promises a confirmed appointment without verified office approval.');
    expect(output).toContain('external sends, automatic booking, provider writes and production deployment stay off');
  });

  it('links to the workspace pilot tools', async () => {
    const output = await html();
    expect(output).toContain(`/workspaces/${tenant}/launch`);
    expect(output).toContain(`/workspaces/${tenant}/onboarding`);
    expect(output).toContain(`/workspaces/${tenant}/integrations`);
    expect(output).toContain(`/workspaces/${tenant}/leads`);
    expect(output).toContain(`/workspaces/${tenant}/jobs`);
    expect(output).toContain(`/workspaces/${tenant}/calendar`);
  });
});
