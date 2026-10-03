import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { addHousehold, call, initiate, request, startTestBackend } from '../helpers/backend';

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

describe('item settings', () => {
  type ItemWithSynonyms = Item & { synonyms: string[] };

  const saveItem = (token: string, body: { id: string | null; name: string; categoryId?: string; synonyms: string[] }) =>
    request('/shopping/item', { method: 'POST', token, body });
  const findSimilar = (token: string, names: string[]) =>
    call<Record<string, Item | null>>('/shopping/similarItems', { method: 'POST', token, body: { names, locale: 'de' } });
  const similarNames = async (token: string, names: string[]) =>
    Object.fromEntries(Object.entries(await findSimilar(token, names)).map(([name, item]) => [name, item?.name ?? null]));

  async function setUpItems(names: string[]) {
    const token = await initiate();
    const food = await addCategory(token, 'Food');
    if (names.length > 0) {
      await addItems(token, names.map((name) => ({ name, amount: '', categoryId: food.id })));
    }
    const items = await call<Item[]>('/shopping/items', { token });

    return { token, food, item: (name: string) => items.find((item) => item.name === name)! };
  }

  it('creates inactive items with synonyms', async () => {
    const { token, food } = await setUpItems([]);

    const response = await saveItem(token, { id: null, name: 'Karotte', categoryId: food.id, synonyms: ['Möhre'] });

    expect(response.status).toBe(200);
    const items = await call<ItemWithSynonyms[]>('/shopping/items', { token });
    expect(items.map((item) => [item.name, item.categoryId, item.active, item.synonyms]))
      .toEqual([['Karotte', food.id, false, ['Möhre']]]);
  });

  it('requires a category for new items', async () => {
    const { token } = await setUpItems([]);

    expect((await saveItem(token, { id: null, name: 'Karotte', synonyms: [] })).status).toBe(400);
  });

  it('renames items and cleans up their synonyms', async () => {
    const { token, item } = await setUpItems(['Karrote']);

    await saveItem(token, { id: item('Karrote').id, name: 'Karotte', synonyms: [' Möhre ', '', 'möhre', 'Mohrrübe'] });

    const updated = await call<ItemWithSynonyms>(`/shopping/item/${item('Karrote').id}`, { token });
    expect([updated.name, updated.synonyms]).toEqual(['Karotte', ['Möhre', 'Mohrrübe']]);
  });

  it('rejects names of other items', async () => {
    const { token, item } = await setUpItems(['Karotte', 'Gurke']);

    expect((await saveItem(token, { id: item('Gurke').id, name: 'karotte', synonyms: [] })).status).toBe(400);
    // Changing the case of the own name is fine.
    expect((await saveItem(token, { id: item('Gurke').id, name: 'gurke', synonyms: [] })).status).toBe(200);
  });

  it('rejects names that are synonyms of other items', async () => {
    const { token, food, item } = await setUpItems(['Karotte', 'Gurke']);
    await saveItem(token, { id: item('Karotte').id, name: 'Karotte', synonyms: ['Möhre'] });

    expect((await saveItem(token, { id: item('Gurke').id, name: 'mohre', synonyms: [] })).status).toBe(400);
    expect((await saveItem(token, { id: null, name: 'Möhre', categoryId: food.id, synonyms: [] })).status).toBe(400);
  });

  it('rejects new items named like a synonym, even with a category', async () => {
    const { token, food, item } = await setUpItems(['Karotte']);
    await saveItem(token, { id: item('Karotte').id, name: 'Karotte', synonyms: ['Möhre'] });

    const response = await request('/shopping/items', {
      method: 'POST',
      token,
      body: [{ name: 'Gurke', amount: '' }, { name: 'möhre', amount: '', categoryId: food.id }]
    });

    expect(response.status).toBe(400);
    expect(JSON.parse((await response.json()).error.message)).toEqual([expect.objectContaining({
      path: ['form'],
      message: 'shopping_add_items_synonym_taken',
      params: { name: 'möhre', item: 'Karotte' }
    })]);
    expect((await call<Item[]>('/shopping/items', { token })).map((item) => item.name)).toEqual(['Karotte']);
    // The item itself can still be added.
    expect((await addItems(token, [{ name: 'Karotte', amount: '' }])).committed).toBe(true);
  });

  it('rejects synonyms that are item names or synonyms of other items', async () => {
    const { token, item } = await setUpItems(['Karotte', 'Möhre', 'Klopapier']);
    await saveItem(token, { id: item('Klopapier').id, name: 'Klopapier', synonyms: ['Toilettenpapier'] });

    const status = async (synonyms: string[]) =>
      (await saveItem(token, { id: item('Karotte').id, name: 'Karotte', synonyms })).status;

    expect(await status(['MÖHRE'])).toBe(400);
    expect(await status(['karotte'])).toBe(400);
    expect(await status(['Toilettenpapier'])).toBe(400);
    // The own synonyms can be saved again.
    expect(await status(['Rübe'])).toBe(200);
    expect(await status(['Rübe', 'Mohrrübe'])).toBe(200);
  });

  it('corrects synonyms, their plurals and accents to the item', async () => {
    const { token, item } = await setUpItems(['Karotte', 'Toilettenpapier']);
    await saveItem(token, { id: item('Karotte').id, name: 'Karotte', synonyms: ['Möhre'] });
    await saveItem(token, { id: item('Toilettenpapier').id, name: 'Toilettenpapier', synonyms: ['Klopapier'] });

    expect(await similarNames(token, ['möhre', 'Möhren', 'Mohre', 'Klopapier', 'Gurke'])).toEqual({
      möhre: 'Karotte',
      Möhren: 'Karotte',
      Mohre: 'Karotte',
      Klopapier: 'Toilettenpapier',
      Gurke: null
    });
  });

  it('only finds items of the own household', async () => {
    const { token, item } = await setUpItems(['Karotte']);
    const dave = await addHousehold(token, 'Other', 'dave');

    expect((await request(`/shopping/item/${item('Karotte').id}`, { token: dave.token })).status).toBe(404);
    expect((await saveItem(dave.token, { id: item('Karotte').id, name: 'Gurke', synonyms: [] })).status).toBe(404);
  });
});
