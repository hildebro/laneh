import { Capacitor } from '@capacitor/core';
import { writable } from 'svelte/store';
import { getApiClient } from '$lib/apiClient';
import { getBaseUrl } from '$lib/config';
import { isLocalMode } from '$lib/local';
import { handleApiLoad } from '$lib/utils/apiHelper';

export interface Versions {
  remoteVersion: string;
  // Undefined in local mode, where the server is part of the app.
  serverVersion?: string;
}

export const versions = writable<Versions | undefined>();

export async function loadVersions() {
  // Don't check for version, if we are on mobile and don't have a defined server yet.
  if (Capacitor.isNativePlatform() && getBaseUrl() === '') {
    return;
  }

  const client = getApiClient(fetch);
  const query = Capacitor.isNativePlatform() ? { appVersion: __APP_VERSION__ } : {};
  const result = await handleApiLoad(client.api.public.version.$get({ query }));

  versions.set({
    remoteVersion: result.remoteVersion,
    serverVersion: isLocalMode() ? undefined : result.serverVersion
  });
}
