import type { PageServerLoad } from './$types';
import {
  calculateUserDebts,
  countActiveShoppingItems,
  countDueTasks,
  fetchLastPurchaseDate
} from '$lib/server/db/functions';

export const load: PageServerLoad = async () => {
  return {
    shopping_item_count: await countActiveShoppingItems(),
    last_purchase_date: await fetchLastPurchaseDate(),
    due_task_count: await countDueTasks(),
    userDebts: await calculateUserDebts()
  };
};