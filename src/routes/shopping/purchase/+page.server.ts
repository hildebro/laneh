import { fail, redirect } from '@sveltejs/kit';
import { createPurchase } from '$lib/server/db/functions';

export const actions = {
  default: async ({ request, locals }) => {
    const data = await request.formData();
    let items = data.getAll('items').map((formValue) => formValue.toString());
    let user = locals.user;
    if (!user) {
      return fail(400, { message: 'Missing data' });
    }

    if (items.length > 0) {
      await createPurchase(user, items);
    }

    return redirect(302, '../shopping');
  }
};
