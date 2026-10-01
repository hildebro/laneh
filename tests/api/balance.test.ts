import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { addUser, call, initiate, request, startTestBackend } from '../helpers/backend';
import type { DebtResult } from '$lib/backend/db/functions';
import { BalanceEntryType } from '$lib/utils/balanceHelper';

const backend = await startTestBackend();

beforeEach(backend.reset);
afterAll(backend.close);

// Prices are stored in cents.
const expense = (creditorId: string, price: number, distributions: { userId: string; percent: number }[]) => ({
  purchaseId: '',
  type: BalanceEntryType.Groceries,
  description: '',
  creditorId,
  price,
  distributions
});

async function setupHousehold() {
  const token = await initiate('Home', 'alice');
  const [alice] = await call<{ id: string }[]>('/users', { token });
  const bob = await addUser(token, 'Home', 'bob');

  return { token, alice, bob };
}

// Simplifies the debts to "debtor -> creditor: amount" for readable assertions.
async function findDebts(token: string) {
  const debts = await call<DebtResult[]>('/balance/debts', { token });

  return debts.flatMap((result) =>
    result.debtorData.map((data) => `${data.debtor.username} -> ${result.creditor.username}: ${data.amount}`)
  );
}

describe('debts', () => {
  it('splits an expense by the distribution', async () => {
    const { token, alice, bob } = await setupHousehold();

    await call('/balance', {
      method: 'POST',
      token,
      body: expense(alice.id, 3000, [{ userId: alice.id, percent: 50 }, { userId: bob.id, percent: 50 }])
    });

    expect(await findDebts(token)).toEqual(['bob -> alice: 1500']);
  });

  it('nets out expenses in both directions', async () => {
    const { token, alice, bob } = await setupHousehold();

    await call('/balance', {
      method: 'POST',
      token,
      body: expense(alice.id, 3000, [{ userId: alice.id, percent: 50 }, { userId: bob.id, percent: 50 }])
    });
    await call('/balance', {
      method: 'POST',
      token: bob.token,
      body: expense(bob.id, 1000, [{ userId: bob.id, percent: 0 }, { userId: alice.id, percent: 100 }])
    });

    expect(await findDebts(token)).toEqual(['bob -> alice: 500']);
  });

  it('is settled when both owe the same', async () => {
    const { token, alice, bob } = await setupHousehold();

    await call('/balance', {
      method: 'POST',
      token,
      body: expense(alice.id, 1000, [{ userId: bob.id, percent: 100 }])
    });
    await call('/balance', {
      method: 'POST',
      token: bob.token,
      body: expense(bob.id, 1000, [{ userId: alice.id, percent: 100 }])
    });

    expect(await findDebts(token)).toEqual([]);
  });

  it('rounds uneven shares to whole cents', async () => {
    const { token, alice, bob } = await setupHousehold();

    await call('/balance', {
      method: 'POST',
      token,
      body: expense(alice.id, 1001, [{ userId: alice.id, percent: 66.67 }, { userId: bob.id, percent: 33.33 }])
    });

    expect(await findDebts(token)).toEqual(['bob -> alice: 334']);
  });

  it('recalculates after an entry is updated', async () => {
    const { token, alice, bob } = await setupHousehold();
    await call('/balance', {
      method: 'POST',
      token,
      body: expense(alice.id, 3000, [{ userId: alice.id, percent: 50 }, { userId: bob.id, percent: 50 }])
    });
    const [entry] = await call<{ id: string }[]>('/balance', { token });

    await call('/balance', {
      method: 'PATCH',
      token,
      body: {
        ...expense(alice.id, 3000, [{ userId: alice.id, percent: 0 }, { userId: bob.id, percent: 100 }]),
        id: entry.id
      }
    });

    expect(await findDebts(token)).toEqual(['bob -> alice: 3000']);
  });
});

describe('validation', () => {
  it('rejects distributions that do not add up to 100 percent', async () => {
    const { token, alice, bob } = await setupHousehold();

    const response = await request('/balance', {
      method: 'POST',
      token,
      body: expense(alice.id, 1000, [{ userId: alice.id, percent: 50 }, { userId: bob.id, percent: 40 }])
    });

    expect(response.status).toBe(400);
  });

  it('rejects an empty price', async () => {
    const { token, alice } = await setupHousehold();

    const response = await request('/balance', {
      method: 'POST',
      token,
      body: expense(alice.id, 0, [{ userId: alice.id, percent: 100 }])
    });

    expect(response.status).toBe(400);
  });
});
