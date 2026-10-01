import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { addHousehold, call, initiate, login, request, startTestBackend, TEST_PASSWORD } from '../helpers/backend';

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

describe('household isolation', () => {
  it('hides the data of other households', async () => {
    const homeToken = await initiate('Home');
    const other = await addHousehold(homeToken, 'Other');

    await call('/tasks', {
      method: 'POST',
      token: homeToken,
      body: {
        name: 'Water plants',
        description: '',
        dueUserId: '',
        dueDate: '',
        type: 'single',
        weekday: null,
        interval: null,
        assignment: null,
        endDate: ''
      }
    });

    const homeTasks = await call<{ dueTasks: unknown[] }>('/tasks', { token: homeToken });
    const otherTasks = await call<{ dueTasks: unknown[] }>('/tasks', { token: other.token });

    expect(homeTasks.dueTasks).toHaveLength(1);
    expect(otherTasks.dueTasks).toHaveLength(0);
  });
});
