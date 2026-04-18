import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { createShoppingPurchase } from '$lib/server/db/functions';
import type { User } from '$lib/server/db/schema';

export const actions = {
  commit: async ({ locals }) => {
    const user = locals.user as User;

    const purchaseId = await createShoppingPurchase(user.id);
    if (!purchaseId) {
      return redirect(302, resolve('/shopping'));
    }

    return redirect(302, resolve(`/balance/add?purchaseId=${purchaseId}`));
  },
};
