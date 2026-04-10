import type { PageLoad } from './$types';
import { getApiClient } from '$lib/apiClient';
import { handleApiLoad } from '$lib/utils/apiHelper';

export const load: PageLoad = async ({ fetch }) => {
	const client = getApiClient(fetch);

	return {
		userDebts: await handleApiLoad(client.api.balance.debts.$get()),
		entries: await handleApiLoad(client.api.balance.$get())
	};
};
