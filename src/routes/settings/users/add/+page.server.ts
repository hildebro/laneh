import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import * as m from '$lib/paraglide/messages';
import { addUser } from '$lib/server/db/functions';

const minUsernameLength = 3;
const maxUsernameLength = 31;

export const actions: Actions = {
  default: async (event) => {
    const formData = await event.request.formData();
    const username = formData.get('username');

    if (!validateUsername(username)) {
      return fail(400, { message: m.settings_users_username_invalid({ min: minUsernameLength, max: maxUsernameLength }) });
    }

    await addUser(username);

    return redirect(302, '../users');
  }
};

function validateUsername(username: unknown): username is string {
  return (
    typeof username === 'string' &&
    username.length >= minUsernameLength &&
    username.length <= maxUsernameLength &&
    /^[a-z0-9_-]+$/.test(username)
  );
}
