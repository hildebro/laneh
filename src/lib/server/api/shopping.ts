import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import {
  assignCategoryToShoppingItems,
  countActiveShoppingItems,
  deactivateShoppingItems,
  deleteShoppingItems,
  fetchLastPurchaseDate,
  findAllShoppingCategories,
  moveCategoryOrderDown,
  moveCategoryOrderUp
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

const shoppingRouter = new Hono()
  .get('/activeCount', async (c) => {
    return c.json(await countActiveShoppingItems());
  })
  .get('/lastPurchaseDate', async (c) => {
    return c.json(await fetchLastPurchaseDate());
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