import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { resolve } from '$app/paths';
import { getApiClient } from '$lib/apiClient';
import { handleApiLoad } from '$lib/utils/apiHelper';

export const load: PageLoad = async ({ fetch }) => {
  const client = getApiClient(fetch);

  const stagedList = await handleApiLoad(client.api.shopping.stagedItems.$get());
  if (!stagedList) {
    return redirect(302, resolve('/shopping/item/add'));
  }

  return {
    items: stagedList.stagedItems,
    selectableCategories: await handleApiLoad(client.api.shopping.categoriesWithItems.$get())
  };
};