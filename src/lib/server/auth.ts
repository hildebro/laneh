import type { Cookies } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { SESSION_COOKIE } from '$lib';
import type { Session } from '$lib/server/db/schema';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const THREE_DAYS_IN_MS = 3 * ONE_DAY_IN_MS;

export function needsRefresh(expiresAt: Date): boolean {
  const now = Date.now();
  const expirationTime = expiresAt.getTime();

  // Calculate milliseconds until expiration
  const timeRemaining = expirationTime - now;

  // If less than 3 days remaining AND it hasn't already expired
  return timeRemaining < THREE_DAYS_IN_MS && timeRemaining > 0;
}

export function setSessionCookie(cookies: Cookies, session: Session) {
  cookies.set(SESSION_COOKIE, session.id, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: !dev,
    expires: session.expiresAt
  });
}

export function deleteSessionCookie(cookies: Cookies) {
  cookies.delete(SESSION_COOKIE, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: !dev
  });
}
