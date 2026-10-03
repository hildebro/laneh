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

describe('merging items', () => {
  type Candidate = Item & { synonyms: string[] };
  type Purchase = { id: string; shoppingItems: { itemId: string }[] };

  const candidates = (token: string) => call<Candidate[][]>('/shopping/mergeCandidates?locale=de', { token });
  const groupNames = async (token: string) => (await candidates(token)).map((group) => group.map((item) => item.name));
  const items = (token: string) => call<(Item & { synonyms: string[] })[]>('/shopping/items', { token });
  const itemId = async (token: string, name: string) => (await items(token)).find((item) => item.name === name)!.id;
  type MergeBody = { itemIds: string[]; mainItemId: string; name: string; synonyms: string[]; categoryId: string };
  const merge = (token: string, body: MergeBody) =>
    request('/shopping/mergeItems', { method: 'POST', token, body });

  // Puts the items on the list, stages all of them and commits the purchase.
  async function purchase(token: string, names: string[], categoryId: string) {
    await addItems(token, names.map((name) => ({ name, amount: '', categoryId })));
    for (const name of names) {
      await call('/shopping/stagePurchaseItem', { method: 'POST', token, body: { itemId: await itemId(token, name) } });
    }
    await call('/shopping/commitPurchase', { method: 'POST', token });
  }

  it('groups similar items, also via synonyms', async () => {
    const token = await initiate();
    const food = await addCategory(token, 'Food');
    await addItems(token, ['Tomate', 'Tomaten', 'Tomatte', 'Milch', 'Milchreis', 'Karotte', 'Möhren']
      .map((name) => ({ name, amount: '', categoryId: food.id })));
    await call('/shopping/item', {
      method: 'POST',
      token,
      body: { id: await itemId(token, 'Karotte'), name: 'Karotte', synonyms: ['Möhre'] }
    });

    expect(await groupNames(token)).toEqual([['Karotte', 'Möhren'], ['Tomate', 'Tomaten', 'Tomatte']]);
  });

  it('stops suggesting items marked as different', async () => {
    const token = await initiate();
    const food = await addCategory(token, 'Food');
    await addItems(token, ['Nuss', 'Nüsse'].map((name) => ({ name, amount: '', categoryId: food.id })));

    const [group] = await candidates(token);
    await call('/shopping/dismissMergeCandidates', {
      method: 'POST',
      token,
      body: { itemIds: group.map((item) => item.id) }
    });

    expect(await candidates(token)).toEqual([]);
  });

  it('moves purchases, names and the list state into the main item', async () => {
    const token = await initiate();
    const bathroom = await addCategory(token, 'Bathroom');
    const misc = await addCategory(token, 'Misc');
    for (let i = 0; i < 5; i++) {
      await purchase(token, ['Toilettenpapier'], bathroom.id);
    }
    for (let i = 0; i < 4; i++) {
      await purchase(token, ['Klopapier'], misc.id);
    }
    // Bought together once, which has to count as one purchase afterward.
    await purchase(token, ['Toilettenpapier', 'Klopapier'], bathroom.id);
    await addItems(token, [{ name: 'Klopapier', amount: '2' }]);
    const mainItemId = await itemId(token, 'Toilettenpapier');
    const otherItemId = await itemId(token, 'Klopapier');
    await call('/shopping/item', { method: 'POST', token, body: { id: otherItemId, name: 'Klopapier', synonyms: ['WC-Papier'] } });

    const response = await merge(token, {
      itemIds: [mainItemId, otherItemId],
      mainItemId,
      name: 'Toilettenpapier',
      synonyms: ['Klopapier', 'WC-Papier'],
      categoryId: misc.id
    });

    expect(response.status).toBe(200);
    expect((await items(token)).map((item) => [item.name, item.categoryId, item.active, item.amount, item.synonyms]))
      .toEqual([['Toilettenpapier', misc.id, true, '2', ['Klopapier', 'WC-Papier']]]);
    const purchases = await call<Purchase[]>('/shopping/purchases', { token });
    expect(purchases).toHaveLength(10);
    expect(purchases.every((entry) => entry.shoppingItems.length === 1 && entry.shoppingItems[0].itemId === mainItemId))
      .toBe(true);
    // The stats are recalculated right away: 5 + 4 + 1 shared purchase.
    await call('/shopping/deactivateItems', { method: 'POST', token, body: { itemIds: [mainItemId] } });
    const suggestions = await call<{ name: string; purchaseCount: number }[]>('/shopping/itemSuggestions', { token });
    expect(suggestions.map((suggestion) => [suggestion.name, suggestion.purchaseCount])).toEqual([['Toilettenpapier', 10]]);
  });

  it('keeps a staged item staged', async () => {
    const token = await initiate();
    const food = await addCategory(token, 'Food');
    await addItems(token, ['Nuss', 'Nüsse'].map((name) => ({ name, amount: '', categoryId: food.id })));
    const otherItemId = await itemId(token, 'Nüsse');
    await call('/shopping/stagePurchaseItem', { method: 'POST', token, body: { itemId: otherItemId } });

    const nuss = await itemId(token, 'Nuss');
    await merge(token, { itemIds: [nuss, otherItemId], mainItemId: nuss, name: 'Nuss', synonyms: [], categoryId: food.id });

    const activePurchase = await call<{ stagedItemsForUser: { name: string }[] }>('/shopping/activePurchase', { token });
    expect(activePurchase.stagedItemsForUser.map((item) => item.name)).toEqual(['Nuss']);
  });

  it('drops a typo, keeping its purchases', async () => {
    const token = await initiate();
    const food = await addCategory(token, 'Food');
    await purchase(token, ['Jogurt'], food.id);
    await purchase(token, ['Joghurt'], food.id);
    const typo = await itemId(token, 'Jogurt');
    const joghurt = await itemId(token, 'Joghurt');

    // The typo lives on under the correct name, which is the other item's.
    const response = await merge(token, {
      itemIds: [typo, joghurt],
      mainItemId: typo,
      name: 'Joghurt',
      synonyms: [],
      categoryId: food.id
    });

    expect(response.status).toBe(200);
    expect((await items(token)).map((item) => [item.id, item.name, item.synonyms])).toEqual([[typo, 'Joghurt', []]]);
    const purchases = await call<Purchase[]>('/shopping/purchases', { token });
    expect(purchases.map((entry) => entry.shoppingItems.map((item) => item.itemId))).toEqual([[typo], [typo]]);
  });

  it('rejects names and synonyms of items outside the merge', async () => {
    const token = await initiate();
    const food = await addCategory(token, 'Food');
    await addItems(token, ['Nuss', 'Nüsse', 'Mandel'].map((name) => ({ name, amount: '', categoryId: food.id })));
    const nuss = await itemId(token, 'Nuss');
    const itemIds = [nuss, await itemId(token, 'Nüsse')];
    const status = async (name: string, synonyms: string[]) =>
      (await merge(token, { itemIds, mainItemId: nuss, name, synonyms, categoryId: food.id })).status;

    expect(await status('Mandel', [])).toBe(400);
    expect(await status('Nuss', ['mandel'])).toBe(400);
    expect(await status('Nuss', ['nuss'])).toBe(400);
    // The names of the merged items are free to use.
    expect(await status('Nüsse', ['Nuss'])).toBe(200);
  });

  it('rejects merges without other items and items of other households', async () => {
    const token = await initiate('Home', 'alice');
    const food = await addCategory(token, 'Food');
    await addItems(token, ['Nuss', 'Nüsse'].map((name) => ({ name, amount: '', categoryId: food.id })));
    const nuss = await itemId(token, 'Nuss');
    const dave = await addHousehold(token, 'Other', 'dave');
    const daveFood = await addCategory(dave.token, 'Food');
    await addItems(dave.token, [{ name: 'Nuss', amount: '', categoryId: daveFood.id }]);
    const body = { name: 'Nuss', synonyms: [], categoryId: food.id };

    expect((await merge(token, { ...body, itemIds: [nuss], mainItemId: nuss })).status).toBe(400);
    expect((await merge(token, { ...body, itemIds: [nuss, nuss], mainItemId: nuss })).status).toBe(400);
    const daveNuss = await itemId(dave.token, 'Nuss');
    expect((await merge(dave.token, {
      ...body,
      itemIds: [daveNuss, await itemId(token, 'Nüsse')],
      mainItemId: daveNuss,
      categoryId: daveFood.id
    })).status).toBe(404);
    expect((await request('/shopping/dismissMergeCandidates', {
      method: 'POST',
      token: dave.token,
      body: { itemIds: [nuss] }
    })).status).toBe(404);
    expect((await items(token)).map((item) => item.name).sort()).toEqual(['Nuss', 'Nüsse']);
  });
});
