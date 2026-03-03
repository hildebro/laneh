import { type Actions, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { base, resolve } from '$app/paths';
import * as m from '$lib/paraglide/messages.js';
import { setSessionCookie } from '$lib/server/auth';
import { createSession, findAndVerifyUser } from '$lib/server/db/functions';
import { failForm, processForm } from '$lib/server/formHandler';
import { z } from '$lib/zod';

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) {
    return redirect(302, resolve('/'));
  }
};

const userSchema = z.object({
  username: z.string().trim().nonempty(),
  password: z.string().nonempty()
});

export const actions: Actions = {
  default: async (event) => {
    return processForm(event, userSchema, async (user, { cookies, url }) => {
      const matchingUser = await findAndVerifyUser(user.username, user.password);
      if (!matchingUser) {
        return failForm('username', m.auth_login_invalid());
      }

      const session = await createSession(matchingUser.id);
      setSessionCookie(cookies, session);

      const target = url.searchParams.get('target');
      if (target) {
        return redirect(302, `${base}/${decodeURI(target)}`);
      }

      return redirect(302, resolve('/'));
    });
  }
};
