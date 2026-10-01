import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { call, initiate, login, request, startTestBackend, TEST_PASSWORD } from '../helpers/backend';

const backend = await startTestBackend();

beforeEach(backend.reset);
afterAll(backend.close);

describe('initiation', () => {
  it('is needed on a fresh instance only', async () => {
    expect(await call('/public/needsInitiation')).toBe(true);

    await initiate();

    expect(await call('/public/needsInitiation')).toBe(false);
  });

  it('can not be repeated', async () => {
    await initiate();

    const response = await request('/public/initiate', {
      method: 'POST',
      body: { householdName: 'Other', username: 'intruder', password: TEST_PASSWORD, locale: 'en' }
    });

    expect(response.status).toBe(405);
  });

  it('creates the default shopping categories in the chosen locale', async () => {
    const token = await initiate();

    const categories = await call<{ name: string }[]>('/shopping/categoriesWithItems', { token });

    expect(categories.length).toBeGreaterThan(10);
  });
});

describe('authentication', () => {
  it('rejects requests without a session', async () => {
    const response = await request('/tasks');

    expect(response.status).toBe(401);
  });

  it('rejects an invalid session token', async () => {
    await initiate();

    const response = await request('/tasks', { token: 'not-a-session' });

    expect(response.status).toBe(401);
  });

  it('logs in with valid credentials only', async () => {
    await initiate('Home', 'admin');

    expect(await login('Home', 'admin')).toEqual(expect.any(String));

    const response = await request('/public/login', {
      method: 'POST',
      body: { householdName: 'Home', username: 'admin', password: 'wrong-password' }
    });
    expect(response.status).toBe(400);
  });
});

describe('version', () => {
  type Versions = { remoteVersion: string; serverVersion: string };

  // Stubs the GitHub release lookup with the given latest release.
  const stubLatestRelease = (version: string) => {
    const fetchMock = vi.fn(async () => Response.json({ tag_name: `v${version}` }));
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
  };

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('caches the remote version', async () => {
    stubLatestRelease('99.0.0');
    expect((await call<Versions>('/public/version')).remoteVersion).toBe('99.0.0');

    const fetchMock = stubLatestRelease('99.1.0');
    expect((await call<Versions>('/public/version')).remoteVersion).toBe('99.0.0');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('refetches the remote version when the app is newer than the cached one', async () => {
    stubLatestRelease('99.0.0');
    await call('/public/version');

    stubLatestRelease('99.1.0');
    expect((await call<Versions>('/public/version?appVersion=99.1.0')).remoteVersion).toBe('99.1.0');
  });

  it('refetches the remote version when the server is newer than the cached one', async () => {
    stubLatestRelease('0.0.1');
    const { serverVersion } = await call<Versions>('/public/version');

    stubLatestRelease(serverVersion);
    expect((await call<Versions>('/public/version')).remoteVersion).toBe(serverVersion);
  });
});
