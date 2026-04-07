import type { PageLoad } from './$types';
import { getApiClient } from '$lib/apiClient';
import { handleCrudLoad } from '$lib/utils/crudHelper';

export const load: PageLoad = async ({ params, fetch }) => {
  const client = getApiClient(fetch);

  const data = await handleCrudLoad(
    client.api.tasks.weekly[':task'].$get({ param: { task: params.task } })
  );
  return { ...data, weekdays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] };
};
