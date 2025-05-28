import { redirect } from '@sveltejs/kit';
import { createPurchase } from '$lib/server/db/functions';
import type { User } from '$lib/server/db/schema';
import { processForm } from '$lib/server/formHandler';
import { z } from '$lib/zod';

const purchaseSchema = z.object({
  itemIds: z.transform((val: string) => {
    if (!val || val === '') {
      return [];
    }

    return val.split(',');
  }).pipe(z.array(z.string().nonempty()))
});

export const actions = {
  default: async (event) => {
    return processForm(event, purchaseSchema, async (purchase, { locals }) => {
      const user = locals.user as User;

      if (purchase.itemIds.length > 0) {
        await createPurchase(user, purchase.itemIds);
      }

      return redirect(302, '../shopping');
    });
  }
};
