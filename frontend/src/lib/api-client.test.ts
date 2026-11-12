import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TokenResponse } from '@/lib/types';

// axios is mocked so the module-level interceptors registered by api-client
// can be driven directly: capture the handlers, then hand them synthetic
// errors/configs instead of running a real HTTP stack.
const { requestHandlers, responseHandlers, postMock, instanceMock } = vi.hoisted(() => ({
  requestHandlers: [] as Array<{ onFulfilled?: (v: unknown) => unknown; onRejected?: (e: unknown) => unknown }>,
  responseHandlers: [] as Array<{ onFulfilled?: (v: unknown) => unknown; onRejected?: (e: unknown) => unknown }>,
  postMock: vi.fn(),
  instanceMock: vi.fn(),
}));

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  const instance = Object.assign(instanceMock, {
    interceptors: {
      request: {
        use: (onFulfilled?: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) => {
          requestHandlers.push({ onFulfilled, onRejected });
          return 0;
        },
      },
      response: {
        use: (onFulfilled?: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) => {
          responseHandlers.push({ onFulfilled, onRejected });
          return 0;
        },
      },
    },
  });
  return {
    ...actual,
    default: { ...actual.default, create: () => instance, post: postMock },
  };
});

const tokens: TokenResponse = {
  accessToken: 'access-1',
  accessTokenExpiresAt: '2026-10-29T12:00:00Z',
  refreshToken: 'refresh-1',
  refreshTokenExpiresAt: '2026-11-05T12:00:00Z',
  email: 'admin@northstar.local',
  roles: ['ADMIN'],
};

/** A synthetic axios error shaped the way api-client inspects it. */
type AxiosErrorLike = Error & {
  isAxiosError: boolean;
  config: { url: string; headers: Record<string, string>; retried?: boolean };
  response?: { status: number; data: unknown };
};

function axios401(url = '/api/employees'): AxiosErrorLike {
  const error = new Error('Request failed with status code 401');
  return Object.assign(error, {
    isAxiosError: true,
    config: { url, headers: {} as Record<string, string> },
    response: { status: 401, data: {} },
  }) as AxiosErrorLike;
}

function axiosError(status: number, data: unknown, url = '/api/employees'): AxiosErrorLike {
  const error = new Error(`Request failed with status code ${status}`);
  return Object.assign(error, {
    isAxiosError: true,
    config: { url, headers: {} as Record<string, string> },
    response: { status, data },
  }) as AxiosErrorLike;
}

let apiClient: typeof import('@/lib/api-client');
let requestInterceptor: (v: unknown) => unknown;
let responseInterceptor: (e: unknown) => unknown;

beforeAll(async () => {
  // Import exactly once: api-client registers its interceptors at module scope,
  // and the module registry keeps that module (and those handlers) for the
  // whole file. Re-importing returns the cached module without re-registering,
  // so the capture arrays must never be cleared between tests.
  apiClient = await import('@/lib/api-client');
  requestInterceptor = requestHandlers[0].onFulfilled!;
  responseInterceptor = responseHandlers[0].onRejected!;
});

beforeEach(() => {
  sessionStorage.clear();
  postMock.mockReset();
  instanceMock.mockReset();
});

describe('request interceptor', () => {
  it('attaches the stored access token as a Bearer header', async () => {
    sessionStorage.setItem('hrms.accessToken', 'stored-token');
    const onFulfilled = requestInterceptor;
    const config = (await onFulfilled({ headers: {} })) as { headers: Record<string, string> };
    expect(config.headers.Authorization).toBe('Bearer stored-token');
  });

  it('sends no Authorization header when signed out', async () => {
    const onFulfilled = requestInterceptor;
    const config = (await onFulfilled({ headers: {} })) as { headers: Record<string, string> };
    expect(config.headers.Authorization).toBeUndefined();
  });
});

