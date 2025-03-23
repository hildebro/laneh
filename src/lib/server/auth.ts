import { authenticator } from 'otplib';
import { env } from '$env/dynamic/private';
import { sign, unsign } from 'cookie-signature';
import type { Cookies } from '@sveltejs/kit';
import { dev } from '$app/environment';

const OTP_SECRET = env.OTP_SECRET;
const SESSION_SECRET = env.SESSION_SECRET;
const REFRESH_SECRET = env.REFRESH_SECRET;
const SESSION_EXPIRY = env.SESSION_EXPIRY || '1h';  // Default to 1 hour
const REFRESH_TOKEN_EXPIRY = env.REFRESH_TOKEN_EXPIRY || '7d'; // Default to 7 days

if (!OTP_SECRET || !SESSION_SECRET || !REFRESH_SECRET) {
  console.error("Missing required environment variables for authentication!");
  throw new Error("Missing authentication secrets.  See console.");
}

export function verifyOTP(token: string): boolean {
  try {
    return authenticator.verify({ token, secret: OTP_SECRET });
  } catch (err) {
    console.error("OTP verification error:", err);
    return false;
  }
}

export async function createSession(cookies: Cookies): Promise<void> {
  const sessionToken = crypto.randomUUID(); // Generate a unique session token
  const signedSessionToken = sign(sessionToken, SESSION_SECRET);

  cookies.set('session', signedSessionToken, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: !dev, // Use secure cookies in production
    maxAge: parseDuration(SESSION_EXPIRY), // seconds
  });

  // Optional: Create and set refresh token
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

export function clearSession(cookies: Cookies): void {
  cookies.delete('session', { path: '/' });
  cookies.delete('refresh', { path: '/' });
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
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 60 * 60 * 24;
    default: throw new Error(`Invalid duration unit: ${unit}`);
  }
}