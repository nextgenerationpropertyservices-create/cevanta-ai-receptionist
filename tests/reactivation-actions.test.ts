import { beforeEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({
  requireMembership: vi.fn(),
  revalidatePath: vi.fn(),
  rpc: vi.fn(),
  queryResponses: [] as Array<{ data: unknown; error: { code?: string; message?: string } | null }>,
  calls: [] as Array<{ table: string; method: string; args: unknown[] }>,
}));

vi.mock('@/lib/server/authorization', () => ({ requireMembership: harness.requireMembership }));
vi.mock('next/cache', () => ({ revalidatePath: harness.revalidatePath }));
vi.mock('next/navigation', () => ({ unstable_rethrow: vi.fn() }));

import { approveReactivationCandidate, createReactivationCampaign, dismissReactivationCandidate, scheduleReactivationCandidate } from '@/app/actions/reactivation';

const tenantId = '11111111-1111-4111-8111-111111111111';
const customerId = '22222222-2222-4222-8222-222222222222';
const leadId = '33333333-3333-4333-8333-333333333333';
const candidateId = '44444444-4444-4444-8444-444444444444';
const campaignId = '55555555-5555-4555-8555-555555555555';
const requestId = '66666666-6666-4666-8666-666666666666';
const idle = { status: 'idle', message: '' } as const;

function query(table: string) {
  const chain = {
    select(...args: unknown[]) { harness.calls.push({ table, method: 'select', args }); return chain; },
    eq(...args: unknown[]) { harness.calls.push({ table, method: 'eq', args }); return chain; },
    order(...args: unknown[]) { harness.calls.push({ table, method: 'order', args }); return chain; },
    then(resolve: (value: unknown) => unknown) { return Promise.resolve(harness.queryResponses.shift()).then(resolve); },
  };
  return chain;
}

function databaseClient() {
  return { from: (table: string) => query(table), rpc: harness.rpc };
}

function campaignForm(overrides: Record<string, string> = {}) {
  const form = new FormData();
  form.set('tenantId', tenantId);
  form.set('request_id', requestId);
  form.set('name', 'Fictional fall maintenance review');
  form.set('season', 'fall');
  form.set('channel', 'email');
  form.set('triggerType', 'seasonal');
  form.set('weatherTrigger', '');
  for (const [key, value] of Object.entries(overrides)) form.set(key, value);
  return form;
}

function candidateForm(overrides: Record<string, string> = {}) {
  const form = new FormData();
  form.set('tenantId', tenantId);
  form.set('candidateId', candidateId);
  for (const [key, value] of Object.entries(overrides)) form.set(key, value);
  return form;
}

function scheduleForm(overrides: Record<string, string> = {}) {
  const form = candidateForm(overrides);
  form.set('date', '2030-01-02');
  form.set('time', '10:30');
  return form;
}

function history() {
  harness.queryResponses = [
    { data: [{ id: customerId, tenant_id: tenantId, name: 'Fictional Harbor Mechanical', email: 'office@example.test', phone: null, notes: null, created_at: '2024-01-01T00:00:00.000Z', updated_at: '2024-01-01T00:00:00.000Z' }], error: null },
    { data: [{ id: leadId, tenant_id: tenantId, submission_id: '77777777-7777-4777-8777-777777777777', customer_id: customerId, name: 'Fictional Harbor Mechanical', email: 'office@example.test', phone: null, description: 'Fictional rooftop maintenance request', priority: 'normal', status: 'closed', follow_up_date: null, created_at: '2024-09-15T00:00:00.000Z', updated_at: '2024-09-15T00:00:00.000Z' }], error: null },
    { data: [{ id: '88888888-8888-4888-8888-888888888888', tenant_id: tenantId, submission_id: '99999999-9999-4999-8999-999999999999', lead_id: leadId, customer_id: customerId, service_location_id: null, title: 'Fictional completed service', description: null, status: 'completed', priority: 'normal', scheduled_date: '2024-09-15', assigned_user_id: null, created_at: '2024-09-15T00:00:00.000Z', updated_at: '2024-09-15T00:00:00.000Z' }], error: null },
  ];
}

