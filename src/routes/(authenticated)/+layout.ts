import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { resolve } from '$app/paths';
import { getApiClient } from '$lib/apiClient';
import { handleApiLoad } from '$lib/utils/apiHelper';

export const load: LayoutLoad = async ({ fetch }) => {
  const client = getApiClient(fetch);

  const loggedInUser = await handleApiLoad(client.api.public.loggedInUser.$get());
  if (!loggedInUser) {
    return redirect(302, resolve('/login'));
  }

  return {
    logged_in_user: loggedInUser,
    users: await handleApiLoad(client.api.users.$get()),
    due_task_count: await handleApiLoad(client.api.tasks.dueTaskCount.$get()),
  }
};
