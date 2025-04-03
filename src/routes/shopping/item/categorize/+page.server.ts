import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
  assignStagedItemCategory,
  commitStagedItems,
  findAllShoppingCategories,
  findStagedShoppingList
} from '$lib/server/db/functions';

export const load: PageServerLoad = async ({ locals }) => {
  const userId = locals.user?.id as string;
  const stagedList = await findStagedShoppingList(userId);
  if (!stagedList) {
    // No staged list is active, return to overview.
    return redirect(302, '../');
  }

  if (stagedList.stagedItems.some(item => item.status === 'close_match')) {
    // The staged list has some items that require validation.
    return redirect(302, 'validate');
  }

  if (!stagedList.stagedItems.some(item => item.status === 'unmatched')) {
    // Nothing to categorize, finish the staging.
    await commitStagedItems(userId);

    return redirect(302, '../');
  }

  // Fetch categories
  let categories = await findAllShoppingCategories();
  if (categories.length === 0) {
    throw new Error('Cannot categorize without categories');
  }

  return {
    items: stagedList.stagedItems,
    categories: categories
  };
};

export const actions: Actions = {
  // Default action for saving category assignments
  default: async ({ request, locals }) => {
    const userId = locals.user?.id as string;

    const formData = await request.formData();
    const itemIds = formData.getAll('itemIds').map((formValue) => formValue.toString());
    const categoryId = formData.get('categoryId')?.toString();
    if (!itemIds || !categoryId) {
      return fail(400, { message: 'Missing required data' });
    }

    await assignStagedItemCategory(itemIds, categoryId, userId);

    // Check if there are no more uncategorized items for commit.
    const stagedList = await findStagedShoppingList(userId);
    // todo add something like && item.categoryId === null)
    if (!stagedList?.stagedItems.some(item => item.status === 'unmatched')) {
      await commitStagedItems(userId);

      return redirect(302, '../');
    }

    // todo return remaining items to categorize for data refresh in the frontend
  }
};