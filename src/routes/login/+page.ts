import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { resolve } from '$app/paths';
import { getApiClient } from '$lib/apiClient';
import { isLocalMode } from '$lib/local';
import { handleApiLoad } from '$lib/utils/apiHelper';

export const load: PageLoad = async ({ fetch }) => {
	const client = getApiClient(fetch);

  const needsInitiation = await handleApiLoad(client.api.public.needsInitiation.$get());
  if (needsInitiation) {
    return redirect(302, resolve('/initiate'));
  }

  // The local app logs in automatically, which is handled by the authenticated area.
  if (isLocalMode()) {
    return redirect(302, resolve('/'));
  }

	const loggedInUser =  await handleApiLoad(client.api.public.loggedInUser.$get());
  if (loggedInUser) {
    return redirect(302, resolve('/'));
  }

  return {};
};