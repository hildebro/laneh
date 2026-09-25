import { Preferences } from '@capacitor/preferences';
import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { resolve } from '$app/paths';
import { getApiClient } from '$lib/apiClient';
import { isOfflineMode } from '$lib/offline';
import { handleApiLoad } from '$lib/utils/apiHelper';

export const load: LayoutLoad = async ({ fetch }) => {
  const client = getApiClient(fetch);
  let logged_in_user = await handleApiLoad(client.api.public.loggedInUser.$get());

  // Sessions are pointless in offline mode, so a missing or expired one is silently replaced.
  if (!logged_in_user && isOfflineMode()) {
    const { sessionToken } = await handleApiLoad(client.api.public.offline.login.$post());
    if (sessionToken) {
      await Preferences.set({ key: 'session_token', value: sessionToken });
      logged_in_user = await handleApiLoad(client.api.public.loggedInUser.$get());
    }
  }

  if (!logged_in_user) {
    return redirect(302, resolve('/login'));
  }

  return {
    // This overrides the default null from the root layout.
    logged_in_user,
    users: await handleApiLoad(client.api.users.$get()),
    due_task_count: await handleApiLoad(client.api.tasks.dueTaskCount.$get())
  };
};
