import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import * as m from '$lib/paraglide/messages.js';
import {
  addShoppingCategory,
  assignCategoryToShoppingItems,
  countActiveShoppingItems,
  deactivateShoppingItems,
  deleteCategory,
  deleteShoppingItems,
  fetchLastPurchaseDate,
  findAllShoppingCategories,
  findShoppingCategory,
  moveCategoryOrderDown,
  moveCategoryOrderUp,
  updateShoppingCategory
} from '$lib/server/db/functions';
import { z } from '$lib/zod';

const setCategorySchema = z.object({
  categoryId: z.string().nonempty(),
  itemIds: z.array(z.string()).nonempty(),
});

const itemActionSchema = z.object({
  itemIds: z.array(z.string()).nonempty()
});

const categoryActionSchema = z.object({
  categoryId: z.string().nonempty(),
})

const categorySchema = z.object({
  id: z.union([z.string().nonempty(), z.null()]),
  name: z.string().nonempty(),
})

const shoppingRouter = new Hono()
  .get('/activeCount', async (c) => {
    return c.json(await countActiveShoppingItems());
  })
  .get('/lastPurchaseDate', async (c) => {
    return c.json(await fetchLastPurchaseDate());
  })
  .post('/category', zValidator('json', categorySchema), async (c) => {
    const category = c.req.valid('json');

    if (!category.id) {
      await addShoppingCategory(category.name);
    } else {
      await updateShoppingCategory(category.id, category.name)
    }

    return c.json(category);
  })
  .delete('/category/:id', async (c) => {
    const categoryId = c.req.param('id');
    const category = await findShoppingCategory(categoryId);
    if (!category) {
      return c.json({ error: m.error_category_not_found()}, 404);
    }

    if (category.shoppingItems.length > 0) {
      const error = new z.ZodError([
        {
          code: 'custom',
          path: ['name'],
          message: m.settings_categories_delete_invalid()
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
  .post('/setItemCategory', zValidator('json', setCategorySchema), async (c) => {
    const setCategory = c.req.valid('json');

    await assignCategoryToShoppingItems(setCategory.itemIds, setCategory.categoryId);

    return c.json({ success: true });
  })
  .post('/deactivateItems', zValidator('json', itemActionSchema), async (c) => {
    const action = c.req.valid('json');

    await deactivateShoppingItems(action.itemIds);

    return c.json({ success: true});
  })
  .post('/deleteItems', zValidator('json', itemActionSchema), async (c) => {
    const action = c.req.valid('json');

    await deleteShoppingItems(action.itemIds);

    return c.json({ success: true});
  })
  .post('/moveCategoryUp', zValidator('json', categoryActionSchema), async (c) => {
    const action = c.req.valid('json');

    await moveCategoryOrderUp(action.categoryId);

    return c.json({ success: true});
  })
  .post('/moveCategoryDown', zValidator('json', categoryActionSchema), async (c) => {
    const action = c.req.valid('json');

    await moveCategoryOrderDown(action.categoryId);

    return c.json({ success: true});
  })
;

export default shoppingRouter;