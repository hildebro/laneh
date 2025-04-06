import type { PageServerLoad } from './$types';
import { findAllShoppingCategories } from '$lib/server/db/functions';
import { type Actions } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
  return {
    categories: findAllShoppingCategories()
  };
};

export const actions: Actions = {
  up: async ({ request }) => {
    const formData = await request.formData();
    const categoryId = formData.get('categoryId')?.toString();

    // todo move up
  },
  down: async ({ request }) => {
    const formData = await request.formData();
    const categoryId = formData.get('categoryId')?.toString();

    // todo move down
  }
};
