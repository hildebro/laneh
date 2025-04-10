import { type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { USER_COOKIE } from '$lib';
import { transactionContext } from '$lib/context';
import { i18n } from '$lib/i18n';
import { getSession, refreshSession } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { findUser } from '$lib/server/db/functions';

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
    // This shouldn't happen, because refreshSession calls createSession. But for types...
    if (sessionAfterRefresh) {
      event.locals.authenticated = true;
    }
  }

  return resolve(event);
};

const handleDatabase: Handle = async ({ event, resolve }) => {
  try {
    // Start the Drizzle transaction using the main db client
    return await db.transaction(async (tx) => {
      // Run the request resolution within the ALS context, storing the transactional client 'tx'.
      return await transactionContext.run(tx, async () => {
        return resolve(event);
      });
    });
  } catch (error) {
    // Catch errors from db.transaction OR transactionContext.run OR resolve
    console.error('Hook Error:', error);
    // Re-throw to let SvelteKit handle it
    throw error;
  }

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
export const handle: Handle = sequence(handleAuth, handleDatabase, handleUser, handleParaglide);
