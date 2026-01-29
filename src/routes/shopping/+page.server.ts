import type { PageServerLoad } from './$types';
import { findActiveItemsByCategory } from '$lib/server/db/functions';

export const load: PageServerLoad = async () => {
  return {
    categories: findActiveItemsByCategory()
  };
};