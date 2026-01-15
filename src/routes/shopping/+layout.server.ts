import type { LayoutServerLoad } from './$types';
import { findActiveItemsByCategory } from '$lib/server/db/functions';

export const load: LayoutServerLoad = async () => {
  return {
    categories: findActiveItemsByCategory()
  };
};