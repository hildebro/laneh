import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { building, dev } from '$app/environment';
import { USER_COOKIE } from '$lib';
import { transactionContext } from '$lib/context';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { db } from '$lib/server/db';
import { findUser } from '$lib/server/db/functions';
import { seed } from '$lib/server/db/seed';

async function startup() {
  // Don't run this during the build process (adapter generation)
  if (building) return;

  try {
    await seed();
  } catch (e) {
    console.error('Database seed failed:', e);
  }
}

await startup();

/**
 * If a return url is provided via params, we save it as a cookie and then drop that param.
 */
const handleReturnUrl: Handle = async ({ event, resolve }) => {
  const returnUrl = event.url.searchParams.get('returnUrl');
  if (!returnUrl) {
    return resolve(event);
  }

  event.cookies.set('returnUrl', returnUrl, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: !dev
  });

  const cleanUrl = new URL(event.url);
  cleanUrl.searchParams.delete('returnUrl');
  return redirect(302, cleanUrl.toString());
};

const handleAuth: Handle = async ({ event, resolve }) => {
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

const handleParaglide: Handle = ({ event, resolve }) =>
  paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
    event.request = localizedRequest;
    return resolve(event, {
      transformPageChunk: ({ html }) => {
        return html.replace('%lang%', locale);
      }
    });
  });

export const handle: Handle = sequence(handleReturnUrl, handleAuth, handleDatabase, handleUser, handleParaglide);
