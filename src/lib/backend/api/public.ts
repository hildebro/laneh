import { zValidator } from '@hono/zod-validator';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { dev } from '$app/environment';
import { SESSION_COOKIE } from '$lib';
import { getLoggedInUser, isOfflineLoginEnabled } from '$lib/backend/auth';
import {
  addHousehold,
  addUser,
  createSession,
  findAllUsers,
  findAndVerifyUser,
  findOfflineUser,
  getCachedRemoteVersion,
  setCachedRemoteVersion
} from '$lib/backend/db/functions';
import { extractTarGz } from '$lib/backend/db/tar';
import { getAdminTx } from '$lib/context';
import { Admin } from '$lib/utils/userHelper';
import { z } from '$lib/zod';

const initiateSchema = z.object({
  householdName: z.string().trim().nonempty(),
  username: z.string().trim().nonempty(),
  password: z.string().min(6).max(64)
});

const offlineInitiateSchema = z.object({
  householdName: z.string().trim().nonempty(),
  username: z.string().trim().nonempty()
});

const loginSchema = z.object({
  householdName: z.string().trim().nonempty(),
  username: z.string().trim(),
  password: z.string()
});

const importSchema = z.object({
  dumpFile: z.file().mime(['application/gzip']).nonoptional()
});

const publicRouter = new Hono()
  .get('/version', async (c) => {
    const serverVersion = __APP_VERSION__;

    const cachedRemoteVersion = await getCachedRemoteVersion();
    if (cachedRemoteVersion) {
      return c.json({ remoteVersion: cachedRemoteVersion, serverVersion });
    }

    // Fails without internet access, which is common in offline mode.
    const res = await fetch('https://api.github.com/repos/hildebro/laneh/releases/latest').catch(() => null);
    if (!res?.ok) {
      return c.json({ remoteVersion: '?', serverVersion });
    }

    const data = await res.json();
    const remoteVersion = data.tag_name.replace('v', '') as string;
    await setCachedRemoteVersion(remoteVersion);

    return c.json({ remoteVersion, serverVersion });
  })
  .get('/needsInitiation', async (c) => {
    const users = await findAllUsers();
    return c.json(users.length === 0);
  })
  .post('/initiate', zValidator('json', initiateSchema), async (c) => {
    const users = await findAllUsers();
    if (users.length > 0) {
      return c.json({ success: false }, 405);
    }

    const initiateData = c.req.valid('json');

    const householdId = await addHousehold(initiateData.householdName);
    const userId = await addUser(initiateData.username, initiateData.password, householdId, Admin.Server);

    const session = await createSession(userId);
    setCookie(c, SESSION_COOKIE, session.id, {
      path: '/',
      httpOnly: true,
      secure: !dev,
      sameSite: 'Lax',
      expires: session.expiresAt
    });

    // The mobile app can't use the cookie, so it needs the token as well.
    return c.json({ success: true, sessionToken: session.id });
  })
  .post('/offline/initiate', zValidator('json', offlineInitiateSchema), async (c) => {
    if (!isOfflineLoginEnabled()) {
      return c.json({ success: false }, 404);
    }

    const users = await findAllUsers();
    if (users.length > 0) {
      return c.json({ success: false }, 405);
    }

    const initiateData = c.req.valid('json');

    // Nobody ever needs this password, since the offline app logs in without credentials.
    const password = encodeHexLowerCase(crypto.getRandomValues(new Uint8Array(32)));

    const householdId = await addHousehold(initiateData.householdName);
    const userId = await addUser(initiateData.username, password, householdId, Admin.Server);

    const session = await createSession(userId);

    return c.json({ success: true, sessionToken: session.id });
  })
  .post('/offline/login', async (c) => {
    if (!isOfflineLoginEnabled()) {
      return c.json({ sessionToken: null }, 404);
    }

    // Null, if the offline instance still needs initiation.
    const user = await findOfflineUser();
    if (!user) {
      return c.json({ sessionToken: null });
    }

    const session = await createSession(user.id);

    return c.json({ sessionToken: session.id });
  })
  .post('/importDatabase', zValidator('form', importSchema), async (c) => {
    const users = await findAllUsers();
    if (users.length > 0) {
      return c.json({ success: false }, 405);
    }

    const importFile = c.req.valid('form');

    const files = await extractTarGz(await importFile.dumpFile.arrayBuffer());
    const queries = files
      .filter((file) => file.name.endsWith('.sql'))
      .map((file) => file.content.trim())
      .filter((query) => query);

    const tx = await getAdminTx();
    try {
      // SET LOCAL automatically reverts when the transaction ends!
      // No need for a finally block to clean it up.
      await tx.execute(sql`SET LOCAL session_replication_role = 'replica';`);

      for (const query of queries) {
        await tx.execute(sql.raw(query));
      }
    } catch (err) {
      // Now we will actually see why the import is failing!
      console.error('❌ Database Import Failed:', err);

      // Re-throw the error so Drizzle knows to safely ROLLBACK the transaction
      throw err;
    }

    return c.json({ success: true });
  })
  .post('/login', zValidator('json', loginSchema), async (c) => {
    const user = c.req.valid('json');

    const matchingUser = await findAndVerifyUser(user.username, user.password, user.householdName);
    if (!matchingUser) {
      const error = new z.ZodError([
        {
          code: 'custom',
          path: ['form'],
          message: 'auth_login_invalid'
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
      username: user.username,
      admin: user.admin,
      helpDisclaimerDismissed: user.helpDisclaimerDismissed
    });
  })
  .get('/marco', async (c) => {
    return c.json('polo');
  })
;

export default publicRouter;
