import { beforeEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({
  membership: vi.fn(),
  configured: vi.fn(),
  update: vi.fn(),
  select: vi.fn(),
  updateCalls: [] as unknown[],
  eqCalls: [] as unknown[][],
}));

vi.mock('@/lib/server/authorization', () => ({ requireMembership: harness.membership }));
vi.mock('@/lib/supabase/config', () => ({ isSupabaseConfigured: harness.configured }));
vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: () => ({
    schema: () => ({
      from: () => ({
        update: (value: unknown) => {
          harness.updateCalls.push(value);
          return {
            eq: (...values: unknown[]) => {
              harness.eqCalls.push(values);
              return {
                eq: (...next: unknown[]) => {
                  harness.eqCalls.push(next);
                  return {
                    eq: (...last: unknown[]) => {
                      harness.eqCalls.push(last);
                      return { select: harness.select };
                    },
                  };
                },
              };
            },
          };
        },
      }),
    }),
  }),
}));

import { pauseRetellAgentMapping } from '@/app/actions/retell-provisioning';

const tenant = '11111111-1111-4111-8111-111111111111';

beforeEach(() => {
  vi.clearAllMocks();
  harness.updateCalls.length = 0;
  harness.eqCalls.length = 0;
  harness.membership.mockResolvedValue({ role: 'owner', user: { id: 'user' } });
  harness.configured.mockReturnValue(true);
  harness.select.mockResolvedValue({ data: [{ provider_account_id: 'agent_fictional' }], error: null });
  process.env.MAKE_RETELL_INGRESS_CONNECTION_ID = '22222222-2222-4222-8222-222222222222';
});

describe('Retell provisioning boundaries', () => {
  it('documents the server-side mapping contract', () => {
    expect('agent_Example_123').toMatch(/^agent_[A-Za-z0-9_-]{1,128}$/);
    expect('https://example.test/webhook').not.toMatch(/^agent_[A-Za-z0-9_-]{1,128}$/);
    expect('sk-secret').not.toMatch(/^agent_[A-Za-z0-9_-]{1,128}$/);
  });

  it('pauses only enabled mappings for the authorized tenant and connection', async () => {
    await expect(pauseRetellAgentMapping(tenant)).resolves.toEqual({ status: 'paused' });
    expect(harness.membership).toHaveBeenCalledWith(tenant, ['owner', 'admin']);
    expect(harness.updateCalls).toEqual([{ enabled: false }]);
    expect(harness.eqCalls).toEqual([
      ['tenant_id', tenant],
      ['connection_id', '22222222-2222-4222-8222-222222222222'],
      ['enabled', true],
    ]);
  });

  it('fails before any provider mapping query when authorization fails', async () => {
    const failure = new Error('REDIRECT:/sign-in');
    harness.membership.mockRejectedValueOnce(failure);
    await expect(pauseRetellAgentMapping(tenant)).rejects.toBe(failure);
    expect(harness.updateCalls).toEqual([]);
    expect(harness.select).not.toHaveBeenCalled();
  });

  it('reports missing server configuration without touching the database', async () => {
    harness.configured.mockReturnValue(false);
    await expect(pauseRetellAgentMapping(tenant)).resolves.toEqual({ status: 'not_configured' });
    expect(harness.updateCalls).toEqual([]);
  });
});
