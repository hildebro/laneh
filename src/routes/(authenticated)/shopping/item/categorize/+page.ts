import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { resolve } from '$app/paths';
import { getApiClient } from '$lib/apiClient';
import { handleApiLoad } from '$lib/utils/apiHelper';
import { getStagedShoppingItems } from '$lib/utils/shoppingItemStaging';

export const load: PageLoad = async ({ fetch, parent }) => {
  const client = getApiClient(fetch);
  const { logged_in_user } = await parent();

  const items = getStagedShoppingItems(logged_in_user.id);
  if (!items) {
    return redirect(302, resolve('/shopping/item/add'));
  }

  return {
    items,
    selectableCategories: await handleApiLoad(client.api.shopping.categoriesWithItems.$get())
  };
};
