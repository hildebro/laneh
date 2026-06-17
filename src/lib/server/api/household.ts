import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import type { AppEnv } from '$lib/server/api/types';
import { addHousehold, findAllHouseholds, findHousehold, updateHousehold } from '$lib/server/db/functions';
import { z } from '$lib/zod';

const householdSchema = z.object({
  id: z.union([z.string().nonempty(), z.null()]),
  name: z.string().nonempty()
});

const householdRouter = new Hono<AppEnv>()
  .get('/', async (c) => {
    const loggedInUser = c.get('loggedInUser');
    if (!loggedInUser.admin) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    return c.json(await findAllHouseholds());
  })
  .get('/:id', async (c) => {
    const householdId = c.req.param('id');

    return c.json(await findHousehold(householdId));
  })
  .post('/', zValidator('json', householdSchema), async (c) => {
    const loggedInUser = c.get('loggedInUser');
    if (!loggedInUser.admin) {
      return c.json({ success: false }, 403);
    }

    const household = c.req.valid('json');

    if (!household.id) {
      await addHousehold(household.name);
    } else {
      await updateHousehold(household.id, household.name);
    }

    return c.json({ success: true });
  });

export default householdRouter;
