import type { PageServerLoad } from './$types';
import * as table from '$lib/server/db/schema';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async (event) => {
	return {
		categories: db.select().from(table.shoppingCategory).orderBy(table.shoppingCategory.priority)
	};
};