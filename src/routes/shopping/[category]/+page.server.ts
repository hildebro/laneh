import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { shoppingCategory } from '$lib/server/db/schema';
import { eq, max } from 'drizzle-orm';
import { type Actions, error, fail, redirect } from '@sveltejs/kit';
import { encodeBase32LowerCase } from '@oslojs/encoding';

export const load: PageServerLoad = async ({ params }) => {
	if (params.category === 'add') {
		return { category: null };
	}

	const [category] = await db
		.select()
		.from(shoppingCategory)
		.where(eq(shoppingCategory.id, params.category))
		.limit(1);

	if (!category) throw error(404, 'Category not found');

	return { category };
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const name = formData.get('name')?.toString();
		if (!name) {
			return fail(400, { message: 'No name given' });
		}

		const id = formData.get('categoryId')?.toString();

		try {
			if (id) {
				await db.update(table.shoppingCategory).set({ name: name }).where(eq(table.shoppingCategory.id, id));
			} else {
				const maxPriority = (await db
					.select({ value: max(table.shoppingCategory.priority) })
					.from(table.shoppingCategory))
					.at(0);

				const nextPriority = typeof maxPriority?.value === "number" ? maxPriority.value + 1 : 0;
				await db.insert(table.shoppingCategory).values({ id: generateCategoryId(), name: name, priority: nextPriority });
			}
		} catch (e) {
			return fail(500, { message: 'An error has occurred' });
		}
		return redirect(302, '/shopping');
	}
};

function generateCategoryId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	return encodeBase32LowerCase(bytes);
}
