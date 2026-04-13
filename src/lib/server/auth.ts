import type { Cookies } from '@sveltejs/kit';
import type { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { dev } from '$app/environment';
import { SESSION_COOKIE } from '$lib';
import { createSession, findSession, findUser } from '$lib/server/db/functions';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const THREE_DAYS_IN_MS = 3 * ONE_DAY_IN_MS;

export async function getLoggedInUser(c: Context) {
  const sessionToken = getCookie(c, SESSION_COOKIE);
  if (!sessionToken) {
    return null;
  }

  const session = await findSession(sessionToken);
  if (!session) {
    return null;
  }

  const user = await findUser(session.userId);
  if (!user) {
    return null;
  }

  if (needsRefresh(session.expiresAt)) {
    const newSession = await createSession(session.userId);

    setCookie(c, SESSION_COOKIE, newSession.id, {
      path: '/',
      httpOnly: true,
      secure: !dev,
      sameSite: 'Lax',
      expires: newSession.expiresAt
    });
  }

  return user;
}

export function needsRefresh(expiresAt: Date): boolean {
  const now = Date.now();
  const expirationTime = expiresAt.getTime();

  // Calculate milliseconds until expiration
  const timeRemaining = expirationTime - now;

  // If less than 3 days remaining AND it hasn't already expired
  return timeRemaining < THREE_DAYS_IN_MS && timeRemaining > 0;
}

export function deleteSessionCookie(cookies: Cookies) {
  cookies.delete(SESSION_COOKIE, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: !dev
  });
}
