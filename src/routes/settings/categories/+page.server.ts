import { type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { findAllShoppingCategories, moveCategoryOrderDown, moveCategoryOrderUp } from '$lib/server/db/functions';

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
      throw new Error('Action called without category id. This should not happen.');
    }

    await moveCategoryOrderUp(categoryId);
  },
  down: async ({ request }) => {
    const formData = await request.formData();
    const categoryId = formData.get('categoryId')?.toString();
    if (!categoryId) {
      throw new Error('Action called without category id. This should not happen.');
    }

    await moveCategoryOrderDown(categoryId);
  }
};
