import { type Actions, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { base } from '$app/paths';
import * as m from '$lib/paraglide/messages';
import { setUser } from '$lib/server/auth';
import { findAllUsers, findUser } from '$lib/server/db/functions';

export const load: PageServerLoad = async ({ locals }) => {
  return {
    users: findAllUsers(),
    has_active_user: locals.user !== undefined
  };
};

export const actions: Actions = {
  select: async ({ request, cookies }) => {
    const formData = await request.formData();
    const userId = formData.get('userId')?.toString();
    if (!userId) {
      return;
    }

    const user = await findUser(userId);
    if (!user) {
      return fail(400, { message: m.error_user_not_found() });
    }

    setUser(cookies, userId)

    return redirect(302, `${base}`);
  }
};