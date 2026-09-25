import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { resolve } from '$app/paths';
import { getApiClient } from '$lib/apiClient';
import { isOfflineMode } from '$lib/offline';
import { handleApiLoad } from '$lib/utils/apiHelper';

export const load: PageLoad = async ({ fetch }) => {
	const client = getApiClient(fetch);

  const needsInitiation = await handleApiLoad(client.api.public.needsInitiation.$get());
  if (needsInitiation) {
    return redirect(302, resolve('/initiate'));
  }

  // The offline app logs in automatically, which is handled by the authenticated area.
  if (isOfflineMode()) {
    return redirect(302, resolve('/'));
  }

	const loggedInUser =  await handleApiLoad(client.api.public.loggedInUser.$get());
  if (loggedInUser) {
    return redirect(302, resolve('/'));
  }

  return {};
};