describe('401 refresh rotation', () => {
  it('refreshes once and replays the original request with the new token', async () => {
    apiClient.saveTokens(tokens);
    postMock.mockResolvedValue({
      data: { ...tokens, accessToken: 'access-2', refreshToken: 'refresh-2' },
    });
    // The replayed request goes back through the axios instance; echo a
    // response-shaped object so the test can inspect what was actually sent.
    instanceMock.mockImplementation((config: unknown) => ({ config }));

    const onRejected = responseInterceptor;
    const result = (await onRejected(axios401())) as { config: { headers: Record<string, string> } };

    expect(postMock).toHaveBeenCalledTimes(1);
    expect(postMock).toHaveBeenCalledWith(expect.stringContaining('/api/auth/refresh'), {
      refreshToken: 'refresh-1',
    });
    // The replayed request carries the rotated token, not the stale one.
    expect(result.config.headers.Authorization).toBe('Bearer access-2');
    // And the rotated pair is persisted for the next request.
    expect(sessionStorage.getItem('hrms.accessToken')).toBe('access-2');
    expect(sessionStorage.getItem('hrms.refreshToken')).toBe('refresh-2');
    expect(instanceMock).toHaveBeenCalledTimes(1);
  });

  it('coalesces concurrent 401s into a single refresh (single-flight)', async () => {
    apiClient.saveTokens(tokens);
    let release!: (value: unknown) => void;
    postMock.mockReturnValue(new Promise((resolve) => { release = resolve; }));

    const onRejected = responseInterceptor;
    const first = onRejected(axios401('/api/employees'));
    const second = onRejected(axios401('/api/departments'));
    const third = onRejected(axios401('/api/leaves'));

    release({ data: { ...tokens, accessToken: 'access-2', refreshToken: 'refresh-2' } });
    await Promise.all([first, second, third]);

    expect(postMock).toHaveBeenCalledTimes(1);
    expect(instanceMock).toHaveBeenCalledTimes(3);
  });

  it('clears the session and announces expiry when the refresh fails', async () => {
    apiClient.saveTokens(tokens);
    postMock.mockRejectedValue(new Error('refresh rejected'));

    const expired = vi.fn();
    window.addEventListener('hrms:session-expired', expired);

    const onRejected = responseInterceptor;
    await expect(onRejected(axios401())).rejects.toThrow('refresh rejected');

    expect(sessionStorage.getItem('hrms.accessToken')).toBeNull();
    expect(sessionStorage.getItem('hrms.refreshToken')).toBeNull();
    expect(expired).toHaveBeenCalledTimes(1);

    window.removeEventListener('hrms:session-expired', expired);
  });

  it('announces expiry immediately when there is no refresh token', async () => {
    sessionStorage.setItem('hrms.accessToken', 'access-1');
    const expired = vi.fn();
    window.addEventListener('hrms:session-expired', expired);

    const onRejected = responseInterceptor;
    await expect(onRejected(axios401())).rejects.toThrow();

    expect(postMock).not.toHaveBeenCalled();
    expect(expired).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem('hrms.accessToken')).toBeNull();

    window.removeEventListener('hrms:session-expired', expired);
  });

  it('does not retry a request that already retried', async () => {
    apiClient.saveTokens(tokens);
    postMock.mockResolvedValue({ data: tokens });

    const onRejected = responseInterceptor;
    const error = axios401();
    (error.config as { retried?: boolean }).retried = true;

    await expect(onRejected(error)).rejects.toThrow();
    expect(postMock).not.toHaveBeenCalled();
  });

  it('never rotates a login or refresh call (no retry loop on auth endpoints)', async () => {
    apiClient.saveTokens(tokens);

    const onRejected = responseInterceptor;
    await expect(onRejected(axios401('/api/auth/login'))).rejects.toThrow();
    await expect(onRejected(axios401('/api/auth/refresh'))).rejects.toThrow();

    expect(postMock).not.toHaveBeenCalled();
  });

  it('passes non-401 errors straight through', async () => {
    apiClient.saveTokens(tokens);

    const onRejected = responseInterceptor;
    await expect(onRejected(axiosError(403, { detail: 'forbidden' }))).rejects.toThrow();
    await expect(onRejected(axiosError(500, { detail: 'boom' }))).rejects.toThrow();

    expect(postMock).not.toHaveBeenCalled();
  });
});

describe('getErrorMessage', () => {
  it('maps the statuses the backend actually returns', () => {
    expect(apiClient.getErrorMessage(axiosError(401, {}))).toBe('Your session has expired. Please sign in again.');
    expect(apiClient.getErrorMessage(axiosError(403, {}))).toBe(
      'You do not have permission to view this information.',
    );
    expect(apiClient.getErrorMessage(axiosError(400, { detail: 'End date must be on or after the start date.' }))).toBe(
      'End date must be on or after the start date.',
    );
  });

  it('reports an unreachable backend distinctly from an auth failure', () => {
    const offline = new Error('Network Error');
    Object.assign(offline, { isAxiosError: true, config: { url: '/api/health', headers: {} } });
    expect(apiClient.getErrorMessage(offline)).toBe(
      'Could not connect to the HRMS server. Check that the backend is running.',
    );
  });

  it('falls back for non-axios errors', () => {
    expect(apiClient.getErrorMessage(new Error('kaboom'))).toBe('kaboom');
    expect(apiClient.getErrorMessage('not an error')).toBe('Something went wrong. Please try again.');
  });
});
