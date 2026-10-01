import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import {
  addHousehold,
  addUser,
  call,
  exportBackup,
  importBackup,
  initiate,
  login,
  request,
  startTestBackend
} from '../helpers/backend';
import { Admin } from '$lib/utils/userHelper';

const backend = await startTestBackend();

beforeEach(backend.reset);
afterAll(backend.close);

// Fills a household with a bit of everything that ends up in a backup.
async function seedHousehold(token: string) {
  const [admin] = await call<{ id: string }[]>('/users', { token });

  await call('/tasks', {
    method: 'POST',
    token,
    body: {
      name: 'Take out trash',
      description: 'Every monday',
      dueUserId: admin.id,
      dueDate: '2026-10-05',
      type: 'repeating',
      weekday: 'mon',
      interval: 1,
      assignment: 'everyone',
      endDate: ''
    }
  });
  await call('/balance', {
    method: 'POST',
    token,
    body: {
      purchaseId: '',
      type: 'groceries',
      description: "Bob's birthday cake",
      creditorId: admin.id,
      price: 2599,
      distributions: [{ userId: admin.id, percent: 100 }]
    }
  });
  await call('/shopping/category', { method: 'POST', token, body: { id: null, name: 'Garden' } });
}

// Everything a household sees, to compare it before and after a backup.
async function snapshot(token: string) {
  return {
    users: await call('/users', { token }),
    tasks: await call('/tasks', { token }),
    balance: await call('/balance', { token }),
    debts: await call('/balance/debts', { token }),
    categories: await call('/shopping/categoriesWithItems', { token })
  };
}

describe('backup', () => {
  it('restores all data of a household', async () => {
    const token = await initiate('Home', 'alice');
    await addUser(token, 'Home', 'bob');
    await seedHousehold(token);
    const before = await snapshot(token);

    const backup = await exportBackup(token);
    await backend.reset();
    const response = await importBackup(backup);

    expect(response.status).toBe(200);
    const restoredToken = await login('Home', 'alice');
    expect(await snapshot(restoredToken)).toEqual(before);
  });

  it('restores all households of a server', async () => {
    const token = await initiate('Home', 'alice');
    const other = await addHousehold(token, 'Other', 'carol');
    await seedHousehold(other.token);
    const before = await snapshot(other.token);

    const backup = await exportBackup(token);
    await backend.reset();
    await importBackup(backup);

    const restoredToken = await login('Other', 'carol');
    expect(await snapshot(restoredToken)).toEqual(before);
  });

  it('is only imported into an empty instance', async () => {
    const token = await initiate();
    const backup = await exportBackup(token);

    const response = await importBackup(backup);

    expect(response.status).toBe(405);
  });

  it('can only be exported by server admins', async () => {
    const token = await initiate('Home', 'alice');
    const householdAdmin = await addUser(token, 'Home', 'bob', Admin.Household);
    const member = await addUser(token, 'Home', 'carol');

    expect((await request('/users/export', { token: householdAdmin.token })).status).toBe(403);
    expect((await request('/users/export', { token: member.token })).status).toBe(403);
  });
});
