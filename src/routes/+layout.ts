import type { LayoutLoad } from './$types';
import { getApiClient } from '$lib/apiClient';
import { handleCrudLoad } from '$lib/utils/crudHelper';

export const load: LayoutLoad = async ({ fetch }) => {
  const client = getApiClient(fetch);

  return {
    users: await handleCrudLoad(client.api.users.$get()),
    due_task_count: await handleCrudLoad(client.api.tasks.dueTaskCount.$get()),
  }
};
