import { Hono } from 'hono';
import { calculateUserDebts } from '$lib/server/db/functions';

const balanceRouter = new Hono()
  .get('/debts', async (c) => {
    return c.json(await calculateUserDebts())
  })
;

export default balanceRouter;