import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { addUser } from '$lib/server/db/functions';
import { processForm } from '$lib/server/formHandler';
import { z } from '$lib/zod';

const minUsernameLength = 3;
const maxUsernameLength = 31;

const userSchema = z.object({
  username: z.string()
    .regex(/^[a-z0-9_-]*$/)
    .min(minUsernameLength)
    .max(maxUsernameLength)
});

export const actions: Actions = {
  default: async (event) => {
    return processForm(event, userSchema, async (user) => {
      await addUser(user.username);

      return redirect(302, '../users');
    });
  }
};
