import { type Actions, fail, redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import * as m from '$lib/paraglide/messages.js';
import { createSession, verifyOTP } from '$lib/server/auth';

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();
    const otp = formData.get('otp')?.toString() ?? '';

    if (await verifyOTP(otp)) {
      await createSession(cookies);

      return redirect(302, `${base}`);
    } else {
      return fail(400, { message: m.auth_access_code_invalid() });
    }
  }
};
