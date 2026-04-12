import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { resolve } from '$app/paths';
import { getApiClient } from '$lib/apiClient';
import { handleApiLoad } from '$lib/utils/apiHelper';

export const load: LayoutLoad = async ({ fetch, route }) => {
  const client = getApiClient(fetch);

  const loggedInUser = await handleApiLoad(client.api.users.loggedInUser.$get());
  if (!loggedInUser) {
    if (route.id !== '/auth') {
      return redirect(302, resolve('/auth'));
    } else {
      return {};
    }
  }

  return {
    logged_in_user: loggedInUser,
    users: await handleApiLoad(client.api.users.$get()),
    due_task_count: await handleApiLoad(client.api.tasks.dueTaskCount.$get()),
  }
};
