import { type Actions, fail, redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import * as m from '$lib/paraglide/messages.js';
import { createSession, verifyOTP } from '$lib/server/auth';
import { processForm } from '$lib/server/formHandler';
import { z } from '$lib/zod';

const otpSchema = z.object({
  code: z.string().trim().nonempty()
});

export const actions: Actions = {
  default: async (event) => {
    return processForm(event, otpSchema, async (otp, { cookies }) => {
      if (await verifyOTP(otp.code)) {
        await createSession(cookies);

        return redirect(302, `${base}`);
      } else {
        // Fill the error date with zod-like data, so it's handled the same way by the frontend.
        return fail(422, {
          issues: [
            { path: ['code'], message: m.auth_access_code_invalid() }
          ]
        });
      }
    });
  }
};
