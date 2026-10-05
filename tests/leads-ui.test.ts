import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const harness = vi.hoisted(() => ({
  workspace: vi.fn(), leads: vi.fn(), customers: vi.fn(), createLead: vi.fn(),
}));
vi.mock('@/lib/server/queries', () => ({ getWorkspace: harness.workspace, getCustomers: harness.customers }));
vi.mock('@/lib/server/intake-queries', () => ({ getLeads: harness.leads }));
vi.mock('@/app/actions/intake', () => ({ createLead: harness.createLead }));

import Leads from '@/app/workspaces/[tenantId]/leads/page';

const tenant = '11111111-1111-4111-8111-111111111111';
const aiLead = {
  id: '22222222-2222-4222-8222-222222222222', tenant_id: tenant, submission_id: '33333333-3333-4333-8333-333333333333', customer_id: null,
  name: 'Fictional AI Caller', email: 'caller@example.invalid', phone: '+15550000009',
  description: 'AI receptionist call for office review. Service: no cooling. Summary: fictional dry run.',
  priority: 'high', status: 'new', follow_up_date: null, created_at: '2026-10-05T13:00:00.000Z', updated_at: '2026-10-05T13:00:00.000Z',
};
const manualLead = { ...aiLead, id: '44444444-4444-4444-8444-444444444444', name: 'Manual Lead', description: 'Manual office request', priority: 'normal' };

beforeEach(() => {
  harness.workspace.mockResolvedValue({ tenant: { id: tenant, name: 'Fictional HVAC', trade: 'HVAC', timezone: 'America/New_York' }, role: 'viewer' });
  harness.customers.mockResolvedValue([]);
  harness.leads.mockResolvedValue({ ready: true, leads: [] });
});

async function html(leads = [aiLead]) {
  harness.leads.mockResolvedValue({ ready: true, leads });
  return renderToStaticMarkup(await Leads({ params: Promise.resolve({ tenantId: tenant }) }));
}

describe('lead inbox AI receptionist notifications', () => {
  it('shows a prominent review notice for new AI receptionist leads', async () => {
    const output = await html([aiLead, manualLead]);
    expect(output).toContain('New AI receptionist lead waiting');
    expect(output).toContain('1 new AI receptionist lead needs office review');
    expect(output).toContain('including 1 high-priority request');
    expect(output).toContain('Review newest AI lead');
    expect(output).toContain(`/workspaces/${tenant}/leads/${aiLead.id}`);
    expect(output).toContain('NEW AI LEAD');
    expect(output).toContain('AI receptionist');
  });
  it('does not show the AI notification for manual or already-contacted leads', async () => {
    const output = await html([manualLead, { ...aiLead, id: '55555555-5555-4555-8555-555555555555', status: 'contacted' }]);
    expect(output).not.toContain('New AI receptionist lead');
    expect(output).not.toContain('NEW AI LEAD');
    expect(output).toContain('Manual');
  });
});
