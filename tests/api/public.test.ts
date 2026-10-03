import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addHousehold,
  addUser,
  call,
  initiate,
  login,
  request,
  startTestBackend,
  TEST_PASSWORD
} from '../helpers/backend';

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
      body: { householdName: 'Other', username: 'intruder', password: TEST_PASSWORD }
    });

    expect(response.status).toBe(405);
  });

});

describe('setup', () => {
  it('is required after initiation', async () => {
    const token = await initiate();

    expect(await call('/setup', { token })).toEqual({ completed: false });
    expect(await call('/shopping/categoriesWithItems', { token })).toEqual([]);
  });

  it('creates the default shopping categories in the chosen locale', async () => {
    const token = await initiate();

    await call('/setup', { method: 'POST', token, body: { categoryLocale: 'de' } });

    const categories = await call<{ name: string }[]>('/shopping/categoriesWithItems', { token });
    expect(categories.length).toBeGreaterThan(10);
    expect(categories[0].name).toBe('Obst & Gemüse');
    expect(await call('/setup', { token })).toEqual({ completed: true });
  });

  it('can not be repeated', async () => {
    const token = await initiate();
    await call('/setup', { method: 'POST', token, body: { categoryLocale: 'en' } });

    const response = await request('/setup', { method: 'POST', token, body: { categoryLocale: 'en' } });

    expect(response.status).toBe(405);
  });

  it('is required for each household separately', async () => {
    const token = await initiate();
    await call('/setup', { method: 'POST', token, body: { categoryLocale: 'en' } });

    const other = await addHousehold(token, 'Other');
    const member = await addUser(other.token, 'Other', 'bob');

    expect(await call('/setup', { token: member.token })).toEqual({ completed: false });

    // Any member can complete it, not just admins.
    await call('/setup', { method: 'POST', token: member.token, body: { categoryLocale: 'de' } });

    expect(await call('/setup', { token: other.token })).toEqual({ completed: true });
    const categories = await call<{ name: string }[]>('/shopping/categoriesWithItems', { token: other.token });
    expect(categories[0].name).toBe('Obst & Gemüse');
    const ownCategories = await call<{ name: string }[]>('/shopping/categoriesWithItems', { token });
    expect(ownCategories[0].name).toBe('Fruit & vegetables');
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
