import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
  commitStagedItems,
  findStagedShoppingList,
  matchStagedItem,
  unmatchStagedItem
} from '$lib/server/db/functions';

export const load: PageServerLoad = async ({ locals }) => {
  let stagedList = await findStagedShoppingList(locals.user?.id as string);
  if (!stagedList) {
    // If nothing is staged yet, go back to add.
    return redirect(302, 'add');
  }

  // If none of the staged items need validation, we can continue to categorizing.
  if (!stagedList.stagedItems.some(item => item.status === 'close_match')) {
    return redirect(302, 'categorize');
  }

  return {
    items: stagedList.stagedItems
  };
};

export const actions: Actions = {
  default: async ({ locals, request }) => {
    const userId = locals.user?.id as string;
    const stagedList = await findStagedShoppingList(userId);
    if (!stagedList) {
      redirect(302, '../');
    }

    const formData = await request.formData();
    for (const index in stagedList.stagedItems) {
      const item = stagedList.stagedItems[index];
      if (item.status !== 'close_match') {
        continue;
      }

      // Update all close_match items so that there is none left after the action.
      if (formData.has(item.name)) {
        await unmatchStagedItem(item);
      } else {
        await matchStagedItem(item);
      }
    }

    const updatedList = await findStagedShoppingList(userId);
    if (updatedList?.stagedItems.some(item => item.status === 'unmatched')) {
      // Some unmatched items exist, so we need to categorize.
      return redirect(302, 'categorize');
    } else {
      // If all items are perfect_matched, we can commit the list and finish the process.
      await commitStagedItems(userId);

      return redirect(302, '../');
    }
  }
};
