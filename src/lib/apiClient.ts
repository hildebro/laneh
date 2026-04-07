import { hc } from 'hono/client';
import { resolve } from '$app/paths';
import { getBaseUrl } from '$lib/config';
import type { AppType } from '$lib/server/api';

export function getApiClient(customFetch?: typeof fetch) {
  return hc<AppType>(getBaseUrl() + resolve('/'), { fetch: customFetch });
}
