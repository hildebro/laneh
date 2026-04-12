import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { dev } from '$app/environment';
import { SESSION_COOKIE } from '$lib';
import * as m from '$lib/paraglide/messages.js';
import { needsRefresh } from '$lib/server/auth';
import { createSession, findAllUsers, findAndVerifyUser, findSession, findUser } from '$lib/server/db/functions';
import { z } from '$lib/zod';

const userLoginSchema = z.object({
  username: z.string().trim().nonempty(),
  password: z.string().nonempty()
});

const usersRouter = new Hono()
  .get('/', async (c) => {
    return c.json(await findAllUsers());
  })
  .post('/login', zValidator('json', userLoginSchema), async (c) => {
    const user = c.req.valid('json');

    const matchingUser = await findAndVerifyUser(user.username, user.password);
    if (!matchingUser) {
      return c.json({ username: m.auth_login_invalid() });
    }

    const session = await createSession(matchingUser.id);
    setCookie(c, SESSION_COOKIE, session.id, {
      path: '/',
      httpOnly: true,
      secure: !dev,
      sameSite: 'Lax',
      expires: session.expiresAt
    });

    return c.json({ success: true });
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
