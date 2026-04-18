import type { PageLoad } from './$types';
import { getApiClient } from '$lib/apiClient';
import { handleApiLoad } from '$lib/utils/apiHelper';

export const load: PageLoad = async ({ fetch }) => {
  const client = getApiClient(fetch);

  return { purchases: await handleApiLoad(client.api.shopping.purchases.$get()) };
};
