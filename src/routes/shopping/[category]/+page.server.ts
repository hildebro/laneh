import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { shoppingCategory } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	if (params.category === 'add') {
		return { category: null };
	}

	const [category] = await db
		.select()
		.from(shoppingCategory)
		.where(eq(shoppingCategory.name, params.category))
		.limit(1);

	if (!category) throw error(404, 'Category not found');

	return { category };
};