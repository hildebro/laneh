import type { PageServerLoad } from './$types';
import { findAllShoppingCategories } from '$lib/server/db/functions';

export const load: PageServerLoad = async (event) => {
	return {
		categories: findAllShoppingCategories()
	};
};