import { zValidator } from '@hono/zod-validator';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { dev } from '$app/environment';
import { SESSION_COOKIE } from '$lib';
import { getLoggedInUser } from '$lib/backend/auth';
import { DUMP_MANIFEST_FILE, type DumpManifest } from '$lib/backend/db/export';
import {
  addHousehold,
  addUser,
  completeAllHouseholdSetups,
  countAllHouseholds,
  createSession,
  findAllUsers,
  findAndVerifyUser,
  findLocalUser,
  getCachedRemoteVersion,
  importDatabaseDump,
  refreshShoppingItemStats,
  rollbackDatabaseImport,
  setCachedRemoteVersion
} from '$lib/backend/db/functions';
import { extractTarGz } from '$lib/backend/db/tar';
import { isLocalRuntime } from '$lib/backend/runtime';
import { Admin } from '$lib/utils/userHelper';
import { compareVersions } from '$lib/utils/versionHelper';
import { z } from '$lib/zod';

const initiateSchema = z.object({
  householdName: z.string().trim().nonempty(),
  username: z.string().trim().nonempty(),
  password: z.string().min(6).max(64)
});

const localInitiateSchema = z.object({
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

// Reads the manifest of a dump. Null for dumps from before the manifest existed.
function readDumpManifest(files: { name: string; content: string }[]): DumpManifest | null {
  const manifestFile = files.find((file) => file.name === DUMP_MANIFEST_FILE);
  if (!manifestFile) {
    return null;
  }

  try {
    return JSON.parse(manifestFile.content) as DumpManifest;
  } catch {
    return null;
  }
}

const serverDumpError = new z.ZodError([
  {
    code: 'custom',
    path: ['dumpFile'],
    message: 'settings_actions_import_server_dump'
  }
]);

const versionSchema = z.object({
  appVersion: z.string().optional()
});

const publicRouter = new Hono()
  .get('/version', zValidator('query', versionSchema), async (c) => {
    const serverVersion = __APP_VERSION__;
    const { appVersion } = c.req.valid('query');

    // A server or app newer than the cached remote version means a release happened since it was cached.
    const cachedRemoteVersion = await getCachedRemoteVersion();
    const cacheOutdated =
      cachedRemoteVersion &&
      [serverVersion, appVersion].some((version) => version && compareVersions(version, cachedRemoteVersion) > 0);
    if (cachedRemoteVersion && !cacheOutdated) {
      return c.json({ remoteVersion: cachedRemoteVersion, serverVersion });
    }

    // Fails without internet access, which the local app doesn't need otherwise.
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
  .post('/local/initiate', zValidator('json', localInitiateSchema), async (c) => {
    if (!isLocalRuntime()) {
      return c.json({ success: false }, 404);
    }

    const users = await findAllUsers();
    if (users.length > 0) {
      return c.json({ success: false }, 405);
    }

    const initiateData = c.req.valid('json');

    // Nobody ever needs this password, since the local app logs in without credentials.
    const password = encodeHexLowerCase(crypto.getRandomValues(new Uint8Array(32)));

    const householdId = await addHousehold(initiateData.householdName);
    const userId = await addUser(initiateData.username, password, householdId, Admin.Server);

    const session = await createSession(userId);

    return c.json({ success: true, sessionToken: session.id });
  })
  .post('/local/login', async (c) => {
    if (!isLocalRuntime()) {
      return c.json({ sessionToken: null }, 404);
    }

    // Null, if the local instance still needs initiation.
    const user = await findLocalUser();
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

    // A local instance is meant for a single household, so server dumps don't belong there.
    const manifest = readDumpManifest(files);
    if (isLocalRuntime() && manifest && !manifest.local) {
      return c.json({ success: false, error: serverDumpError }, 400);
    }

    const queries = files
      .filter((file) => file.name.endsWith('.sql'))
      .map((file) => file.content.trim())
      .filter((query) => query);

    try {
      await importDatabaseDump(queries);
    } catch (err) {
      // Now we will actually see why the import is failing!
      console.error('❌ Database Import Failed:', err);

      // Re-throw the error so Drizzle knows to safely ROLLBACK the transaction
      throw err;
    }

    // Dumps from before the manifest can't tell where they came from. The household count has to decide instead.
    if (isLocalRuntime() && !manifest && await countAllHouseholds() > 1) {
      await rollbackDatabaseImport();

      return c.json({ success: false, error: serverDumpError }, 400);
    }

    // Dumps don't contain the stats. The imported purchases are older than the last calculation, so all items need to
    // be recalculated.
    await refreshShoppingItemStats(null);

    // The imported households have been set up already, so their categories must not be mixed with the default ones.
    // Dumps from before the setup wizard don't contain the flag. Only an empty instance can be imported into, so all
    // households are imported ones.
    await completeAllHouseholdSetups();

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
