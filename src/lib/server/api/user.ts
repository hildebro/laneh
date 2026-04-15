import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import type { AppEnv } from '$lib/server/api/types';
import { findAllUsers, updateUser } from '$lib/server/db/functions';
import { z } from '$lib/zod';

const userSchema = z.object({
  username: z.string().trim().min(3).max(30),
  password: z.union([z.string().nonempty().nonoptional(), z.undefined()]),
});

const usersRouter = new Hono<AppEnv>()
  .get('/', async (c) => {
    return c.json(await findAllUsers());
  })
  .post('/update', zValidator('json', userSchema), async (c) => {
    const updateData = c.req.valid('json');

    const user = c.get('loggedInUser');

    await updateUser(user.id, updateData.username, updateData.password);

    return c.json({ success: true });
  })
;

export default usersRouter;
