import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import * as m from '$lib/paraglide/messages.js';
import { deactivateShoppingItems, deleteShoppingItems, findAllShoppingCategories } from '$lib/server/db/functions';

export const load: PageServerLoad = async () => {
  return {
    categories: findAllShoppingCategories()
  };
};

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const items = data.getAll('items').map((formValue) => formValue.toString());

    if (items.length === 0) {
      return fail(400, { message: m.settings_items_action_empty() });
    }

    if (data.has('action') && data.get('action') === 'deactivate') {
      await deactivateShoppingItems(items);

      return;
    }

    await deleteShoppingItems(items);
  }
};
