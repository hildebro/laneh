import type { PageLoad } from './$types';
import { getApiClient } from '$lib/apiClient';
import { handleCrudLoad } from '$lib/utils/crudHelper';

export const load: PageLoad = async ({ fetch }) => {
	const client = getApiClient(fetch);

  return {
    shopping_item_count: await handleCrudLoad(client.api.shopping.activeCount.$get()),
    last_purchase_date: await handleCrudLoad(client.api.shopping.lastPurchaseDate.$get()),
    user_debts: await handleCrudLoad(client.api.users.debts.$get())
  };
};