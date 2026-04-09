import { Hono } from 'hono';
import { countActiveShoppingItems, fetchLastPurchaseDate } from '$lib/server/db/functions';

const shoppingRouter = new Hono()
  .get('/activeCount', async (c) => {
    return c.json(await countActiveShoppingItems());
  })
  .get('/lastPurchaseDate', async (c) => {
    return c.json(await fetchLastPurchaseDate());
  })
;

export default shoppingRouter;