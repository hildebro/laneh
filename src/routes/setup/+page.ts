import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { resolve } from '$app/paths';
import { getApiClient } from '$lib/apiClient';
import { handleApiLoad } from '$lib/utils/apiHelper';

export const load: PageLoad = async ({ fetch }) => {
  const client = getApiClient(fetch);

  // The authenticated area takes care of logging in, including the automatic login in local mode.
  const loggedInUser = await handleApiLoad(client.api.public.loggedInUser.$get());
  if (!loggedInUser) {
    return redirect(302, resolve('/'));
  }

  const setup = await handleApiLoad(client.api.setup.$get());
  if (setup.completed) {
    return redirect(302, resolve('/'));
  }
};
