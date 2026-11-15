import { beforeEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({
  requireUser: vi.fn(),
  configured: vi.fn(),
  rpc: vi.fn(),
  plan: 'managed_receptionist' as string | null,
  rpcCalls: [] as unknown[][],
}));

vi.mock('@/lib/server/authorization', () => ({ requireUser: harness.requireUser }));
vi.mock('@/lib/supabase/config', () => ({ isSupabaseConfigured: harness.configured }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import {
  getRetellAgentMappingHealth,
  pauseRetellAgentMapping,
  registerRetellAgentMapping,
} from '@/app/actions/retell-provisioning';

const tenant = '11111111-1111-4111-8111-111111111111';
const connection = '22222222-2222-4222-8222-222222222222';
const agent = 'agent_FictionalClient_123';

beforeEach(() => {
  vi.clearAllMocks();
  harness.rpcCalls.length = 0;
  harness.requireUser.mockResolvedValue({
    user: { id: 'fictional-user' },
    client: {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: { plan: harness.plan }, error: null }),
          }),
        }),
      }),
      rpc: (name: string, args: unknown) => {
        harness.rpcCalls.push([name, args]);
        return harness.rpc();
      },
    },
  });
  harness.configured.mockReturnValue(true);
  harness.plan = 'managed_receptionist';
  harness.rpc.mockResolvedValue({ data: { status: 'mapped' }, error: null });
  process.env.MAKE_RETELL_INGRESS_CONNECTION_ID = connection;
});

describe('Retell provisioning boundaries', () => {
  it('documents the server-side mapping contract', () => {
    expect('agent_Example_123').toMatch(/^agent_[A-Za-z0-9_-]{1,128}$/);
    expect('https://example.test/webhook').not.toMatch(/^agent_[A-Za-z0-9_-]{1,128}$/);
    expect('sk-secret').not.toMatch(/^agent_[A-Za-z0-9_-]{1,128}$/);
  });

  it('uses the authenticated session RPC and returns no provider identifier after mapping', async () => {
    await expect(registerRetellAgentMapping(tenant, agent)).resolves.toEqual({ status: 'mapped' });
    expect(harness.requireUser).toHaveBeenCalledTimes(1);
    expect(harness.rpcCalls).toEqual([['retell_mapping_register', {
      p_tenant_id: tenant,
      p_connection_id: connection,
      p_provider_account_id: agent,
    }]]);
  });

  it('returns an idempotent status without echoing the Retell agent ID', async () => {
    harness.rpc.mockResolvedValueOnce({ data: { status: 'already_mapped' }, error: null });
    const result = await registerRetellAgentMapping(tenant, agent);
    expect(result).toEqual({ status: 'already_mapped' });
    expect(JSON.stringify(result)).not.toContain(agent);
  });

  it('rejects an invalid agent locally before the database command', async () => {
    await expect(registerRetellAgentMapping(tenant, 'https://example.test/private-hook')).resolves.toEqual({ status: 'invalid_agent' });
    expect(harness.rpcCalls).toEqual([]);
  });

  it('rejects an invalid tenant locally without exposing validation details', async () => {
    await expect(registerRetellAgentMapping('not-a-workspace', agent)).resolves.toEqual({ status: 'unavailable' });
    expect(harness.rpcCalls).toEqual([]);
  });

  it('preserves a database conflict without exposing the conflicting route', async () => {
    harness.rpc.mockResolvedValueOnce({ data: { status: 'conflict' }, error: null });
    const result = await registerRetellAgentMapping(tenant, agent);
    expect(result).toEqual({ status: 'conflict' });
    expect(JSON.stringify(result)).not.toMatch(/tenant|connection|provider|agent_/i);
  });

  it('fails closed when the database denies an ordinary client mutation', async () => {
    harness.rpc.mockResolvedValueOnce({ data: { status: 'unavailable' }, error: null });
    await expect(registerRetellAgentMapping(tenant, agent)).resolves.toEqual({ status: 'unavailable' });
    expect(harness.rpcCalls).toHaveLength(1);
  });

  it.each(['free', null])('blocks %s plan before Retell mapping mutation', async plan => {
    harness.plan = plan;

    await expect(registerRetellAgentMapping(tenant, agent)).resolves.toEqual({ status: 'unavailable' });
    await expect(pauseRetellAgentMapping(tenant)).resolves.toEqual({ status: 'unavailable' });
    expect(harness.rpcCalls).toEqual([]);
  });

  it('rejects a response that includes a provider identifier', async () => {
    harness.rpc.mockResolvedValueOnce({ data: { status: 'mapped', agent_id: agent }, error: null });
    await expect(registerRetellAgentMapping(tenant, agent)).resolves.toEqual({ status: 'unavailable' });
  });

  it('reports missing server-only connection configuration without calling the RPC', async () => {
    process.env.MAKE_RETELL_INGRESS_CONNECTION_ID = 'not-a-uuid';
    await expect(registerRetellAgentMapping(tenant, agent)).resolves.toEqual({ status: 'not_configured' });
    expect(harness.rpcCalls).toEqual([]);
  });

  it('reports unavailable Supabase configuration without calling the mapping RPC', async () => {
    harness.configured.mockReturnValueOnce(false);
    await expect(pauseRetellAgentMapping(tenant)).resolves.toEqual({ status: 'not_configured' });
    expect(harness.rpcCalls).toEqual([]);
  });

  it('pauses through the authenticated session RPC for the exact tenant and connection', async () => {
    harness.rpc.mockResolvedValueOnce({ data: { status: 'paused' }, error: null });
    await expect(pauseRetellAgentMapping(tenant)).resolves.toEqual({ status: 'paused' });
    expect(harness.rpcCalls).toEqual([['retell_mapping_pause', {
      p_tenant_id: tenant,
      p_connection_id: connection,
    }]]);
  });

  it('preserves a not-mapped pause result', async () => {
    harness.rpc.mockResolvedValueOnce({ data: { status: 'not_mapped' }, error: null });
    await expect(pauseRetellAgentMapping(tenant)).resolves.toEqual({ status: 'not_mapped' });
  });

  it.each(['active', 'paused', 'not_mapped'] as const)('returns only the authorized non-sensitive %s health state', async status => {
    harness.rpc.mockResolvedValueOnce({ data: { status }, error: null });
    await expect(getRetellAgentMappingHealth(tenant)).resolves.toEqual({ status });
    expect(harness.rpcCalls).toEqual([['retell_mapping_health', {
      p_tenant_id: tenant,
      p_connection_id: connection,
    }]]);
  });

  it('fails closed on malformed or identifier-bearing health data', async () => {
    harness.rpc.mockResolvedValueOnce({ data: { status: 'active', provider_account_id: agent }, error: null });
    await expect(getRetellAgentMappingHealth(tenant)).resolves.toEqual({ status: 'unavailable' });
  });

  it('returns a safe status for RPC errors without leaking database details', async () => {
    harness.rpc.mockResolvedValueOnce({ data: null, error: { message: 'private relation detail' } });
    const result = await getRetellAgentMappingHealth(tenant);
    expect(result).toEqual({ status: 'unavailable' });
    expect(JSON.stringify(result)).not.toMatch(/relation|private|database/i);
  });

  it('fails before every mapping RPC when authentication fails', async () => {
    const failure = new Error('REDIRECT:/sign-in');
    harness.requireUser.mockRejectedValueOnce(failure);
    await expect(pauseRetellAgentMapping(tenant)).rejects.toBe(failure);
    expect(harness.rpcCalls).toEqual([]);
  });
});
