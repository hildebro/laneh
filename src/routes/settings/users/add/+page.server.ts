import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { addUser } from '$lib/server/db/functions';

export const actions: Actions = {
  default: async (event) => {
    const formData = await event.request.formData();
    const username = formData.get('username');

    if (!validateUsername(username)) {
      return fail(400, { message: 'Invalid username' });
    }

    try {
      await addUser(username);
    } catch (e) {
      return fail(500, { message: 'An error has occurred' });
    }
    return redirect(302, '../users');
  }
};

function validateUsername(username: unknown): username is string {
  return (
    typeof username === 'string' &&
    username.length >= 3 &&
    username.length <= 31 &&
    /^[a-z0-9_-]+$/.test(username)
  );
}
