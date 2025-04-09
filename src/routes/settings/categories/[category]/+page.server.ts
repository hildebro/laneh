import type { PageServerLoad } from './$types';
import { type Actions, error, fail, redirect } from '@sveltejs/kit';
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
    throw error(404, 'Category not found');
  }

  return { category };
};

export const actions: Actions = {
  create: async (event) => {
    const formData = await event.request.formData();
    const name = formData.get('name')?.toString()?.trim();
    let items = formData.getAll('items').map((formValue) => formValue.toString());
    if (!name) {
      return fail(400, { message: 'No name given' });
    }

    const id = formData.get('categoryId')?.toString();

    try {
      if (id) {
        await updateShoppingCategory(id, name, items);
      } else {
        await addShoppingCategory(name);
      }
    } catch (e) {
      return fail(500, { message: 'An error has occurred' });
    }
    return redirect(302, './');
  },
  delete: async ({ request }) => {
    const formData = await request.formData();
    const categoryId = formData.get('categoryId')?.toString();
    if (!categoryId) {
      throw error(404, 'Category not found');
    }

    const category = await findShoppingCategory(categoryId);
    if (!category) {
      throw error(404, 'Category not found');
    }

    if (category.shoppingItems.length > 0) {
      return fail(400, { message: 'Delete all items first' });
    }

    await deleteCategory(categoryId);

    return redirect(302, './');
  }
};
