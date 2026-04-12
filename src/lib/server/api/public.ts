import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { dev } from '$app/environment';
import { SESSION_COOKIE } from '$lib';
import { addUser, createSession, findAllUsers } from '$lib/server/db/functions';
import { z } from '$lib/zod';

const userInitiationSchema = z.object({
  username: z.string().trim().nonempty(),
  password: z.string().nonempty()
});

const publicRouter = new Hono()
  .get('/needsInitiation', async (c) => {
    const users = await findAllUsers();
    return c.json(users.length === 0);
  })
  .post('/initiate', zValidator('json', userInitiationSchema), async (c) => {
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
;

export default publicRouter;
