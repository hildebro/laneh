import { type Actions, error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import * as m from '$lib/paraglide/messages.js';
import {
  addShoppingCategory,
  deleteCategory,
  findShoppingCategory,
  updateShoppingCategory
} from '$lib/server/db/functions';

export const load: PageServerLoad = async ({ params }) => {
  if (params.category === 'add') {
    return { category: null };
  }

  const category = await findShoppingCategory(params.category);
  if (!category) {
    throw error(404, m.error_category_not_found());
  }

  return { category };
};

export const actions: Actions = {
  create: async (event) => {
    const formData = await event.request.formData();
    const name = formData.get('name')?.toString()?.trim();
    if (!name) {
      return fail(400, { message: m.settings_categories_name_invalid() });
    }

    const id = formData.get('categoryId')?.toString();

    if (id) {
      await updateShoppingCategory(id, name);
    } else {
      await addShoppingCategory(name);
    }

    return redirect(302, './');
  },
  delete: async ({ request }) => {
    const formData = await request.formData();
    const categoryId = formData.get('categoryId')?.toString();
    if (!categoryId) {
      throw new Error('Action called without category. This should not happen.');
    }

    const category = await findShoppingCategory(categoryId);
    if (!category) {
      throw error(404, m.error_category_not_found());
    }

    if (category.shoppingItems.length > 0) {
      return fail(400, { message: m.settings_categories_delete_invalid() });
    }

    await deleteCategory(categoryId);

    return redirect(302, './');
  }
};
