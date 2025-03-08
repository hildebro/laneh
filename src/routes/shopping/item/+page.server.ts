import type { PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { addShoppingItem } from '$lib/server/db/functions';

export const load: PageServerLoad = async (event) => {
	return {};
};

export const actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		let categoryId = data.get('categoryId')?.toString();
		let name = data.get('name')?.toString();
		if (categoryId === undefined || name === undefined) {
			return fail(400, { message: 'Missing data' });
		}

		await addShoppingItem(categoryId, name);

		return redirect(302, '/shopping');
	}
};

function generateItemId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	return encodeBase32LowerCase(bytes);
}
