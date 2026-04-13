import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { dev } from '$app/environment';
import { SESSION_COOKIE } from '$lib';
import * as m from '$lib/paraglide/messages.js';
import { needsRefresh } from '$lib/server/auth';
import {
  addUser,
  createSession,
  findAllUsers,
  findAndVerifyUser,
  findSession,
  findUser
} from '$lib/server/db/functions';
import { z } from '$lib/zod';

const userSchema = z.object({
  username: z.string().trim().nonempty(),
  password: z.string().nonempty()
});

const publicRouter = new Hono()
  .get('/needsInitiation', async (c) => {
    const users = await findAllUsers();
    return c.json(users.length === 0);
  })
  .post('/initiate', zValidator('json', userSchema), async (c) => {
    const users = await findAllUsers();
    if (users.length > 0) {
      return c.json({ success: false }, 405);
    }

    const user = c.req.valid('json');

    const userId = await addUser(user.username, user.password);

    const session = await createSession(userId);
    setCookie(c, SESSION_COOKIE, session.id, {
      path: '/',
      httpOnly: true,
      secure: !dev,
      sameSite: 'Lax',
      expires: session.expiresAt
    });

    return c.json({ success: true });
  })
  .post('/login', zValidator('json', userSchema), async (c) => {
    const user = c.req.valid('json');

    const matchingUser = await findAndVerifyUser(user.username, user.password);
    if (!matchingUser) {
      const error = new z.ZodError([
        {
          code: 'custom',
          path: ['username'],
          message: m.auth_login_invalid()
        }
      ]);

      return c.json({ success: false, error }, 400);
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

export default publicRouter;
