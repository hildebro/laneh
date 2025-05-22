import { type Actions, error, fail, redirect } from '@sveltejs/kit';
import { z } from 'zod/v4';
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

const categorySchema = z.object({
  id: z.string().nullish(),
  name: z.string().trim().nonempty()
});

export const actions: Actions = {
  create: async (event) => {
    const formData = Object.fromEntries(await event.request.formData());
    const result = categorySchema.safeParse(formData);
    if (!result.success) {
      return fail(422, { issues: result.error.issues });
    }
    const category = result.data;

    if (category.id) {
      await updateShoppingCategory(category.id, category.name);
    } else {
      await addShoppingCategory(category.name);
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
