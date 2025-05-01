import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import * as m from '$lib/paraglide/messages.js';
import {
  assignCategoryToShoppingItems,
  deactivateShoppingItems,
  deleteShoppingItems,
  findAllShoppingCategories
} from '$lib/server/db/functions';

export const load: PageServerLoad = async () => {
  return {
    categories: findAllShoppingCategories()
  };
};

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const itemIds = data.getAll('items').map((formValue) => formValue.toString());

    if (itemIds.length === 0) {
      return fail(400, { message: m.settings_items_action_empty() });
    }

    const categoryId = data.get('category')?.toString();
    if (categoryId) {
      await assignCategoryToShoppingItems(itemIds, categoryId);

      return;
    }

    if (data.has('action') && data.get('action') === 'deactivate') {
      await deactivateShoppingItems(itemIds);

      return;
    }

    await deleteShoppingItems(itemIds);
  }
};
