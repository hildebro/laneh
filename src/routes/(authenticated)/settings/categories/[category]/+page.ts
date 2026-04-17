import type { PageLoad } from './$types';
import { getApiClient } from '$lib/apiClient';
import { handleApiLoad } from '$lib/utils/apiHelper';

export const load: PageLoad = async ({ params, fetch }) => {
  const client = getApiClient(fetch);

  if (params.category === 'add') {
    return { category: null }
  }

  return {
    category: await handleApiLoad(client.api.shopping.category[':id'].$get({ param : { id: params.category }}))
  };
};
