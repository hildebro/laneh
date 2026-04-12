import type { PageServerLoad } from './$types';
import { findActiveItemsByCategory, findAllShoppingCategories } from '$lib/server/db/functions';

export const load: PageServerLoad = async () => {
  return {
    activeCategories: await findActiveItemsByCategory(),
    hasNoCategories: (await findAllShoppingCategories()).length === 0
  };
};