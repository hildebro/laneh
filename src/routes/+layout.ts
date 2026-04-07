import type { LayoutLoad } from './$types';
import { getApiClient } from '$lib/apiClient';
import { handleCrudLoad } from '$lib/utils/crudHelper';

export const load: LayoutLoad = async ({ fetch }) => {
  const client = getApiClient(fetch);

  return await handleCrudLoad(
    client.api.users.$get()
  );
};
