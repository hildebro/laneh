import { type Actions, redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import { deleteStagedList } from '$lib/server/db/functions';

export const actions: Actions = {
  default: async ({ locals }) => {
    const userId = locals.user?.id as string;

    await deleteStagedList(userId);

    return redirect(302, `${base}/shopping`)
  }
};
