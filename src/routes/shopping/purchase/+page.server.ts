import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { resolve } from '$app/paths';
import {
  createShoppingPurchase,
  findStagedPurchaseCategoriesForOtherUsers,
  findStagedPurchaseCategoriesForUser,
  findUnstagedPurchaseItems,
  stagePurchaseItem,
  unstagePurchaseItem
} from '$lib/server/db/functions';
import type { User } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
  const userId = locals.user?.id as string;

  return {
    unstagedItemsByCategory: await findUnstagedPurchaseItems(),
    stagedItemsForUser: await findStagedPurchaseCategoriesForUser(userId),
    stagedItemsForOtherUser: await findStagedPurchaseCategoriesForOtherUsers(userId)
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
