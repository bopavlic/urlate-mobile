import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';

import { api, apiErrorCode, apiErrorDetails, configureApiAuth, customInstance } from './client';

// Answers every request with the given status/body, the way a real adapter settles.
function respondWith(status: number, data: unknown, seen: InternalAxiosRequestConfig[] = []) {
  const adapter: AxiosAdapter = async (config) => {
    seen.push(config);
    const response = {
      data,
      status,
      statusText: String(status),
      headers: {},
      config,
    };
    if (status >= 200 && status < 300) return response;
    throw new AxiosError('Request failed', AxiosError.ERR_BAD_REQUEST, config, null, response);
  };
  api.defaults.adapter = adapter;
  return seen;
}

describe('api client', () => {
  it('sends the Better Auth session cookie', async () => {
    const seen = respondWith(200, { ok: true });
    configureApiAuth({
      getCookie: () => 'better-auth.session_token=abc',
      onUnauthorized: jest.fn(),
    });
    await api.get('/me');
    expect(seen[0]?.headers.get('Cookie')).toBe('better-auth.session_token=abc');
  });

  it('sends no cookie when signed out', async () => {
    const seen = respondWith(200, { ok: true });
    configureApiAuth({
      getCookie: async () => null,
      onUnauthorized: jest.fn(),
    });
    await api.get('/me');
    expect(seen[0]?.headers.get('Cookie')).toBeUndefined();
  });

  it('signs out once when a burst of requests comes back 401', async () => {
    respondWith(401, {
      error: { code: 'UNAUTHENTICATED', message: 'Sign in required' },
    });
    const onUnauthorized = jest.fn();
    configureApiAuth({ getCookie: () => 'stale', onUnauthorized });
    const results = await Promise.allSettled([api.get('/me'), api.get('/ledgers')]);
    expect(results.map((r) => r.status)).toEqual(['rejected', 'rejected']);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('customInstance resolves to the response body', async () => {
    respondWith(200, { id: 'u1' });
    configureApiAuth({ getCookie: () => null, onUnauthorized: jest.fn() });
    await expect(customInstance<{ id: string }>({ url: '/me', method: 'GET' })).resolves.toEqual({
      id: 'u1',
    });
  });

  it('reads the API error code', async () => {
    respondWith(409, {
      error: { code: 'USERNAME_TAKEN', message: 'That username is taken' },
    });
    const error = await api.patch('/me', { username: 'borna' }).catch((e: unknown) => e);
    expect(apiErrorCode(error)).toBe('USERNAME_TAKEN');
    expect(apiErrorCode(new Error('offline'))).toBeUndefined();
  });

  it('reads the API error details', async () => {
    respondWith(409, {
      error: { code: 'ALREADY_MEMBER', message: 'Already in', details: { ledgerId: 'l1' } },
    });
    const error = await api.post('/invites/ABCDEFGH/claim').catch((e: unknown) => e);
    expect(apiErrorDetails(error)).toEqual({ ledgerId: 'l1' });
    expect(apiErrorDetails(new Error('offline'))).toBeUndefined();
  });
});
