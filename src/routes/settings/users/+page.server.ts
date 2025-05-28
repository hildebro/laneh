import { type Actions, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { base } from '$app/paths';
import * as m from '$lib/paraglide/messages';
import { setUser } from '$lib/server/auth';
import { findAllUsers, findUser } from '$lib/server/db/functions';
import { processForm } from '$lib/server/formHandler';
import { z } from '$lib/zod';

export const load: PageServerLoad = async ({ locals }) => {
  return {
    users: findAllUsers(),
    has_active_user: locals.user !== undefined
  };
};

const switchUserSchema = z.object({
  userId: z.string().nonempty()
});

export const actions: Actions = {
  select: async (event) => {
    return processForm(event, switchUserSchema, async (switchUser, { cookies }) => {
      const user = await findUser(switchUser.userId);
      if (!user) {
        return fail(422, {
          issues: [
            { path: ['code'], message: m.error_user_not_found() }
          ]
        });
      }

      setUser(cookies, user.id);

      return redirect(302, `${base}`);
    });
  }
};
