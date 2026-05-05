import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { resolve } from '$app/paths';
import { getApiClient } from '$lib/apiClient';
import { handleApiLoad } from '$lib/utils/apiHelper';

export const load: LayoutLoad = async ({ fetch, parent }) => {
  const { logged_in_user } = await parent();
  if (!logged_in_user) {
    return redirect(302, resolve('/login'));
  }

  const client = getApiClient(fetch);

  return {
    // Passing the user again, so the type is no longer possibly null.
    logged_in_user,
    users: await handleApiLoad(client.api.users.$get()),
    due_task_count: await handleApiLoad(client.api.tasks.dueTaskCount.$get())
  };
};
