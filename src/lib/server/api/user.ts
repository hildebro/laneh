import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import * as m from '$lib/paraglide/messages.js';
import type { AppEnv } from '$lib/server/api/types';
import { logout } from '$lib/server/auth';
import {
  addUser,
  findAllUsers,
  isUsernameTaken,
  updateDefaultDistribution,
  updateUser
} from '$lib/server/db/functions';
import { z } from '$lib/zod';

const updateSchema = z.object({
  username: z.string().trim().min(3).max(30),
  password: z.union([z.string().min(6).max(64), z.undefined()])
});

const registerSchema = z.object({
  username: z.string().trim().min(3).max(30),
  password: z.string().min(6).max(64)
});

const distributionSchema = z.array(
  z.object({
    userId: z.string().nonempty(),
    percent: z.coerce.number().positive()
  })
)
  .refine(
    (data) => {
      const total = data.reduce((sum, d) => sum + d.percent, 0);
      return Math.abs(total - 100) < 0.1;
    },
    {
      message: 'balance_expense_distribution_invalid_sum',
      path: ['distributions']
    }
  );

const usersRouter = new Hono<AppEnv>()
  .get('/', async (c) => {
    return c.json(await findAllUsers());
  })
  .put('/', zValidator('json', registerSchema), async (c) => {
    const putData = c.req.valid('json');

    if (await isUsernameTaken(putData.username)) {
      const error = new z.ZodError([
        {
          code: 'custom',
          path: ['username'],
          message: m.auth_register_error_taken()
        }
      ]);

      return c.json({ success: false, error }, 400);
    }

    await addUser(putData.username, putData.password);

    return c.json({ success: true });
  })
  .post('/update', zValidator('json', updateSchema), async (c) => {
    const updateData = c.req.valid('json');

    const user = c.get('loggedInUser');

    await updateUser(user.id, updateData.username, updateData.password);

    return c.json({ success: true });
  })
  .post(
    '/distributions',
    zValidator('json', distributionSchema),
    async (c) => {
      const distributions = c.req.valid('json');
      try {
        await updateDefaultDistribution(distributions);

        return c.json({ success: true });
      } catch {
        return c.json({ error: 'Database error' }, 500);
      }
    }
  )
  .post('/logout', async (c) => {
    await logout(c);

    return c.json({ success: true });
  })
;

export default usersRouter;
