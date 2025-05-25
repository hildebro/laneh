import { type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { findAllShoppingCategories, moveCategoryOrderDown, moveCategoryOrderUp } from '$lib/server/db/functions';
import { processForm } from '$lib/server/formHandler';
import { z } from '$lib/zod';

export const load: PageServerLoad = async () => {
  return {
    categories: findAllShoppingCategories()
  };
};

const categorySchema = z.object({
  id: z.string().nonempty()
});

export const actions: Actions = {
  up: async (event) => {
    await new Promise((r) => {
      setTimeout(r, 2000)
    });
    return processForm(event, categorySchema, async (category) => {
      await moveCategoryOrderUp(category.id);
    });
  },
  down: async (event) => {
    return processForm(event, categorySchema, async (category) => {
      await moveCategoryOrderDown(category.id);
    });

  }
};
