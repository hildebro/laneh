import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { base } from '$app/paths';

export const load: LayoutServerLoad = async (event) => {
  // Redirect to auth, if not authenticated and not already at that path.
  if (!event.locals.authenticated && !event.route.id?.startsWith('/auth')) {
    let redirectTarget = `${base}/auth`;
    // Add the original target to the auth route via query param to redirect after authentication.
    if (event.route.id && event.route.id !== '/') {
      // Substring(1) to remove the leading slash from the target.
      redirectTarget += `?target=${encodeURI(event.route.id.substring(1))}`;
    }

    return redirect(302, redirectTarget);
  }

  // Make sure to check for authentication first. No need to check for users before authenticating.
  if (event.locals.authenticated && !event.locals.user && !event.route.id?.startsWith('/settings/users')) {
    return redirect(302, `${base}/settings/users`);
  }

  return { user: event.locals.user, authenticated: event.locals.authenticated };
};
