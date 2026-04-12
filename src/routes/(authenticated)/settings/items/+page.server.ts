import type { PageServerLoad } from './$types';
import {
  assignCategoryToShoppingItems,
  deactivateShoppingItems,
  deleteShoppingItems,
  findAllShoppingCategories
} from '$lib/server/db/functions';
import { processForm } from '$lib/server/formHandler';
import { z } from '$lib/zod';

export const load: PageServerLoad = async () => {
  return {
    categories: findAllShoppingCategories()
  };
};

const setCategorySchema = z.object({
  categoryId: z.string().nonempty(),
  itemIds: z.transform((val: string) => {
    if (val === '') {
      return [];
    }

    return val.split(',');
  }).pipe(z.array(z.string().nonempty()).nonempty())
});

const itemUpdateSchema = z.object({
  itemIds: z.transform((val: string) => {
    if (val === '') {
      return [];
    }

    return val.split(',');
  }).pipe(z.array(z.string().nonempty()).nonempty())
});

export const actions = {
  setCategory: async (event) => {
    return processForm(event, setCategorySchema, async (setCategory) => {
      await assignCategoryToShoppingItems(setCategory.itemIds, setCategory.categoryId);
    });
  },
  deactivateItems: async (event) => {
    return processForm(event, itemUpdateSchema, async (itemUpdate) => {
      await deactivateShoppingItems(itemUpdate.itemIds);
    });
  },
  deleteItems: async (event) => {
    return processForm(event, itemUpdateSchema, async (itemUpdate) => {
      await deleteShoppingItems(itemUpdate.itemIds);
    });
  }
};
