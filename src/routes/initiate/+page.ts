import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { resolve } from '$app/paths';
import { getApiClient } from '$lib/apiClient';
import { handleApiLoad } from '$lib/utils/apiHelper';

export const load: PageLoad = async ({ fetch }) => {
	const client = getApiClient(fetch);

	const users =  await handleApiLoad(client.api.users.$get());
  // Navigate away, if initiation is already initiated.
  if (users.length > 0) {
    return redirect(302, resolve('/'));
  }

  return {};
};