import type { PageLoad } from './$types';
import { getApiClient } from '$lib/apiClient';
import { handleApiLoad } from '$lib/utils/apiHelper';

export const load: PageLoad = async ({ params, fetch }) => {
  const client = getApiClient(fetch);

  const households = await handleApiLoad(client.api.households.$get());
  if (params.id === 'add') {
    return { user: null, households }
  }

  return {
    user: await handleApiLoad(client.api.users[':id'].$get({ param : { id: params.id }})),
    households
  };
};
