import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { resolve } from '$app/paths';
import * as m from '$lib/paraglide/messages.js';
import {
  assignCategoryToStagedItems,
  commitStagedItems,
  findAllShoppingCategories,
  findStagedShoppingList
} from '$lib/server/db/functions';
import { processForm } from '$lib/server/formHandler';
import { z } from '$lib/zod';

export const load: PageServerLoad = async ({ locals }) => {
  const userId = locals.user?.id as string;
  const stagedList = await findStagedShoppingList(userId);
  if (!stagedList) {
    // No staged list is active, return to overview.
    return redirect(302, resolve('/shopping'));
  }

  if (!stagedList.stagedItems.some(item => item.status === 'unmatched')) {
    // Nothing unmatched items to categorize, meaning only perfect matches. Finish the staging.
    await commitStagedItems(userId);

    return redirect(302, resolve('/shopping'));
  }

  if (
    !stagedList.stagedItems.filter(item => item.status === 'unmatched')
      .some(item => item.selectedCategoryId === null)
  ) {
    // All items that need categorizing have gotten it. Finish the staging.
    await commitStagedItems(userId);

    return redirect(302, resolve('/shopping'));
  }

  // Fetch categories
  const categories = await findAllShoppingCategories();
  if (categories.length === 0) {
    throw new Error('Cannot categorize without categories');
  }

  return {
    items: stagedList.stagedItems,
    selectableCategories: categories
  };
};

const categorizeSchema = z.object({
  itemIds: z.array(z.string().nonoptional()).nonempty(m.shopping_categorize_select_items_invalid()),
  categoryId: z.string().nonoptional()
});

export const actions: Actions = {
  default: async (event) => {
    return processForm(
      event,
      categorizeSchema,
      async (categorize) => {
        // Assign the items. Nothing to do after this, the load function will take over to check, if
        // commit of the staged list is now possible.
        await assignCategoryToStagedItems(categorize.itemIds, categorize.categoryId);
      },
      { arrays: ['itemIds'] }
    );
  }
};
