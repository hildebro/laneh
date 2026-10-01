import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { addHousehold, addUser, call, initiate, request, startTestBackend } from '../helpers/backend';

// Every household must only ever see and change its own data. The ids of other households' entities are used
// directly in these tests, as if they had leaked somehow.
const backend = await startTestBackend();

beforeEach(backend.reset);
afterAll(backend.close);

type User = { id: string; username: string; householdId: string };
type Task = { id: string; name: string; dueDate: string | null; done: boolean };
type TaskList = { dueTasks: Task[]; upcomingTasks: Task[]; completedTasks: Task[] };

// Home: alice and bob. Other: dave.
async function setup() {
  const aliceToken = await initiate('Home', 'alice');
  const [alice] = await call<User[]>('/users', { token: aliceToken });
  const bob = await addUser(aliceToken, 'Home', 'bob');
  const dave = await addHousehold(aliceToken, 'Other', 'dave');

  return { alice: { ...alice, token: aliceToken }, bob, dave };
}

const singleTask = (name: string, overrides: Record<string, unknown> = {}) => ({
  name,
  description: '',
  dueUserId: '',
  dueDate: '',
  type: 'single',
  weekday: null,
  interval: null,
  assignment: null,
  endDate: '',
  ...overrides
});

async function createTask(token: string, name: string) {
  await call('/tasks', { method: 'POST', token, body: singleTask(name) });
  const tasks = await call<TaskList>('/tasks', { token });

  return tasks.dueTasks.find((t) => t.name === name)!;
}

const expense = (creditorId: string, price: number, distributions: { userId: string; percent: number }[]) => ({
  purchaseId: '',
  type: 'groceries',
  description: '',
  creditorId,
  price,
  distributions
});

describe('users', () => {
  it('only lists members of the own household', async () => {
    const { alice, dave } = await setup();

    const homeUsers = await call<User[]>('/users', { token: alice.token });
    const otherUsers = await call<User[]>('/users', { token: dave.token });

    expect(homeUsers.map((u) => u.username).sort()).toEqual(['alice', 'bob']);
    expect(otherUsers.map((u) => u.username)).toEqual(['dave']);
  });
});

describe('tasks', () => {
  it('are hidden from other households', async () => {
    const { alice, dave } = await setup();
    const task = await createTask(alice.token, 'Water plants');

    const otherTasks = await call<TaskList>('/tasks', { token: dave.token });

    expect(otherTasks.dueTasks).toHaveLength(0);
    expect((await request(`/tasks/${task.id}`, { token: dave.token })).status).toBe(404);
  });

  it('can not be completed by other households', async () => {
    const { alice, dave } = await setup();
    const task = await createTask(alice.token, 'Water plants');

    const response = await request('/tasks/done', {
      method: 'POST',
      token: dave.token,
      body: { taskId: task.id, userId: null }
    });

    expect(response.status).toBe(404);
    expect((await call<Task>(`/tasks/${task.id}`, { token: alice.token })).done).toBe(false);
  });

  it('can not be changed by other households', async () => {
    const { alice, dave } = await setup();
    const task = await createTask(alice.token, 'Water plants');

    const response = await request('/tasks', {
      method: 'POST',
      token: dave.token,
      body: singleTask('Hijacked', { id: task.id })
    });

    expect(response.ok).toBe(false);
    expect((await call<Task>(`/tasks/${task.id}`, { token: alice.token })).name).toBe('Water plants');
  });

  it('can not be assigned to users of other households', async () => {
    const { alice, dave } = await setup();

    const response = await request('/tasks', {
      method: 'POST',
      token: alice.token,
      body: singleTask('Water plants', { dueUserId: dave.id })
    });

    expect(response.status).toBe(400);
  });
});

describe('balance', () => {
  it('is hidden from other households', async () => {
    const { alice, bob, dave } = await setup();
    await call('/balance', {
      method: 'POST',
      token: alice.token,
      body: expense(alice.id, 1000, [{ userId: bob.id, percent: 100 }])
    });
    const [entry] = await call<{ id: string }[]>('/balance', { token: alice.token });

    expect(await call('/balance', { token: dave.token })).toEqual([]);
    expect(await call('/balance/debts', { token: dave.token })).toEqual([]);
    expect((await request(`/balance/${entry.id}`, { token: dave.token })).status).toBe(404);
  });

  it('can not be changed by other households', async () => {
    const { alice, bob, dave } = await setup();
    await call('/balance', {
      method: 'POST',
      token: alice.token,
      body: expense(alice.id, 1000, [{ userId: bob.id, percent: 100 }])
    });
    const [entry] = await call<{ id: string }[]>('/balance', { token: alice.token });
    const before = await call(`/balance/${entry.id}`, { token: alice.token });

    await request('/balance', {
      method: 'PATCH',
      token: dave.token,
      body: { ...expense(dave.id, 1000, [{ userId: dave.id, percent: 100 }]), id: entry.id }
    });

    expect(await call(`/balance/${entry.id}`, { token: alice.token })).toEqual(before);
  });

  it('can not include users of other households', async () => {
    const { alice, dave } = await setup();

    const response = await request('/balance', {
      method: 'POST',
      token: alice.token,
      body: expense(alice.id, 1000, [{ userId: dave.id, percent: 100 }])
    });

    expect(response.status).toBe(400);
  });
});

describe('shopping', () => {
  it('categories are hidden from and can not be changed by other households', async () => {
    const { alice, dave } = await setup();
    await call('/shopping/category', { method: 'POST', token: alice.token, body: { id: null, name: 'Garden' } });
    const categories = await call<{ id: string; name: string }[]>('/shopping/categoriesWithItems', {
      token: alice.token
    });
    const garden = categories.find((c) => c.name === 'Garden')!;

    const otherCategories = await call<{ name: string }[]>('/shopping/categoriesWithItems', { token: dave.token });
    expect(otherCategories.map((c) => c.name)).not.toContain('Garden');
    expect((await request(`/shopping/category/${garden.id}`, { token: dave.token })).status).toBe(404);

    await request('/shopping/category', { method: 'POST', token: dave.token, body: { id: garden.id, name: 'Hijacked' } });
    expect((await request(`/shopping/category/${garden.id}`, { method: 'DELETE', token: dave.token })).status).toBe(404);

    const after = await call<{ name: string }>(`/shopping/category/${garden.id}`, { token: alice.token });
    expect(after.name).toBe('Garden');
  });
});

describe('notifications', () => {
  it('only reach members of the same household', async () => {
    const { alice, bob, dave } = await setup();
    const since = new Date(Date.now() - 1000).toISOString();
    const task = await createTask(alice.token, 'Water plants');

    await call('/tasks/done', { method: 'POST', token: alice.token, body: { taskId: task.id, userId: null } });

    type Poll = { notifications: { subject: string }[] };
    const bobPoll = await call<Poll>(`/notifications?since=${since}`, { token: bob.token });
    const davePoll = await call<Poll>(`/notifications?since=${since}`, { token: dave.token });
    expect(bobPoll.notifications.map((n) => n.subject)).toEqual(['Water plants']);
    expect(davePoll.notifications).toEqual([]);
  });
});
