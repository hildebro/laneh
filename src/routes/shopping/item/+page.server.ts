import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { max } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import { encodeBase32LowerCase } from '@oslojs/encoding';

export const load: PageServerLoad = async (event) => {
	return {};
};

export const actions = {
	create: async ({ request }) => {
		const maxPriority = (await db
			.select({ value: max(table.shoppingItem.priority) })
			.from(table.shoppingItem))
			.at(0);
		const nextPriority = typeof maxPriority?.value === 'number' ? maxPriority.value + 1 : 0;

		const data = await request.formData();
		let categoryId = data.get('categoryId')?.toString();
		let name = data.get('name')?.toString();
		if (categoryId === undefined || name === undefined) {
			return fail(400, { message: 'Missing data' });
		}

		await db.insert(table.shoppingItem).values({
			id: generateItemId(),
			categoryId: categoryId,
			name: name,
			priority: nextPriority
		});

		return redirect(302, '/shopping');
	}
};

function generateItemId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	return encodeBase32LowerCase(bytes);
}
