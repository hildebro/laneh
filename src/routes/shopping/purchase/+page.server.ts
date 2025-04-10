import { fail, redirect } from '@sveltejs/kit';
import { createPurchase } from '$lib/server/db/functions';

export const actions = {
  default: async ({ request, locals }) => {
    const data = await request.formData();
    const items = data.getAll('items').map((formValue) => formValue.toString());
    const user = locals.user;
    if (!user) {
      return fail(400, { message: 'Could not resolve user.' });
    }

    if (items.length > 0) {
      await createPurchase(user, items);
    }

    return redirect(302, '../shopping');
  }
};
