import { type Actions, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { resolve } from '$app/paths';
import * as m from '$lib/paraglide/messages.js';
import { hasRootPassword, setRootPassword } from '$lib/server/db/functions';
import { processForm } from '$lib/server/formHandler';
import { z } from '$lib/zod';

export const load: PageServerLoad = async ( ) => {
  const root = await hasRootPassword();
  if (root) {
    return redirect(302, resolve('/'));
  }

  return {};
};

const passwordSchema = z.object({
  password: z.string().nonempty(),
  passwordConfirm: z.string().nonempty()
}).refine((val) => val.password === val.passwordConfirm, {
  error: m.error_password()
});

export const actions: Actions = {
  default: async (event) => {
    return processForm(event, passwordSchema, async (passwordData, event) => {
      await setRootPassword(passwordData.password);

      return redirect(302, resolve('/settings/users/add'));
    });
  }
};
