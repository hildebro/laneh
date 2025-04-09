import type { PageServerLoad } from './$types';
import { findAllShoppingCategories, moveCategoryOrderDown, moveCategoryOrderUp } from '$lib/server/db/functions';
import { type Actions, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
  return {
    categories: findAllShoppingCategories()
  };
};

export const actions: Actions = {
  up: async ({ request }) => {
    const formData = await request.formData();
    const categoryId = formData.get('categoryId')?.toString();
    if (!categoryId) {
      return fail(422, { message: 'Missing category id.' });
    }

    await moveCategoryOrderUp(categoryId);
  },
  down: async ({ request }) => {
    const formData = await request.formData();
    const categoryId = formData.get('categoryId')?.toString();
    if (!categoryId) {
      return fail(422, { message: 'Missing category id.' });
    }

    await moveCategoryOrderDown(categoryId);
  }
};
