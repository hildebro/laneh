import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { resolve } from '$app/paths';
import { countDueTasks, findAllUsers, hasRootPassword } from '$lib/server/db/functions';

export const load: LayoutServerLoad = async (event) => {
  // Normal case: user is logged in.
  if (event.locals.user) {
    return {
      user: event.locals.user,
      dueTaskCount: await countDueTasks(),
      returnUrl: event.cookies.get('returnUrl')
    };
  }

  const rootPassword = await hasRootPassword();
  if (!rootPassword) {
    if (event.route.id !== '/auth/setup') {
      return redirect(302, resolve('/auth/setup'));
    } else {
      return {};
    }
  }

  // Redirect to auth, if not authenticated and not already at that path.
  if (!event.locals.authenticated && !event.route.id?.startsWith('/auth')) {
    let redirectTarget = resolve('/auth');
    // Add the original target to the auth route via query param to redirect after authentication.
    if (event.route.id && event.route.id !== '/') {
      // Substring(1) to remove the leading slash from the target.
      redirectTarget += `?target=${encodeURI(event.route.id.substring(1))}`;
    }

    return redirect(302, redirectTarget);
  }

  const users = await findAllUsers();
  if (users.length === 0 && event.route.id !== '/settings/users/add') {
    return redirect(302, resolve('/settings/users/add'))
  }

  // Make sure to check for authentication first. No need to check for users before authenticating.
  if (event.locals.authenticated && !event.locals.user && !event.route.id?.startsWith('/settings/users')) {
    return redirect(302, resolve('/settings/users'));
  }
};
