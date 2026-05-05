import { Capacitor } from '@capacitor/core';
import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { getApiClient } from '$lib/apiClient';
import { handleApiLoad } from '$lib/utils/apiHelper';

export const ssr = false;
export const prerender = false;

export const load = async ({ fetch, url }) => {
  if (Capacitor.isNativePlatform()) {
    const serverUrl = localStorage.getItem('serverUrl');

    if (!serverUrl && url.pathname !== resolve('/server-picker')) {
      return redirect(302, resolve('/server-picker'));
    }
  }

  const client = getApiClient(fetch);
  const logged_in_user = await handleApiLoad(client.api.public.loggedInUser.$get());

  return { logged_in_user };
};