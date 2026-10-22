import type { PageLoad } from './$types';
import { getApiClient } from '$lib/apiClient';
import { handleApiLoad } from '$lib/utils/apiHelper';

export const load: PageLoad = async ({ fetch }) => {
  const client = getApiClient(fetch);

  const overview = await handleApiLoad(client.api.balance.overview.$get());
  const recentEntries = overview.recentEntries.map(apiEntry => {
    return {
      ...apiEntry,
      date: new Date(apiEntry.date)
    };
  });

  const users = await handleApiLoad(client.api.users.$get());

  return {
    userDebts: await handleApiLoad(client.api.balance.debts.$get()),
    // Balances between users are meaningless in a single person household.
    showDebts: users.length > 1,
    recentEntries,
    monthlyTotals: overview.monthlyTotals
  };
};
