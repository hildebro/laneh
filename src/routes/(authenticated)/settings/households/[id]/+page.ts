import type { PageLoad } from './$types';
import { getApiClient } from '$lib/apiClient';
import { handleApiLoad } from '$lib/utils/apiHelper';

export const load: PageLoad = async ({ params, fetch }) => {
  const client = getApiClient(fetch);

  if (params.id === 'add') {
    return { household: null }
  }

  return {
    household: await handleApiLoad(client.api.households[':id'].$get({ param : { id: params.id }}))
  };
};
