import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import type { AppEnv } from '$lib/backend/api/types';
import {
  addNotification,
  addShoppingCategory,
  addShoppingItems,
  assignCategoryToShoppingItems,
  countActiveShoppingItems,
  createShoppingItem,
  createShoppingPurchase,
  deactivateShoppingItems,
  deleteCategory,
  deleteShoppingItems,
  dismissShoppingItemMergeCandidates,
  fetchLastPurchaseDate,
  findActiveItemsByCategory,
  findAllPurchases,
  findAllShoppingCategories,
  findAllShoppingItems,
  findShoppingCategory,
  findShoppingItem,
  findShoppingItemById,
  findShoppingItemMergeCandidates,
  findShoppingItemWithSynonym,
  findSimilarShoppingItems,
  findTakenSynonym,
  getItemAddSuggestions,
  mergeShoppingItems,
  moveCategoryOrderDown,
  moveCategoryOrderUp,
  stagePurchaseItem,
  unstagePurchaseItem,
  updateShoppingCategory,
  updateShoppingItem
} from '$lib/backend/db/functions';
import { isLocalRuntime } from '$lib/backend/runtime';
import * as m from '$lib/paraglide/messages.js';
import { locales } from '$lib/paraglide/runtime.js';
import { z } from '$lib/zod';

const setCategorySchema = z.object({
  categoryId: z.string().nonempty(),
  itemIds: z.array(z.string()).nonempty()
});

const itemActionSchema = z.object({
  itemIds: z.array(z.string()).nonempty()
});

const categoryActionSchema = z.object({
  categoryId: z.string().nonempty()
});

const categorySchema = z.object({
  id: z.union([z.string().nonempty(), z.null()]),
  name: z.string().nonempty()
});

const itemsSchema = z.array(z.object({
  amount: z.string().trim(),
  name: z.string().trim(),
  categoryId: z.string().nullish()
}))
  .transform((data) => {
    return data
      .filter(item => item.name.length > 0);
  })
  .refine(
    (data) => {
      return data.length > 0;
    },
    {
      message: 'shopping_add_items_empty',
      path: ['form']
    }
  );

const similarItemsSchema = z.object({
  names: z.array(z.string().trim().nonempty()),
  locale: z.enum(locales)
});

// Empty entries are dropped and duplicates (ignoring case) only kept once.
const synonymsSchema = z.array(z.string().trim())
  .transform((synonyms) => synonyms.filter((synonym, index) => synonym.length > 0
    && synonyms.findIndex((other) => other.toLowerCase() === synonym.toLowerCase()) === index));

const itemSchema = z.object({
  id: z.union([z.string().nonempty(), z.null()]),
  name: z.string().trim().nonempty(),
  // Only needed for new items, existing ones are moved in the categorization settings.
  categoryId: z.string().nullish(),
  synonyms: synonymsSchema
});

// Same as the unaccent(lower()) comparison in the database, e.g. "Möhre" and "mohre" are the same.
const normalizeName = (name: string) => name.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

/**
 * Item names and synonyms are unique together across a household. Checks the name and synonyms meant for the given items
 * against all other items. Returns the error to respond with, if they collide.
 */
async function validateItemNames(name: string, synonyms: string[], ownItemIds: string[]) {
  const sameName = await findShoppingItem(name);
  if (sameName && !ownItemIds.includes(sameName.id)) {
    return formError('name', 'settings_items_name_taken', { name: sameName.name });
  }

  const synonymItem = await findShoppingItemWithSynonym(name, ownItemIds);
  if (synonymItem) {
    return formError('name', 'settings_items_name_is_synonym', { name, item: synonymItem.name });
  }

  const ownName = synonyms.find((synonym) => normalizeName(synonym) === normalizeName(name));
  const taken = ownName ? { synonym: ownName, item: name } : await findTakenSynonym(ownItemIds, synonyms);
  if (taken) {
    return formError('synonyms', 'settings_items_synonym_taken', taken);
  }

  return null;
}

function formError(path: string, message: string, params?: Record<string, string>) {
  return new z.ZodError([{ code: 'custom', path: [path], message, params }]);
}

const mergeCandidatesSchema = z.object({
  locale: z.enum(locales)
});

// Too few items are reported as a form error, since they are picked via checkboxes.
const mergeItemsSchema = z.object({
  itemIds: z.array(z.string().nonempty()),
  // The merged items live on in the one with this id, but get the name and synonyms below.
  mainItemId: z.string().nonempty(),
  name: z.string().trim().nonempty(),
  synonyms: synonymsSchema,
  categoryId: z.string().nonempty()
});

