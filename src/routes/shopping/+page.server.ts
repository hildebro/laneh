import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async (event) => {
	return {
		categories: db.query.shoppingCategory.findMany({
			with: {
				shoppingItems: true
			}
		})
	};
};