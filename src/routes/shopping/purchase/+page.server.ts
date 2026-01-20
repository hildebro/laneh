import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { resolve } from '$app/paths';
import {
  createShoppingPurchase,
  findStagedPurchaseItems,
  stagePurchaseItem,
  unstagePurchaseItem
} from '$lib/server/db/functions';
import type { User } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
  return {
    stagedItems: await findStagedPurchaseItems()
  };
};

export const actions = {
  commit: async ({ locals }) => {
    const user = locals.user as User;

    const purchaseId = await createShoppingPurchase(user.id);
    if (!purchaseId) {
      return redirect(302, resolve('/shopping'))
    }

    return redirect(302, resolve(`/balance/add?purchaseId=${purchaseId}`));
  },
  stage: async ({ request, locals }) => {
    const formData = await request.formData();
    const itemId = formData.get('itemId')?.toString() as string;
    const user = locals.user as User;

    await stagePurchaseItem(itemId, user.id)
  },
  unstage: async ({ request, locals }) => {
    const formData = await request.formData();
    const itemId = formData.get('itemId')?.toString() as string;
    const user = locals.user as User;

    await unstagePurchaseItem(itemId, user.id)
  }
};
