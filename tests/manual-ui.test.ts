import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const harness = vi.hoisted(() => ({ workspace: vi.fn() }));
vi.mock('@/lib/server/queries', () => ({ getWorkspace: harness.workspace }));

import OwnerManual from '@/app/workspaces/[tenantId]/manual/page';

const tenant = '11111111-1111-4111-8111-111111111111';

beforeEach(() => {
  harness.workspace.mockResolvedValue({ tenant: { id: tenant, name: 'Fictional HVAC', trade: 'HVAC', timezone: 'America/New_York', account_type: 'client' }, role: 'owner' });
});

async function html() {
  return renderToStaticMarkup(await OwnerManual({ params: Promise.resolve({ tenantId: tenant }) }));
}

describe('dashboard operating manual', () => {
  it('explains daily operation and safe AI receptionist boundaries', async () => {
    const output = await html();
    expect(output).toContain('DASHBOARD OPERATING MANUAL');
    expect(output).toContain('How to run Fictional HVAC inside Cevanta.');
    expect(output).toContain('The daily office routine');
    expect(output).toContain('What each dashboard section is for');
    expect(output).toContain('AI RECEPTIONIST BOUNDARIES');
    expect(output).toContain('STOP RULES');
    expect(output).toContain('This page does not turn on SMS, email, external calendar writes, automatic booking, payments, or dispatch automation.');
    expect(output).not.toMatch(/service-role|secret|webhook|api key|private key/i);
  });

  it('links to every major workspace section for the owner', async () => {
    const output = await html();
    for (const path of ['', '/notifications', '/leads', '/jobs', '/technicians', '/calendar', '/onboarding', '/launch', '/billing', '/integrations']) {
      expect(output).toContain(`/workspaces/${tenant}${path}`);
    }
  });
});
