import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { resolve } from '$app/paths';
import * as m from '$lib/paraglide/messages.js';
import { addUser, isUsernameTaken } from '$lib/server/db/functions';
import { processForm } from '$lib/server/formHandler';
import { z } from '$lib/zod';

const minUsernameLength = 3;
const maxUsernameLength = 31;

const userSchema = z.object({
  username: z.string()
    .regex(/^[a-zA-Z0-9_-]*$/)
    .min(minUsernameLength)
    .max(maxUsernameLength),
  password: z.string().min(8).max(64)
});

export const actions: Actions = {
  register: async (event) => {
    return processForm(event, userSchema, async (user) => {
      if (await isUsernameTaken(user.username)) {
        return fail(422, {
          issues: [{ path: ['username'], message: m.auth_register_error_taken() }]
        });
      }

      await addUser(user.username, user.password);

      return redirect(302, resolve('/settings/users'));
    });
  }
};
