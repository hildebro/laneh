import { afterAll, beforeEach, describe, expect, it } from 'vitest';
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
import { Admin } from '$lib/utils/userHelper';

const backend = await startTestBackend();

beforeEach(backend.reset);
afterAll(backend.close);

type User = { id: string; username: string; householdId: string; admin: Admin };

// Home: alice (server admin), bob (household admin), carol (member). Other: dave (household admin).
async function setup() {
  const aliceToken = await initiate('Home', 'alice');
  const [alice] = await call<User[]>('/users', { token: aliceToken });
  const bob = await addUser(aliceToken, 'Home', 'bob', Admin.Household);
  const carol = await addUser(aliceToken, 'Home', 'carol');
  const dave = await addHousehold(aliceToken, 'Other', 'dave');

  return { alice: { ...alice, token: aliceToken }, bob, carol, dave };
}

const updateUser = (token: string, user: Partial<User> & { password?: string }) =>
  request('/users/update', {
    method: 'POST',
    token,
    body: { id: null, password: undefined, ...user }
  });

describe('members', () => {
  it('can not manage households', async () => {
    const { carol } = await setup();

    expect((await request('/households', { token: carol.token })).status).toBe(403);
    expect((await request('/households', { method: 'POST', token: carol.token, body: { name: 'New' } })).status).toBe(403);
  });

  it('can not manage users', async () => {
    const { carol } = await setup();

    const response = await updateUser(carol.token, {
      householdId: carol.householdId,
      username: 'eve',
      password: TEST_PASSWORD,
      admin: Admin.None
    });

    expect(response.status).toBe(403);
  });

  it('can not change the default distribution', async () => {
    const { carol } = await setup();

    const response = await request('/users/distributions', {
      method: 'POST',
      token: carol.token,
      body: [{ userId: carol.id, percent: 100 }]
    });

    expect(response.status).toBe(403);
  });

  it('can change their own name and password', async () => {
    const { carol } = await setup();

    await call('/users/update/me', {
      method: 'POST',
      token: carol.token,
      body: { username: 'caroline', password: 'new-password' }
    });

    const response = await request('/public/login', {
      method: 'POST',
      body: { householdName: 'Home', username: 'caroline', password: 'new-password' }
    });
    expect(response.status).toBe(200);
  });
});

describe('household admins', () => {
  it('only see their own household', async () => {
    const { bob } = await setup();

    const households = await call<{ name: string }[]>('/households', { token: bob.token });

    expect(households.map((h) => h.name)).toEqual(['Home']);
  });

  it('can not create or rename households', async () => {
    const { bob } = await setup();

    expect((await request('/households', { method: 'POST', token: bob.token, body: { name: 'New' } })).status).toBe(403);
    expect(
      (await request('/households', { method: 'PATCH', token: bob.token, body: { id: bob.householdId, name: 'New' } }))
        .status
    ).toBe(403);
  });

  it('can add users to their own household', async () => {
    const { bob } = await setup();

    const response = await updateUser(bob.token, {
      householdId: bob.householdId,
      username: 'eve',
      password: TEST_PASSWORD,
      admin: Admin.None
    });

    expect(response.status).toBe(200);
    expect(await login('Home', 'eve')).toEqual(expect.any(String));
  });

  it('can not add users to other households', async () => {
    const { bob, dave } = await setup();

    const response = await updateUser(bob.token, {
      householdId: dave.householdId,
      username: 'eve',
      password: TEST_PASSWORD,
      admin: Admin.None
    });

    expect(response.status).toBe(403);
  });

  it('can not change users of other households', async () => {
    const { bob, dave } = await setup();

    // Claims the user belongs to the admin's own household.
    await updateUser(bob.token, {
      id: dave.id,
      householdId: bob.householdId,
      username: 'dave',
      password: 'hijacked-password',
      admin: Admin.Household
    });

    // The password must still be the old one.
    const response = await request('/public/login', {
      method: 'POST',
      body: { householdName: 'Other', username: 'dave', password: TEST_PASSWORD }
    });
    expect(response.status).toBe(200);
  });

  it('can not see users of other households', async () => {
    const { bob, dave } = await setup();

    expect((await request(`/users/${dave.id}`, { token: bob.token })).status).toBe(403);
  });

  it('can not promote anyone to server admin', async () => {
    const { bob, carol } = await setup();

    const response = await updateUser(bob.token, {
      id: carol.id,
      householdId: carol.householdId,
      username: 'carol',
      admin: Admin.Server
    });

    expect(response.status).toBe(400);
  });

  it('can not change server admins', async () => {
    const { alice, bob } = await setup();

    const response = await updateUser(bob.token, {
      id: alice.id,
      householdId: alice.householdId,
      username: 'alice',
      admin: Admin.None
    });

    expect(response.status).toBe(400);
  });

  it('can not include users of other households in the default distribution', async () => {
    const { bob, dave } = await setup();

    const response = await request('/users/distributions', {
      method: 'POST',
      token: bob.token,
      body: [{ userId: bob.id, percent: 50 }, { userId: dave.id, percent: 50 }]
    });

    expect(response.status).toBe(400);
  });
});

describe('admin invariants', () => {
  it('keep the last server admin', async () => {
    const { alice } = await setup();

    const response = await updateUser(alice.token, {
      id: alice.id,
      householdId: alice.householdId,
      username: 'alice',
      admin: Admin.Household
    });

    expect(response.status).toBe(400);
  });

  it('keep the last admin of a household', async () => {
    const { alice, dave } = await setup();

    const response = await updateUser(alice.token, {
      id: dave.id,
      householdId: dave.householdId,
      username: 'dave',
      admin: Admin.None
    });

    expect(response.status).toBe(400);
  });
});

describe('usernames', () => {
  it('are unique within a household', async () => {
    const { alice } = await setup();

    const response = await updateUser(alice.token, {
      householdId: alice.householdId,
      username: 'carol',
      password: TEST_PASSWORD,
      admin: Admin.None
    });

    expect(response.status).toBe(400);
  });

  it('can repeat across households', async () => {
    const { alice, dave } = await setup();

    const response = await updateUser(alice.token, {
      householdId: dave.householdId,
      username: 'carol',
      password: TEST_PASSWORD,
      admin: Admin.None
    });

    expect(response.status).toBe(200);
  });
});
