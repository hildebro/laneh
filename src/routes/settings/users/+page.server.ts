import { type Actions, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { base } from '$app/paths';
import { USER_COOKIE } from '$lib';
import * as m from '$lib/paraglide/messages';
import { findAllUsers, findUser } from '$lib/server/db/functions';

export const load: PageServerLoad = async () => {
  return {
    users: findAllUsers()
  };
};

export const actions: Actions = {
  select: async (event) => {
    const formData = await event.request.formData();
    const userid = formData.get('userId')?.toString();
    if (!userid) {
      return;
    }

    const user = await findUser(userid);
    if (!user) {
      return fail(400, { message: m.error_user_not_found() });
    }

    event.cookies.set(USER_COOKIE, user.id, {
      path: '/'
    });

    return redirect(302, `${base}`);
  }
};