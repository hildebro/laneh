import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createPurchase, findStagedPurchaseItems, stagePurchaseItem } from '$lib/server/db/functions';
import type { User } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
  return {
    stagedItems: await findStagedPurchaseItems()
  };
};

export const actions = {
  commit: async ({ locals }) => {
    const user = locals.user as User;

    await createPurchase(user.id);

    return redirect(302, '../shopping');
  },
  stage: async ({ request, locals }) => {
    const formData = await request.formData();
    const itemId = formData.get('itemId')?.toString() as string;
    const user = locals.user as User;

    await stagePurchaseItem(itemId, user.id)
  }
};
