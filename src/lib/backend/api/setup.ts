import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import type { AppEnv } from '$lib/backend/api/types';
import {
  addDefaultShoppingCategories,
  completeHouseholdSetup,
  isHouseholdSetupCompleted
} from '$lib/backend/db/functions';
import * as m from '$lib/paraglide/messages.js';
import { locales } from '$lib/paraglide/runtime.js';
import { z } from '$lib/zod';

const setupSchema = z.object({
  categoryLocale: z.enum(locales)
});

// Categories resembling the aisles of a typical supermarket, roughly in the order they are walked through.
const defaultCategoryMessages = [
  m.initiate_category_fruit_vegetables,
  m.initiate_category_bakery,
  m.initiate_category_meat_fish,
  m.initiate_category_dairy,
  m.initiate_category_chilled,
  m.initiate_category_breakfast,
  m.initiate_category_pasta_rice,
  m.initiate_category_canned,
  m.initiate_category_baking,
  m.initiate_category_spices_sauces,
  m.initiate_category_coffee_tea,
  m.initiate_category_sweets_snacks,
  m.initiate_category_drinks,
  m.initiate_category_alcohol,
  m.initiate_category_frozen,
  m.initiate_category_toiletries,
  m.initiate_category_household,
  m.initiate_category_pets
];

const setupRouter = new Hono<AppEnv>()
  // Any member of the household can complete the setup, since it only decides on the language of the categories.
  .get('/', async (c) => {
    const loggedInUser = c.get('loggedInUser');

    return c.json({ completed: await isHouseholdSetupCompleted(loggedInUser.householdId) });
  })
  .post('/', zValidator('json', setupSchema), async (c) => {
    const loggedInUser = c.get('loggedInUser');
    if (await isHouseholdSetupCompleted(loggedInUser.householdId)) {
      return c.json({ success: false }, 405);
    }

    const { categoryLocale } = c.req.valid('json');

    await addDefaultShoppingCategories(
      loggedInUser.householdId,
      defaultCategoryMessages.map((message) => message({}, { locale: categoryLocale }))
    );
    await completeHouseholdSetup(loggedInUser.householdId);

    return c.json({ success: true });
  });

export default setupRouter;
