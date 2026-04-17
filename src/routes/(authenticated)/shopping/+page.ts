import type { PageLoad } from './$types';
import { getApiClient } from '$lib/apiClient';
import { handleApiLoad } from '$lib/utils/apiHelper';

export const load: PageLoad = async ({ fetch }) => {
  const client = getApiClient(fetch);

  return {
    activeCategories: await handleApiLoad(client.api.shopping.categoriesWithActiveItems.$get()),
    hasNoCategories: await handleApiLoad(client.api.shopping.hasNoCategories.$get())
  };
};