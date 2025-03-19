import { type Actions, fail, redirect } from '@sveltejs/kit';
import { updateOrdering, updateShoppingCategory } from '$lib/server/db/functions';

export const actions: Actions = {
  reorder: async ({ request }) => {
    const formData = await request.formData();
    const ids = formData.getAll('ids') as string[]; // Get all values with key 'ids'

    try {
      await updateOrdering(ids);
    } catch (e) {
      return fail(500, { message: 'An error has occurred' });
    }
    return redirect(302, '../../shopping');
  }
};
