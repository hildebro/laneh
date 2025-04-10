import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
  assignCategoryToStagedItems,
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
    // Nothing unmatched items to categorize, meaning only perfect matches. Finish the staging.
    await commitStagedItems(userId);

    return redirect(302, '../');
  }

  if (
    !stagedList.stagedItems.filter(item => item.status === 'unmatched')
      .some(item => item.selectedCategoryId === null)
  ) {
    // All items that need categorizing have gotten it. Finish the staging.
    await commitStagedItems(userId);

    return redirect(302, '../');
  }

  // Fetch categories
  const categories = await findAllShoppingCategories();
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
  default: async ({ request  }) => {
    const formData = await request.formData();
    const itemIds = formData.getAll('itemIds').map((formValue) => formValue.toString());
    const categoryId = formData.get('categoryId')?.toString();
    if (!categoryId) {
      return fail(400, { message: 'Submit without category' });
    }
    if (!itemIds || itemIds.length === 0) {
      return fail(400, { message: 'Please select at least one item' });
    }

    // Assign the items. Nothing to do after this, the load function will take over to check, if
    // commit of the staged list is now possible.
    await assignCategoryToStagedItems(itemIds, categoryId);
  }
};
