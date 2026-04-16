import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import {
  assignCategoryToShoppingItems,
  countActiveShoppingItems,
  fetchLastPurchaseDate,
  findAllShoppingCategories
} from '$lib/server/db/functions';
import { z } from '$lib/zod';

const setCategorySchema = z.object({
  categoryId: z.string().nonempty(),
  itemIds: z.array(z.string()).nonempty(),
});

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
;

export default shoppingRouter;