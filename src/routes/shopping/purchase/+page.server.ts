import { redirect } from '@sveltejs/kit';
import { removeShoppingItems } from '$lib/server/db/functions';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		let items = data.getAll('items').map((formValue) => formValue.toString());
		await removeShoppingItems(items)

		return redirect(302, '/shopping');
	}
};
