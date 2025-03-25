import { type Actions, fail, redirect } from '@sveltejs/kit';
import { createSession, verifyOTP } from '$lib/server/auth';
import { base } from '$app/paths';

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();
    const otp = formData.get('otp')?.toString() ?? '';

    if (await verifyOTP(otp)) {
      await createSession(cookies);

      return redirect(302, `${base}`);
    } else {
      return fail(400, { message: 'wrong code' });
    }
  }
};
