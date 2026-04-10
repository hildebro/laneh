import { Hono } from 'hono';
import { findAllUsers } from '$lib/server/db/functions';

const usersRouter = new Hono()
  .get('/', async (c) => {
    return c.json(await findAllUsers());
  })
;

export default usersRouter;