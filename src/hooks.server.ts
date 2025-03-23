import { sequence } from '@sveltejs/kit/hooks';
import { i18n } from '$lib/i18n';
import { type Handle } from '@sveltejs/kit';
import { USER_COOKIE } from '$lib';
import { findUser } from '$lib/server/db/functions';
import { getSession, refreshSession } from '$lib/server/auth';

const handleAuth: Handle = async ({ event, resolve }) => {
  const session = await getSession(event.cookies);
  if (session) {
    // Session is valid, proceed
    event.locals.authenticated = true;
    return resolve(event);
  }

  // Check for refresh token
  const refreshed = await refreshSession(event.cookies);
  if (refreshed) {
    const sessionAfterRefresh = await getSession(event.cookies);
    //this shouldn't happen, because refreshSession calls createSession.  but for types...
    if (sessionAfterRefresh) {
      event.locals.authenticated = true;
    }
  }

  return resolve(event);
};

const handleUser: Handle = async ({ event, resolve }) => {
  const userCookie = event.cookies.get(USER_COOKIE);
  if (!userCookie) {
    event.locals.user = undefined;

    return resolve(event);
  }

  event.locals.user = await findUser(userCookie);

  return resolve(event);
};

const handleParaglide: Handle = i18n.handle();
export const handle: Handle = sequence(handleAuth, handleUser, handleParaglide);
