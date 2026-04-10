import { Hono } from 'hono';
import { calculateUserDebts, findAllBalanceEntries } from '$lib/server/db/functions';

const balanceRouter = new Hono()
  .get('/', async (c) => {
    return c.json(await findAllBalanceEntries());
  })
  .get('/debts', async (c) => {
    return c.json(await calculateUserDebts());
  })
;

export default balanceRouter;