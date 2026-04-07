import type { PageLoad } from './$types';
import { getApiClient } from '$lib/apiClient';
import { handleCrudLoad } from '$lib/utils/crudHelper';

export const load: PageLoad = async ({ fetch }) => {
	const client = getApiClient(fetch);

	return await handleCrudLoad(
		client.api.tasks.$get()
	);
};