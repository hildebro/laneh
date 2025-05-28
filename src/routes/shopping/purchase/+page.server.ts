import { redirect } from '@sveltejs/kit';
import { createPurchase } from '$lib/server/db/functions';
import type { User } from '$lib/server/db/schema';

export const actions = {
  default: async ({ request, locals }) => {
    const data = await request.formData();
    const items = data.getAll('items').map((formValue) => formValue.toString());
    const user = locals.user as User;

    if (items.length > 0) {
      await createPurchase(user, items);
    }

    return redirect(302, '../shopping');
  }
};
