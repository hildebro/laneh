import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';

export const load: LayoutServerLoad = async (event) => {
  if (!event.locals.user && !event.route.id?.startsWith('/users')) {
    return redirect(302, `${base}/users`);
  }

  return { user: event.locals.user };
};
