import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { resolve } from '$app/paths';
import {
  createShoppingPurchase,
  findActiveItemsByCategory,
  stagePurchaseItem,
  unstagePurchaseItem
} from '$lib/server/db/functions';
import type { User } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
  const userId = locals.user?.id as string;
  const categories = await findActiveItemsByCategory();

  // Initialize output structures
  const unstagedItemsByCategory = [];
  const stagedItemsForUser = [];
  const stagedItemsForOtherUsers = [];

  for (const category of categories) {
    const currentCategoryUnstaged = [];

    for (const item of category.shoppingItems) {
      if (!item.stagedPurchase) {
        currentCategoryUnstaged.push(item);
      } else if (item.stagedPurchase.userId === userId) {
        stagedItemsForUser.push(item);
      } else {
        stagedItemsForOtherUsers.push(item);
      }
    }

    if (currentCategoryUnstaged.length > 0) {
      unstagedItemsByCategory.push({
        id: category.id,
        name: category.name,
        shoppingItems: currentCategoryUnstaged
      });
    }
  }

  return {
    unstagedItemsByCategory,
    stagedItemsForUser,
    stagedItemsForOtherUsers
  };
};

export const actions = {
  commit: async ({ locals }) => {
    const user = locals.user as User;

    const purchaseId = await createShoppingPurchase(user.id);
    if (!purchaseId) {
      return redirect(302, resolve('/shopping'));
    }

    return redirect(302, resolve(`/balance/add?purchaseId=${purchaseId}`));
  },
  stage: async ({ request, locals }) => {
    const formData = await request.formData();
    const itemId = formData.get('itemId')?.toString() as string;
    const user = locals.user as User;

    await stagePurchaseItem(itemId, user.id);
  },
  unstage: async ({ request, locals }) => {
    const formData = await request.formData();
    const itemId = formData.get('itemId')?.toString() as string;
    const user = locals.user as User;

    await unstagePurchaseItem(itemId, user.id);
  }
};
