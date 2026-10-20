import { beforeEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({
  membership: vi.fn(),
  configured: vi.fn(),
  rpc: vi.fn(),
  rpcCalls: [] as unknown[][],
}));

vi.mock('@/lib/server/authorization', () => ({ requireMembership: harness.membership }));
vi.mock('@/lib/supabase/config', () => ({ isSupabaseConfigured: harness.configured }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: () => ({
    rpc: (name: string, args: unknown) => {
      harness.rpcCalls.push([name, args]);
      return harness.rpc();
    },
  }),
}));

import { pauseRetellAgentMapping } from '@/app/actions/retell-provisioning';

const tenant = '11111111-1111-4111-8111-111111111111';

beforeEach(() => {
  vi.clearAllMocks();
  harness.rpcCalls.length = 0;
  harness.membership.mockResolvedValue({ role: 'owner', user: { id: 'user' } });
  harness.configured.mockReturnValue(true);
  harness.rpc.mockResolvedValue({ data: { status: 'paused' }, error: null });
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
    expect(harness.rpcCalls).toEqual([
      ['retell_mapping_pause', { p_tenant_id: tenant, p_connection_id: '22222222-2222-4222-8222-222222222222' }],
    ]);
  });

  it('fails before any provider mapping query when authorization fails', async () => {
    const failure = new Error('REDIRECT:/sign-in');
    harness.membership.mockRejectedValueOnce(failure);
    await expect(pauseRetellAgentMapping(tenant)).rejects.toBe(failure);
    expect(harness.rpcCalls).toEqual([]);
  });

  it('reports missing server configuration without touching the database', async () => {
    harness.configured.mockReturnValue(false);
    await expect(pauseRetellAgentMapping(tenant)).resolves.toEqual({ status: 'not_configured' });
    expect(harness.rpcCalls).toEqual([]);
  });
});
