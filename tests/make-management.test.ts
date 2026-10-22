import { afterEach, describe, expect, it, vi } from 'vitest';

import { createMakeAuthorization } from '@/lib/server/make-management';

const originalFetch = globalThis.fetch;
const requestId = '11111111-1111-4111-8111-111111111111';

afterEach(() => {
  globalThis.fetch = originalFetch;
  delete process.env.MAKE_MANAGEMENT_API_TOKEN;
  delete process.env.MAKE_TEAM_ID;
  delete process.env.MAKE_CREDENTIAL_REQUEST_CREDENTIALS_JSON;
  vi.restoreAllMocks();
});

describe('Make management API client', () => {
  it('fails closed when server configuration is missing', async () => {
    await expect(createMakeAuthorization({ name: 'Fictional Trade', email: 'owner@example.test' })).resolves.toEqual({ status: 'config_missing' });
  });

  it('creates a request without exposing the token in its result', async () => {
    process.env.MAKE_MANAGEMENT_API_TOKEN = 'secret-token';
    process.env.MAKE_TEAM_ID = '2527764';
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ request: { id: requestId, status: 'pending' }, publicUri: 'https://us2.make.com/request/example' }), { status: 200 }));
    globalThis.fetch = fetchMock;
    await expect(createMakeAuthorization({ name: 'Fictional Trade', email: 'owner@example.test' })).resolves.toEqual({ status: 'created', requestId, publicUri: 'https://us2.make.com/request/example', providerStatus: 'pending' });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://us2.make.com/api/v2/credential-requests/requests/v2');
    expect(init.headers).toMatchObject({ Authorization: 'Token secret-token' });
    expect(JSON.parse(String(init.body))).toMatchObject({ teamId: 2527764, provider: { newUser: { name: 'Fictional Trade', email: 'owner@example.test' } } });
  });

  it('redacts provider errors', async () => {
    process.env.MAKE_MANAGEMENT_API_TOKEN = 'secret-token';
    process.env.MAKE_TEAM_ID = '2527764';
    globalThis.fetch = vi.fn().mockResolvedValue(new Response('token=secret-token', { status: 403 }));
    await expect(createMakeAuthorization({ name: 'Fictional Trade', email: 'owner@example.test' })).resolves.toEqual({ status: 'provider_error' });
  });
});
