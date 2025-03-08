import type { PageServerLoad } from './$types';
import { type Actions, error, fail, redirect } from '@sveltejs/kit';
import { addShoppingCategory, findShoppingCategory, updateShoppingCategory } from '$lib/server/db/functions';

export const load: PageServerLoad = async ({ params }) => {
	if (params.category === 'add') {
		return { category: null };
	}

	const category = await findShoppingCategory(params.category);
	if (!category) {
		throw error(404, 'Category not found');
	}

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
				await updateShoppingCategory(id, name);
			} else {
				await addShoppingCategory(name);
			}
		} catch (e) {
			return fail(500, { message: 'An error has occurred' });
		}
		return redirect(302, '/shopping');
	}
};
