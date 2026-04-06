// src/routes/tasks/[task]/+page.ts
import { hc } from 'hono/client';
import type { PageLoad } from './$types';
import { resolve } from '$app/paths';
import { getBaseUrl } from '$lib/config';
import type { AppType } from '$lib/server/api';

export const load: PageLoad = async ({ params, fetch }) => {
  const baseUrl = getBaseUrl();

  // Initialize at the SvelteKit root (e.g., http://localhost:5173/chorehub)
  const client = hc<AppType>(baseUrl + resolve('/'), { fetch });

  // Notice the `.api` added to the chain because of Hono's basePath
  const res = await client.api.tasks.single[':task'].$get({
    param: { task: params.task }
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`Server Error (${res.status}):`, errorText);
    throw new Error(`Server returned ${res.status}`);
  }

  const data = await res.json();

  if ('error' in data) {
    throw new Error(data.error as string);
  }

  return { task: data.task };
};