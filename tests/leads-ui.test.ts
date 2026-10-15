import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Lead } from '@/lib/intake-contracts';

const harness = vi.hoisted(() => ({
  workspace: vi.fn(), leads: vi.fn(), customers: vi.fn(), createLead: vi.fn(),
}));
vi.mock('@/lib/server/queries', () => ({ getWorkspace: harness.workspace, getCustomers: harness.customers }));
vi.mock('@/lib/server/intake-queries', () => ({ getLeads: harness.leads }));
vi.mock('@/app/actions/intake', () => ({ createLead: harness.createLead }));

import Leads from '@/app/workspaces/[tenantId]/leads/page';

const tenant = '11111111-1111-4111-8111-111111111111';
const aiLead: Lead = {
  id: '22222222-2222-4222-8222-222222222222', tenant_id: tenant, submission_id: '33333333-3333-4333-8333-333333333333', customer_id: null,
  name: 'Fictional AI Caller', email: 'caller@example.invalid', phone: '+15550000009',
  description: 'AI receptionist call for office review. Service: no cooling. Summary: fictional dry run.',
  priority: 'high', status: 'new', follow_up_date: null, created_at: '2026-10-05T13:00:00.000Z', updated_at: '2026-10-05T13:00:00.000Z',
};
const manualLead: Lead = { ...aiLead, id: '44444444-4444-4444-8444-444444444444', name: 'Manual Lead', description: 'Manual office request', priority: 'normal' };

beforeEach(() => {
  harness.workspace.mockResolvedValue({ tenant: { id: tenant, name: 'Fictional HVAC', trade: 'HVAC', timezone: 'America/New_York' }, role: 'viewer' });
  harness.customers.mockResolvedValue([]);
  harness.leads.mockResolvedValue({ ready: true, leads: [] });
});

async function html(leads: Lead[] = [aiLead], filters: {view?: string; q?: string; status?: string; priority?: string; source?: string; date?: string} = {}) {
  harness.leads.mockResolvedValue({ ready: true, leads });
  return renderToStaticMarkup(await Leads({ params: Promise.resolve({ tenantId: tenant }), searchParams: Promise.resolve(filters) }));
}

describe('lead inbox AI receptionist notifications', () => {
  it('shows useful service details for new AI receptionist leads without duplicating the global alert', async () => {
    const output = await html([aiLead, manualLead]);
    expect(output).not.toContain('New AI receptionist lead waiting');
    expect(output).toContain(`/workspaces/${tenant}/leads/${aiLead.id}`);
    expect(output).toContain('NEW AI LEAD');
    expect(output).toContain('AI receptionist');
    expect(output).toContain('fictional dry run.');
  });
  it('does not show the AI notification for manual or already-contacted leads', async () => {
    const output = await html([manualLead, { ...aiLead, id: '55555555-5555-4555-8555-555555555555', status: 'contacted' }]);
    expect(output).not.toContain('New AI receptionist lead');
    expect(output).not.toContain('NEW AI LEAD');
    expect(output).toContain('Manual');
  });
  it('filters the inbox by source and reports the visible count', async () => {
    const output = await html([aiLead, manualLead], { view: 'all', source: 'manual' });
    expect(output).toContain('1 of 2 enquiries shown');
    expect(output).toContain('Manual Lead');
    expect(output).not.toContain('Fictional AI Caller');
  });
  it('starts with an attention queue and exposes focused lead views', async () => {
    const output = await html([aiLead, manualLead, { ...aiLead, id: '66666666-6666-4666-8666-666666666666', status: 'closed', priority: 'normal' }]);
    expect(output).toContain('Needs attention');
    expect(output).toContain('All leads');
    expect(output).toContain('name="q"');
    expect(output).toContain('2 of 2 enquiries shown');
    expect(output).not.toContain('66666666-6666-4666-8666-666666666666');
  });
  it('searches contact and service details within a selected view', async () => {
    const output = await html([aiLead, manualLead], { view: 'all', q: 'manual office' });
    expect(output).toContain('Manual Lead');
    expect(output).not.toContain('Fictional AI Caller');
  });
  it('exposes and applies a follow-up date filter', async () => {
    const output = await html([
      { ...aiLead, follow_up_date: new Date().toISOString().slice(0, 10) },
      { ...manualLead, follow_up_date: null },
    ], { view: 'all', date: 'none' });
    expect(output).toContain('Follow-up date');
    expect(output).toContain('1 of 2 enquiries shown');
    expect(output).toContain('Manual Lead');
    expect(output).not.toContain('Fictional AI Caller');
  });
});
