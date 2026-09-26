import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { resolve } from '$app/paths';
import { getApiClient } from '$lib/apiClient';
import { isLocalMode } from '$lib/local';
import * as m from '$lib/paraglide/messages.js';
import { handleApiLoad } from '$lib/utils/apiHelper';

export const load: PageLoad = async ({ fetch }) => {
	const client = getApiClient(fetch);

	const needsInitiation =  await handleApiLoad(client.api.public.needsInitiation.$get());
  // Navigate away, if initiation is already initiated.
  if (!needsInitiation) {
    return redirect(302, resolve('/'));
  }

  if (isLocalMode()) {
    return redirect(302, resolve('/initiate/local'));
  }

  return {
    help_text: m.initiate_info()
  };
};
