import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';

export const load: LayoutServerLoad = async (event) => {
  if (!event.locals.authenticated && !event.route.id?.startsWith('/auth')) {
    return redirect(302, `${base}/auth`);
  }

  // Make sure to check for authentication first. No need to check for users before authenticating.
  if (event.locals.authenticated && !event.locals.user && !event.route.id?.startsWith('/settings/users')) {
    return redirect(302, `${base}/settings/users`);
  }

  return { user: event.locals.user, authenticated: event.locals.authenticated };
};
