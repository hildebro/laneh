import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { base } from '$app/paths';
import { PARAGLIDE_COOKIE, USER_COOKIE } from '$lib';
import { transactionContext } from '$lib/context';
import { i18n } from '$lib/i18n';
import { availableLanguageTags, sourceLanguageTag } from '$lib/paraglide/runtime';
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

/**
 * If a user tries to access a page without language prefix, i.e. /chorehub/a/b instead of /chorehub/{LANG}/a/b,
 * we check their paraglide-cookie. If that cookie points to a language other than the source language,
 * we redirect them to that language prefix.
 */
const handleParaglideRedirect: Handle = async ({ event, resolve }) => {
  const { pathname, search } = event.url;

  const pathContainsLanguage = availableLanguageTags.find(lang =>
    pathname.startsWith(`${base}/${lang}`)
  );
  if (pathContainsLanguage) {
    // No need to redirect, if a language prefix already exists.
    return resolve(event);
  }

  const cookieLang = event.cookies.get(PARAGLIDE_COOKIE);
  if (!cookieLang || !(availableLanguageTags as readonly string[]).includes(cookieLang)) {
    // Cannot redirect, if no paraglide cookie exists or contains invalid data.
    return resolve(event);
  }

  if (cookieLang === sourceLanguageTag) {
    // No need to redirect, if the cookie language is the source language.
    return resolve(event);
  }

  // Construct the correct redirect path:
  // Extract the part of the path *after* the base path.
  //     Example: if pathname is '/chorehub/settings/users', relativePath is '/settings/users'
  //     Example: if pathname is '/chorehub', relativePath is ''
  //     Example: if pathname is '/chorehub/', relativePath is '/'
  let relativePath = pathname.substring(base.length);
  // Then ensure relativePath starts with '/', if it's not empty.
  if (relativePath === '') {
    relativePath = '/'; // Handle root case like /chorehub -> /chorehub/de/
  } else if (!relativePath.startsWith('/')) {
    relativePath = '/' + relativePath; // Should normally start with '/', but safety check
  }

  // Build the new path: base + lang + relativePath + search
  const newPath = `${base}/${cookieLang}${relativePath}${search}`;

  console.log(`Redirecting based on '${PARAGLIDE_COOKIE}' cookie: ${pathname}/${search} -> ${newPath}`);

  return redirect(302, newPath);
};

const handleParaglide: Handle = i18n.handle();
export const handle: Handle = sequence(handleAuth, handleDatabase, handleUser, handleParaglideRedirect, handleParaglide);
