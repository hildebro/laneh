import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { dev } from '$app/environment';
import { SESSION_COOKIE } from '$lib';
import { needsRefresh } from '$lib/server/auth';
import { createSession, findAllUsers, findSession, findUser } from '$lib/server/db/functions';

const usersRouter = new Hono()
  .get('/', async (c) => {
    return c.json(await findAllUsers());
  })
  .get('/loggedInUser', async (c) => {
    const sessionToken = getCookie(c, SESSION_COOKIE);

    if (!sessionToken) {
      return c.json(null);
    }

    const session = await findSession(sessionToken);
    if (!session) {
      return c.json(null);
    }

    const user = await findUser(session.userId);
    if (!user) {
      return c.json(null);
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

    return c.json({
      id: user.id,
      username: user.username
    });
  })
;

export default usersRouter;
