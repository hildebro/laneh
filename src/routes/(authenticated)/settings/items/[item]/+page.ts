import type { PageLoad } from './$types';
import { getApiClient } from '$lib/apiClient';
import { handleApiLoad } from '$lib/utils/apiHelper';

export const load: PageLoad = async ({ params, fetch }) => {
  const client = getApiClient(fetch);

  // New items need a category, existing ones are moved in the categorization settings.
  if (params.item === 'add') {
    return {
      item: null,
      categories: await handleApiLoad(client.api.shopping.categoriesWithItems.$get())
    };
  }

  return {
    item: await handleApiLoad(client.api.shopping.item[':id'].$get({ param: { id: params.item } })),
    categories: []
  };
};
