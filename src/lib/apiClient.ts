import { hc } from 'hono/client';
import { resolve } from '$app/paths';
import { getBaseUrl } from '$lib/config';
import type { AppType } from '$lib/server/api';

export function getApiClient(customFetch?: typeof fetch) {
  const baseUrl = getBaseUrl();
  // Initialize and return the typed Hono client
  return hc<AppType>(baseUrl + resolve('/'), { fetch: customFetch });
}