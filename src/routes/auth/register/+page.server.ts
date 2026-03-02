import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { resolve } from '$app/paths';
import { setUser } from '$lib/server/auth';
import { addUser, findAllUsers } from '$lib/server/db/functions';
import { processForm } from '$lib/server/formHandler';
import { z } from '$lib/zod';

export const load: PageServerLoad = async () => {
  return {
    users: await findAllUsers()
  };
};

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
  default: async (event) => {
    return processForm(event, userSchema, async (user) => {
      const userId = await addUser(user.username, user.password);

      const users = await findAllUsers();
      if (users.length > 1) {
        return redirect(302, resolve('/settings/users'));
      }

      // If we only have a single user, we might as well log in and redirect to dashboard.
      setUser(event.cookies, userId);
      return redirect(302, resolve('/'));
    });
  }
};
