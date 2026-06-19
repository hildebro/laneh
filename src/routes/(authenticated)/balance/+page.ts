import type { PageLoad } from './$types';
import { getApiClient } from '$lib/apiClient';
import { handleApiLoad } from '$lib/utils/apiHelper';

export const load: PageLoad = async ({ fetch }) => {
  const client = getApiClient(fetch);

  const apiEntries = await handleApiLoad(client.api.balance.$get());
  const entries = apiEntries.map(apiEntry => {
    return {
      ...apiEntry,
      date: new Date(apiEntry.date)
    };
  });

  return {
    userDebts: await handleApiLoad(client.api.balance.debts.$get()),
    entries
  };
};
