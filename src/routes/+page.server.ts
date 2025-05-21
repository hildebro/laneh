import type { PageServerLoad } from './$types';
import { countActiveShoppingItems, fetchLastPurchaseDate } from '$lib/server/db/functions';

export const load: PageServerLoad = async () => {
  return {
    shopping_item_count: await countActiveShoppingItems(),
    last_purchase_date: await fetchLastPurchaseDate()
  };
};