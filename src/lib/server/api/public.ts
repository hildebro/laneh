import { zValidator } from '@hono/zod-validator';
import { sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { Readable } from 'node:stream';
import zlib from 'node:zlib';
import tar from 'tar-stream';
import { dev } from '$app/environment';
import { SESSION_COOKIE } from '$lib';
import { getLocale, getTx } from '$lib/context';
import * as m from '$lib/paraglide/messages.js';
import { getLoggedInUser } from '$lib/server/auth';
import { addUser, createSession, findAllUsers, findAndVerifyUser } from '$lib/server/db/functions';
import { z } from '$lib/zod';

const userSchema = z.object({
  username: z.string().trim().nonempty(),
  password: z.string().min(6).max(64)
});

const importSchema = z.object({
  dumpFile: z.file().mime(['application/gzip']).nonoptional()
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
  .post('/importDatabase', zValidator('form', importSchema), async (c) => {
    const users = await findAllUsers();
    if (users.length > 0) {
      return c.json({ success: false }, 405);
    }

    const importFile = c.req.valid('form');

    // Convert the uploaded file to a Node Buffer
    const arrayBuffer = await importFile.dumpFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const queries: string[] = [];

    await new Promise<void>((resolve, reject) => {
      const extract = tar.extract();

      extract.on('entry', (header, stream, next) => {
        // Only process .sql files
        if (!header.name.endsWith('.sql')) {
          stream.on('end', () => next());
          stream.resume();

          return;
        }

        let sqlContent = '';
        stream.on('data', (chunk) => {
          sqlContent += chunk;
        });
        stream.on('end', () => {
          if (sqlContent.trim()) queries.push(sqlContent);
          next();
        });
      });

      extract.on('finish', () => resolve());
      extract.on('error', (err) => reject(err));

      // Pipe the buffer through gunzip and into the tar extractor
      Readable.from(buffer).pipe(zlib.createGunzip()).pipe(extract);
    });

    const db = getTx();
    // Temporarily disable foreign key constraints and triggers for the import
    await db.execute(sql`SET session_replication_role = replica;`);

    for (const query of queries) {
      await db.execute(sql.raw(query));
    }

    // Re-enable constraints
    await db.execute(sql`SET session_replication_role = origin;`);

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
          message: m.auth_login_invalid({}, { locale: getLocale() })
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

    return c.json(session.id);
  })
  .get('/loggedInUser', async (c) => {
    const user = await getLoggedInUser(c);
    if (!user) {
      return c.json(null);
    }

    return c.json({
      id: user.id,
      username: user.username
    });
  })
  .get('/marco', async (c) => {
    return c.json('polo');
  })
;

export default publicRouter;
