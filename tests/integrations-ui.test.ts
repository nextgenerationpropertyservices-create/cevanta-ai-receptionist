import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const harness = vi.hoisted(() => ({ workspace: vi.fn() }));
vi.mock('@/lib/server/queries', () => ({ getWorkspace: harness.workspace }));

import IntegrationsReadiness from '@/app/workspaces/[tenantId]/integrations/page';

const tenant = '11111111-1111-4111-8111-111111111111';

beforeEach(() => {
  harness.workspace.mockResolvedValue({ tenant: { id: tenant, name: 'Fictional HVAC', trade: 'HVAC', timezone: 'America/New_York' }, role: 'owner' });
});

async function html() {
  return renderToStaticMarkup(await IntegrationsReadiness({ params: Promise.resolve({ tenantId: tenant }) }));
}

describe('integrations readiness page', () => {
  it('shows provider readiness without enabling live side effects', async () => {
    const output = await html();
    expect(output).toContain('Safe integration posture');
    expect(output).toContain('Retell voice agent');
    expect(output).toContain('Phone answering tested');
    expect(output).toContain('Make intake scenario');
    expect(output).toContain('Safe receiver tested');
    expect(output).toContain('Twilio and SMS');
    expect(output).toContain('Deferred');
    expect(output).toContain('Provider writes');
    expect(output).toContain('Off');
    expect(output).toContain('Do not enable SMS, email, calendar writers, always-on Make activation or production deploys without explicit approval.');
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
