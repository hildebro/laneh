import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getApiClient } from '$lib/apiClient';

export const load: PageLoad = async ({ params, fetch }) => {
  const client = getApiClient(fetch);

  const res = await client.api.tasks.single[':task'].$get({ param: { task: params.task } });
  if (!res.ok) {
    const errorText = await res.text();
    throw error(res.status, errorText);
  }

  const data = await res.json();

  if (data && typeof data === 'object' && 'error' in data) {
    throw error(400, data.error as string);
  }

  return data;
};