const stagingItemSchema = z.object({
  itemId: z.string().nonempty()
})

const shoppingRouter = new Hono<AppEnv>()
  .get('/activeCount', async (c) => {
    return c.json(await countActiveShoppingItems());
  })
  .get('/lastPurchaseDate', async (c) => {
    return c.json(await fetchLastPurchaseDate());
  })
  .get('/hasNoCategories', async (c) => {
    const categories = await findAllShoppingCategories();

    return c.json(categories.length === 0);
  })
  .post('/category', zValidator('json', categorySchema), async (c) => {
    const category = c.req.valid('json');

    if (!category.id) {
      await addShoppingCategory(category.name);
    } else {
      await updateShoppingCategory(category.id, category.name);
    }

    return c.json(category);
  })
  .delete('/category/:id', async (c) => {
    const categoryId = c.req.param('id');
    const category = await findShoppingCategory(categoryId);
    if (!category) {
      return c.json({ error: m.error_category_not_found() }, 404);
    }

    if (category.shoppingItems.length > 0) {
      const error = new z.ZodError([
        {
          code: 'custom',
          path: ['form'],
          message: 'settings_categories_delete_invalid'
        }
      ]);

      return c.json({ success: false, error }, 400);
    }

    await deleteCategory(categoryId);

    return c.json(category);
  })
  .get('/category/:id', async (c) => {
    const categoryId = c.req.param('id');
    const category = await findShoppingCategory(categoryId);
    if (!category) {
      return c.json({ error: m.error_category_not_found() }, 404);
    }

    return c.json(category);
  })
  .get('/categoriesWithItems', async (c) => {
    return c.json(await findAllShoppingCategories());
  })
  .get('/categoriesWithActiveItems', async (c) => {
    return c.json(await findActiveItemsByCategory());
  })
  .get('/items', async (c) => {
    return c.json(await findAllShoppingItems());
  })
  .post('/items', zValidator('json', itemsSchema), async (c) => {
    const items = c.req.valid('json');

    // A reverted correction may leave a name that is another item's synonym. Existing names are fine, they are the item.
    for (const { name } of items) {
      const synonymItem = !(await findShoppingItem(name)) && await findShoppingItemWithSynonym(name);
      if (synonymItem) {
        const error = formError('form', 'shopping_add_items_synonym_taken', { name, item: synonymItem.name });

        return c.json({ success: false, error }, 400);
      }
    }

    return c.json({ success: true, ...(await addShoppingItems(items)) });
  })
  .post('/similarItems', zValidator('json', similarItemsSchema), async (c) => {
    const { names, locale } = c.req.valid('json');

    return c.json(await findSimilarShoppingItems(names, locale));
  })
  .get('/itemSuggestions', async (c) => {
    return c.json(await getItemAddSuggestions());
  })
  .post('/setItemCategory', zValidator('json', setCategorySchema), async (c) => {
    const setCategory = c.req.valid('json');

    await assignCategoryToShoppingItems(setCategory.itemIds, setCategory.categoryId);

    return c.json({ success: true });
  })
  .get('/item/:id', async (c) => {
    const item = await findShoppingItemById(c.req.param('id'));
    if (!item) {
      return c.json({ error: m.error_item_not_found() }, 404);
    }

    return c.json(item);
  })
  .post('/item', zValidator('json', itemSchema), async (c) => {
    const { id, name, categoryId, synonyms } = c.req.valid('json');

    const error = await validateItemNames(name, synonyms, id ? [id] : []);
    if (error) {
      return c.json({ success: false, error }, 400);
    }

    if (id) {
      if (!(await findShoppingItemById(id))) {
        return c.json({ error: m.error_item_not_found() }, 404);
      }

      await updateShoppingItem(id, name, synonyms);
    } else {
      if (!categoryId || !(await findShoppingCategory(categoryId))) {
        return c.json({ success: false, error: formError('categoryId', 'form_invalid_nonempty') }, 400);
      }

      await createShoppingItem(categoryId, name, synonyms);
    }

    return c.json({ success: true });
  })
  .get('/mergeCandidates', zValidator('query', mergeCandidatesSchema), async (c) => {
    return c.json(await findShoppingItemMergeCandidates(c.req.valid('query').locale));
  })
  .post('/mergeItems', zValidator('json', mergeItemsSchema), async (c) => {
    const { itemIds, mainItemId, name, synonyms, categoryId } = c.req.valid('json');

    const uniqueItemIds = [...new Set(itemIds)];
    if (uniqueItemIds.length < 2 || !uniqueItemIds.includes(mainItemId)) {
      return c.json({ success: false, error: formError('form', 'settings_items_merge_invalid') }, 400);
    }
    for (const itemId of uniqueItemIds) {
      if (!(await findShoppingItemById(itemId))) {
        return c.json({ error: m.error_item_not_found() }, 404);
      }
    }
    if (!(await findShoppingCategory(categoryId))) {
      return c.json({ error: m.error_category_not_found() }, 404);
    }

    const error = await validateItemNames(name, synonyms, uniqueItemIds);
    if (error) {
      return c.json({ success: false, error }, 400);
    }

    const otherItemIds = uniqueItemIds.filter((itemId) => itemId !== mainItemId);
    await mergeShoppingItems(mainItemId, otherItemIds, { name, synonyms, categoryId });

    return c.json({ success: true });
  })
  .post('/dismissMergeCandidates', zValidator('json', itemActionSchema), async (c) => {
    const { itemIds } = c.req.valid('json');
    // Foreign keys ignore row level security, so items of other households have to be ruled out here.
    for (const itemId of itemIds) {
      if (!(await findShoppingItemById(itemId))) {
        return c.json({ error: m.error_item_not_found() }, 404);
      }
    }

    await dismissShoppingItemMergeCandidates(itemIds);

    return c.json({ success: true });
  })
  .post('/deactivateItems', zValidator('json', itemActionSchema), async (c) => {
    const action = c.req.valid('json');

    await deactivateShoppingItems(action.itemIds);

    return c.json({ success: true });
  })
  .post('/deleteItems', zValidator('json', itemActionSchema), async (c) => {
    const action = c.req.valid('json');

    await deleteShoppingItems(action.itemIds);

    return c.json({ success: true });
  })
  .post('/moveCategoryUp', zValidator('json', categoryActionSchema), async (c) => {
    const action = c.req.valid('json');

    await moveCategoryOrderUp(action.categoryId);

    return c.json({ success: true });
  })
  .post('/moveCategoryDown', zValidator('json', categoryActionSchema), async (c) => {
    const action = c.req.valid('json');

    await moveCategoryOrderDown(action.categoryId);

    return c.json({ success: true });
  })
  .get('/purchases', async (c) => {
    return c.json(await findAllPurchases())
  })
  .get('/activePurchase', async (c) => {
    const loggedInUser = c.get('loggedInUser');

    const categories = await findActiveItemsByCategory();

    const unstagedItemsByCategory = [];
    const stagedItemsForUser = [];
    const stagedItemsForOtherUsers = [];

    for (const category of categories) {
      const currentCategoryUnstaged = [];

      for (const item of category.shoppingItems) {
        if (!item.stagedPurchase) {
          currentCategoryUnstaged.push(item);
        } else if (item.stagedPurchase.userId === loggedInUser.id) {
          stagedItemsForUser.push(item);
        } else {
          stagedItemsForOtherUsers.push(item);
        }
      }

      if (currentCategoryUnstaged.length > 0) {
        unstagedItemsByCategory.push({
          id: category.id,
          name: category.name,
          shoppingItems: currentCategoryUnstaged
        });
      }
    }

    return c.json({
      unstagedItemsByCategory,
      stagedItemsForUser,
      stagedItemsForOtherUsers
    });
  })
  .post('/stagePurchaseItem', zValidator('json', stagingItemSchema), async (c) => {
    const data = c.req.valid('json');
    const loggedInUser = c.get('loggedInUser');

    await stagePurchaseItem(data.itemId, loggedInUser.id);

    return c.json({ success: true });
  })
  .post('/unstagePurchaseItem', zValidator('json', stagingItemSchema), async (c) => {
    const data = c.req.valid('json');
    const loggedInUser = c.get('loggedInUser');

    await unstagePurchaseItem(data.itemId, loggedInUser.id);

    return c.json({ success: true });
  })
  .post('/commitPurchase', async (c) => {
    const loggedInUser = c.get('loggedInUser');

    const purchase = await createShoppingPurchase(loggedInUser.id);
    // Nobody else to notify in the single person local app.
    if (purchase && !isLocalRuntime()) {
      await addNotification('purchase_made', loggedInUser.id, purchase.itemNames.join(', '));
    }

    return c.json({ success: true, purchaseId: purchase?.purchaseId ?? null });
  })
;

export default shoppingRouter;
