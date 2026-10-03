import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { addHousehold, call, initiate, startTestBackend } from '../helpers/backend';

const backend = await startTestBackend();

beforeEach(backend.reset);
afterAll(backend.close);

type Item = { id: string; name: string; amount: string; active: boolean; categoryId: string };
type AddResult = { committed: boolean; items: { name: string; categoryId: string | null; needsCategory: boolean }[] };

async function addCategory(token: string, name: string) {
  await call('/shopping/category', { method: 'POST', token, body: { id: null, name } });
  const categories = await call<{ id: string; name: string }[]>('/shopping/categoriesWithItems', { token });

  return categories.find((category) => category.name === name)!;
}

const addItems = (token: string, body: unknown) => call<AddResult>('/shopping/items', { method: 'POST', token, body });

describe('adding items', () => {
  it('writes nothing while an unknown item has no category', async () => {
    const token = await initiate();
    const food = await addCategory(token, 'Food');
    await addItems(token, [{ name: 'Milk', amount: '', categoryId: food.id }]);
    await call('/shopping/deactivateItems', {
      method: 'POST',
      token,
      body: { itemIds: (await call<Item[]>('/shopping/items', { token })).map((item) => item.id) }
    });

    const result = await addItems(token, [{ name: 'milk', amount: '1l' }, { name: ' Bread ', amount: '' }]);

    expect(result.committed).toBe(false);
    expect(result.items).toEqual([
      { name: 'milk', amount: '1l', categoryId: null, needsCategory: false },
      { name: 'Bread', amount: '', categoryId: null, needsCategory: true }
    ]);
    const items = await call<Item[]>('/shopping/items', { token });
    expect(items.map((item) => [item.name, item.active])).toEqual([['Milk', false]]);
  });

  it('adds new and reactivates known items once every category is set', async () => {
    const token = await initiate();
    const food = await addCategory(token, 'Food');
    await addItems(token, [{ name: 'Milk', amount: '', categoryId: food.id }]);
    await call('/shopping/deactivateItems', {
      method: 'POST',
      token,
      body: { itemIds: (await call<Item[]>('/shopping/items', { token })).map((item) => item.id) }
    });

    const result = await addItems(token, [
      { name: 'milk', amount: '1l' },
      { name: 'Bread', amount: '', categoryId: food.id },
      // The same new name twice must not create a duplicate.
      { name: 'Bread', amount: '2', categoryId: food.id }
    ]);

    expect(result.committed).toBe(true);
    const items = await call<Item[]>('/shopping/items', { token });
    expect(items.map((item) => [item.name, item.active]).sort()).toEqual([['Bread', true], ['Milk', true]]);
    expect(items.find((item) => item.name === 'Milk')!.amount).toBe('1l');
  });

  it('ignores categories of other households', async () => {
    const aliceToken = await initiate('Home', 'alice');
    const dave = await addHousehold(aliceToken, 'Other', 'dave');
    const garden = await addCategory(aliceToken, 'Garden');

    const result = await addItems(dave.token, [{ name: 'Shovel', amount: '', categoryId: garden.id }]);

    expect(result.committed).toBe(false);
    expect(result.items[0].needsCategory).toBe(true);
    expect(await call<Item[]>('/shopping/items', { token: dave.token })).toEqual([]);
  });
});

describe('names per household', () => {
  it('allows the same item and category names in different households', async () => {
    const aliceToken = await initiate('Home', 'alice');
    const dave = await addHousehold(aliceToken, 'Other', 'dave');
    const aliceFood = await addCategory(aliceToken, 'Food');
    const daveFood = await addCategory(dave.token, 'Food');

    expect((await addItems(aliceToken, [{ name: 'Milk', amount: '', categoryId: aliceFood.id }])).committed).toBe(true);
    expect((await addItems(dave.token, [{ name: 'Milk', amount: '', categoryId: daveFood.id }])).committed).toBe(true);

    expect((await call<Item[]>('/shopping/items', { token: dave.token })).map((item) => item.name)).toEqual(['Milk']);
  });
});

describe('similar items', () => {
  const findSimilar = (token: string, names: string[], locale = 'de') =>
    call<Record<string, Item | null>>('/shopping/similarItems', { method: 'POST', token, body: { names, locale } });

  async function setUpItems(names: string[]) {
    const token = await initiate();
    const food = await addCategory(token, 'Food');
    await addItems(token, names.map((name) => ({ name, amount: '', categoryId: food.id })));

    return token;
  }

  it('matches typos, plurals and accents', async () => {
    const token = await setUpItems(['Milch', 'Tomate', 'Nuss', 'Joghurt', 'Käse']);

    const result = await findSimilar(token, ['Tomaten', 'Nüsse', 'Jogurt', 'Kase', 'Bio Milch']);

    expect(Object.fromEntries(Object.entries(result).map(([name, item]) => [name, item?.name ?? null]))).toEqual({
      Tomaten: 'Tomate',
      Nüsse: 'Nuss',
      Jogurt: 'Joghurt',
      Kase: 'Käse',
      'Bio Milch': 'Milch'
    });
  });

  it('keeps exact matches and different items apart', async () => {
    const token = await setUpItems(['Eis', 'Milchreis', 'Milch']);

    const result = await findSimilar(token, ['milch', 'Reis', 'Brot']);

    expect(result).toEqual({ milch: null, Reis: null, Brot: null });
  });

  it('only matches items of the own household', async () => {
    const aliceToken = await setUpItems(['Tomate']);
    const dave = await addHousehold(aliceToken, 'Other', 'dave');

    expect(await findSimilar(dave.token, ['Tomaten'])).toEqual({ Tomaten: null });
  });
});
