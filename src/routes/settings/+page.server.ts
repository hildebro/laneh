import { type Actions } from '@sveltejs/kit';
import { updateUser } from '$lib/server/db/functions';
import { processForm } from '$lib/server/formHandler';
import { z } from '$lib/zod';

const minUsernameLength = 3;
const maxUsernameLength = 31;

const userSchema = z.object({
  username: z.string()
    .regex(/^[a-zA-Z0-9_-]*$/)
    .min(minUsernameLength)
    .max(maxUsernameLength),
  password: z.union([z.string().min(8).max(64), z.string().length(0)])
});

export const actions: Actions = {
  updateUser: async (event) => {
    return processForm(event, userSchema, async (user, event) => {
      const userId = event.locals.user?.id as string

      await updateUser(userId, user.username, user.password);
    });
  }
};
