import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import * as m from '$lib/paraglide/messages.js';
import type { AppEnv } from '$lib/server/api/types';
import { logout } from '$lib/server/auth';
import { findAllUsers, updateDefaultDistribution, updateUser } from '$lib/server/db/functions';
import { z } from '$lib/zod';

const userSchema = z.object({
  username: z.string().trim().min(3).max(30),
  password: z.union([z.string().nonempty().nonoptional(), z.undefined()])
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
      message: m.balance_expense_distribution_invalid_sum(),
      path: ['distributions']
    }
  );

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
