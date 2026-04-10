import type { PageLoad } from './$types';
import { getApiClient } from '$lib/apiClient';
import { handleApiLoad } from '$lib/utils/apiHelper';

export const load: PageLoad = async ({ fetch }) => {
	const client = getApiClient(fetch);

  return {
    shopping_item_count: await handleApiLoad(client.api.shopping.activeCount.$get()),
    last_purchase_date: await handleApiLoad(client.api.shopping.lastPurchaseDate.$get()),
    user_debts: await handleApiLoad(client.api.users.debts.$get())
  };
};