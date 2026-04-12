import type { PageLoad } from './$types';
import { getApiClient } from '$lib/apiClient';
import { handleApiLoad } from '$lib/utils/apiHelper';

export const load: PageLoad = async ({ params, fetch }) => {
  if (params.task === 'add') return { task: null };

  const client = getApiClient(fetch);

  return {
    task: await handleApiLoad(client.api.tasks.weekly[':task'].$get({ param: { task: params.task } }))
  };
};
