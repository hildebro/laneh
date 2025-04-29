import type { Cookies } from '@sveltejs/kit';
import { sign, unsign } from 'cookie-signature';
import { authenticator } from 'otplib';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { USER_COOKIE } from '$lib';

const OTP_SECRET = env.OTP_SECRET;
const SESSION_SECRET = env.SESSION_SECRET;
const REFRESH_SECRET = env.REFRESH_SECRET;
const SESSION_EXPIRY = env.SESSION_EXPIRY || '1h';
const REFRESH_TOKEN_EXPIRY = env.REFRESH_TOKEN_EXPIRY || '7d';
const MIN_DELAY_MS = 1000;
const MAX_DELAY_MS = 5000;

if (!OTP_SECRET || !SESSION_SECRET || !REFRESH_SECRET) {
  console.error('Missing required environment variables for authentication!');
  throw new Error('Missing authentication secrets.  See console.');
}

function getRandomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function verifyOTP(token: string): Promise<boolean> {
  try {
    const isValid = authenticator.verify({ token, secret: OTP_SECRET });
    if (!isValid) {
      const delayMs = getRandomDelay(MIN_DELAY_MS, MAX_DELAY_MS);
      await delay(delayMs);
    }

    return isValid;
  } catch (err) {
    console.error('OTP verification error:', err);
    return false;
  }
}

export async function createSession(cookies: Cookies): Promise<void> {
  const sessionToken = crypto.randomUUID();
  const signedSessionToken = sign(sessionToken, SESSION_SECRET);

  cookies.set('session', signedSessionToken, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: !dev, // Use secure cookies in production
    maxAge: parseDuration(SESSION_EXPIRY)
  });

  const refreshToken = crypto.randomUUID();
  const signedRefreshToken = sign(refreshToken, REFRESH_SECRET);
  cookies.set('refresh', signedRefreshToken, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: !dev, // Use secure cookies in production
    maxAge: parseDuration(REFRESH_TOKEN_EXPIRY) //seconds
  });
}

export async function getSession(cookies: Cookies): Promise<string | null> {
  const signedSessionToken = cookies.get('session');
  if (!signedSessionToken) {
    return null;
  }

  const unsignedSessionToken = unsign(signedSessionToken, SESSION_SECRET);
  if (unsignedSessionToken === false) {
    // Invalid signature, delete the cookie
    cookies.delete('session', { path: '/' });
    return null;
  }
  return unsignedSessionToken;
}

export async function refreshSession(cookies: Cookies): Promise<boolean> {
  const signedRefreshToken = cookies.get('refresh');
  if (!signedRefreshToken) {
    return false;
  }
  const unsignedRefreshToken = unsign(signedRefreshToken, REFRESH_SECRET);

  if (unsignedRefreshToken === false) {
    cookies.delete('refresh', { path: '/' });
    return false;
  }

  // If refresh token is valid, create a new session
  await createSession(cookies);
  return true;
}

export function setUser(cookies: Cookies, userId: string) {
  cookies.set(USER_COOKIE, userId, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: !dev, // Use secure cookies in production
    maxAge: parseDuration(REFRESH_TOKEN_EXPIRY) // Very long duration
  });
}

// Helper to parse duration strings like "1h", "7d", etc.
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid duration: ${duration}`);
  }
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 60 * 60 * 24;
    default:
      throw new Error(`Invalid duration unit: ${unit}`);
  }
}