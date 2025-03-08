import type { PageServerLoad } from './$types';
import { type Actions, fail, redirect } from '@sveltejs/kit';
import { USER_COOKIE } from '$lib';
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
      return fail(400, { message: 'User does not exist.' });
    }

    event.cookies.set(USER_COOKIE, user.id, {
      path: '/'
    });

    return redirect(302, '/');
  }
};