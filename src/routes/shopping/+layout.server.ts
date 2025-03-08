import type { LayoutServerLoad } from './$types';
import { findAllShoppingCategories } from '$lib/server/db/functions';

export const load: LayoutServerLoad = async () => {
  return {
    categories: findAllShoppingCategories()
  };
};