beforeEach(() => {
  vi.clearAllMocks();
  harness.calls = [];
  history();
  harness.requireMembership.mockResolvedValue({ client: databaseClient(), role: 'owner', user: { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' } });
  harness.rpc.mockResolvedValue({ data: { status: 'saved', campaign_id: campaignId, campaign_status: 'review', candidate_count: 1 }, error: null });
});

describe('Reactivation hardened commands', () => {
  it('creates the campaign and all drafts through one exact idempotent RPC input', async () => {
    const result = await createReactivationCampaign(idle, campaignForm({ status: 'approved', created_by: 'forged', tenant_id: 'forged' }));

    expect(result).toEqual({ status: 'success', message: 'Campaign created with 1 review draft.' });
    expect(harness.requireMembership).toHaveBeenCalledWith(tenantId, ['owner', 'admin', 'dispatcher']);
    expect(harness.calls.filter(call => call.method === 'eq')).toEqual([
      { table: 'customers', method: 'eq', args: ['tenant_id', tenantId] },
      { table: 'leads', method: 'eq', args: ['tenant_id', tenantId] },
      { table: 'jobs', method: 'eq', args: ['tenant_id', tenantId] },
    ]);
    expect(harness.rpc).toHaveBeenCalledOnce();
    const [rpcName, rpcArgs] = harness.rpc.mock.calls[0] as [string, { input: Record<string, unknown> }];
    expect(rpcName).toBe('create_reactivation_campaign');
    expect(Object.keys(rpcArgs.input).sort()).toEqual(['candidates', 'channel', 'name', 'request_id', 'season', 'tenant_id', 'trigger_type', 'weather_trigger']);
    expect(rpcArgs.input).toMatchObject({ tenant_id: tenantId, request_id: requestId, name: 'Fictional fall maintenance review', season: 'fall', channel: 'email', trigger_type: 'seasonal', weather_trigger: null });
    const candidates = rpcArgs.input.candidates as Array<Record<string, unknown>>;
    expect(candidates).toHaveLength(1);
    expect(Object.keys(candidates[0]).sort()).toEqual(['customer_id', 'last_service_at', 'lead_id', 'message', 'reason', 'subject']);
    expect(candidates[0]).toMatchObject({ customer_id: customerId, lead_id: leadId, last_service_at: '2024-09-15' });
    expect(candidates[0]).not.toHaveProperty('tenant_id');
    expect(candidates[0]).not.toHaveProperty('status');
    expect(candidates[0]).not.toHaveProperty('channel');
    expect(harness.revalidatePath).toHaveBeenCalledWith(`/workspaces/${tenantId}/reactivation`);
  });

  it('reuses the supplied request id for a safe replay and rejects a malformed id before authorization', async () => {
    await createReactivationCampaign(idle, campaignForm());
    history();
    harness.rpc.mockResolvedValueOnce({ data: { status: 'replayed', campaign_id: campaignId, campaign_status: 'review', candidate_count: 1 }, error: null });
    expect((await createReactivationCampaign(idle, campaignForm())).status).toBe('success');
    expect(harness.rpc.mock.calls[0]?.[1]).toMatchObject({ input: { request_id: requestId } });
    expect(harness.rpc.mock.calls[1]?.[1]).toMatchObject({ input: { request_id: requestId } });

    vi.clearAllMocks();
    const invalid = await createReactivationCampaign(idle, campaignForm({ request_id: 'not-a-uuid' }));
    expect(invalid).toEqual({ status: 'error', message: 'Refresh this page before creating the campaign.' });
    expect(harness.requireMembership).not.toHaveBeenCalled();
    expect(harness.rpc).not.toHaveBeenCalled();
  });

  it.each([
    [{ data: null, error: { code: 'PGRST202', message: 'private function detail' } }, 'database migration'],
    [{ data: null, error: { code: '22023', message: 'private validation detail' } }, 'could not be accepted'],
    [{ data: { status: 'conflict', reason: 'request_reuse' }, error: null }, 'already used with different details'],
    [{ data: { status: 'saved', campaign_id: campaignId, campaign_status: 'review', candidate_count: 2 }, error: null }, 'Unable to confirm the campaign draft count'],
    [{ data: { status: 'saved', candidate_count: 1 }, error: null }, 'Unable to create this campaign'],
  ])('maps campaign command result safely: %j', async (rpcResult, expected) => {
    harness.rpc.mockResolvedValueOnce(rpcResult);
    const result = await createReactivationCampaign(idle, campaignForm());
    expect(result.status).toBe('error');
    expect(result.message).toContain(expected);
    expect(JSON.stringify(result)).not.toContain('private');
    expect(harness.revalidatePath).not.toHaveBeenCalled();
  });

  it('fails safely when office authorization or tenant-scoped history fails', async () => {
    harness.requireMembership.mockRejectedValueOnce(new Error('private membership detail'));
    const denied = await createReactivationCampaign(idle, campaignForm());
    expect(denied.status).toBe('error');
    expect(JSON.stringify(denied)).not.toContain('private membership detail');
    expect(harness.rpc).not.toHaveBeenCalled();

    harness.requireMembership.mockResolvedValueOnce({ client: databaseClient(), role: 'dispatcher' });
    harness.queryResponses = [{ data: null, error: { code: '42501', message: 'private row detail' } }, { data: [], error: null }, { data: [], error: null }];
    const historyFailure = await createReactivationCampaign(idle, campaignForm());
    expect(historyFailure.status).toBe('error');
    expect(JSON.stringify(historyFailure)).not.toContain('private row detail');
    expect(harness.rpc).not.toHaveBeenCalled();
  });

  it('approves and dismisses only through the narrow review command', async () => {
    harness.rpc.mockResolvedValueOnce({ data: { status: 'saved', candidate_id: candidateId, candidate_status: 'approved' }, error: null });
    const approved = await approveReactivationCandidate(idle, candidateForm({ decision: 'dismiss', status: 'booked', reviewed_by: 'forged', job_id: 'forged' }));
    expect(approved).toEqual({ status: 'success', message: 'Draft approved. No email or SMS was sent.' });
    expect(harness.rpc).toHaveBeenNthCalledWith(1, 'review_reactivation_candidate', { input: { tenant_id: tenantId, candidate_id: candidateId, decision: 'approve' } });

    harness.rpc.mockResolvedValueOnce({ data: { status: 'saved', candidate_id: candidateId, candidate_status: 'dismissed' }, error: null });
    const dismissed = await dismissReactivationCandidate(idle, candidateForm({ decision: 'approve', appointment_id: 'forged' }));
    expect(dismissed).toEqual({ status: 'success', message: 'Candidate dismissed.' });
    expect(harness.rpc).toHaveBeenNthCalledWith(2, 'review_reactivation_candidate', { input: { tenant_id: tenantId, candidate_id: candidateId, decision: 'dismiss' } });
    expect(harness.calls).toEqual([]);
  });

  it('denies or rejects invalid review results without a success claim', async () => {
    harness.requireMembership.mockRejectedValueOnce(new Error('private denied detail'));
    expect((await approveReactivationCandidate(idle, candidateForm())).status).toBe('error');
    expect(harness.rpc).not.toHaveBeenCalled();

    harness.requireMembership.mockResolvedValue({ client: databaseClient(), role: 'owner' });
    harness.rpc.mockResolvedValueOnce({ data: null, error: { code: '42501', message: 'private transition detail' } });
    const denied = await dismissReactivationCandidate(idle, candidateForm());
    expect(denied).toEqual({ status: 'error', message: 'This candidate is no longer available to dismiss.' });
    expect(JSON.stringify(denied)).not.toContain('private transition detail');

    harness.rpc.mockResolvedValueOnce({ data: { status: 'saved', candidate_id: candidateId, candidate_status: 'dismissed' }, error: null });
    const mismatched = await approveReactivationCandidate(idle, candidateForm());
    expect(mismatched).toEqual({ status: 'error', message: 'Unable to confirm this draft approval.' });
    expect(harness.revalidatePath).not.toHaveBeenCalled();
  });

  it('keeps scheduling on the existing internal-only RPC with server-derived times', async () => {
    harness.rpc.mockResolvedValueOnce({ data: [{ job_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', appointment_id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc' }], error: null });
    const result = await scheduleReactivationCandidate(idle, scheduleForm({ target_tenant: 'forged', job_id: 'forged', appointment_id: 'forged', status: 'booked' }));
    expect(result).toEqual({ status: 'success', message: 'Internal job and calendar visit created. No external calendar or message was written.' });
    expect(harness.rpc).toHaveBeenCalledWith('schedule_reactivation_visit', {
      target_tenant: tenantId,
      target_candidate: candidateId,
      target_date: '2030-01-02',
      target_starts_at: '2030-01-02T10:30:00.000Z',
      target_ends_at: '2030-01-02T11:30:00.000Z',
    });
    expect(harness.revalidatePath).toHaveBeenCalledWith(`/workspaces/${tenantId}/jobs`);
    expect(harness.revalidatePath).toHaveBeenCalledWith(`/workspaces/${tenantId}/calendar`);
  });

  it.each([
    null,
    [],
    [{ job_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', appointment_id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc' }, { job_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', appointment_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee' }],
    [{ job_id: 'not-a-uuid', appointment_id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc' }],
    [{ job_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', appointment_id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', candidate_id: candidateId }],
  ])('fails closed when scheduling does not return exactly one confirmed job/appointment pair: %j', async data => {
    harness.rpc.mockResolvedValueOnce({ data, error: null });

    const result = await scheduleReactivationCandidate(idle, scheduleForm());

    expect(result).toEqual({ status: 'error', message: 'Unable to confirm the internal job and calendar visit.' });
    expect(harness.rpc).toHaveBeenCalledOnce();
    expect(harness.revalidatePath).not.toHaveBeenCalled();
  });
});
