import { Hono } from 'hono';
import { calculateUserDebts, findAllUsers } from '$lib/server/db/functions';

const usersRouter = new Hono()
  .get('/', async (c) => {
    return c.json(await findAllUsers());
  })
  .get('/debts', async (c) => {
    return c.json(await calculateUserDebts())
  })
;

export default usersRouter;