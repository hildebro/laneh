import type { PageLoad } from './$types';
import { getApiClient } from '$lib/apiClient';
import { handleCrudLoad } from '$lib/utils/crudHelper';

export const load: PageLoad = async ({ params, fetch }) => {
  const client = getApiClient(fetch);

  // Pass the specific Hono call into the generic handler
  const data = await handleCrudLoad<{ task: any }>(
    client.api.tasks.single[':task'].$get({ param: { task: params.task } })
  );

  return { task: data.task };
};