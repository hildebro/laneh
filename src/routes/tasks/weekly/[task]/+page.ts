import type { PageLoad } from './$types';
import { getApiClient } from '$lib/apiClient';
import { handleApiLoad } from '$lib/utils/apiHelper';

export const load: PageLoad = async ({ params, fetch }) => {
  const client = getApiClient(fetch);

  const data = await handleApiLoad(
    client.api.tasks.weekly[':task'].$get({ param: { task: params.task } })
  );
  return { ...data, weekdays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] };
};
