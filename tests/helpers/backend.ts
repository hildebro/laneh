import { PGlite } from '@electric-sql/pglite';
import { sql } from 'drizzle-orm';
import { drizzle as drizzleNodePg } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { AsyncLocalStorage } from 'node:async_hooks';
import pg from 'pg';
import app from '$lib/backend/api';
import { type Database, dbOptions, setDb } from '$lib/backend/db';
import { migrateDb } from '$lib/backend/db/migrate';
import { APP_USER_ROLE_SQL } from '$lib/backend/db/roles';
import { SerialContext, setTransactionContext } from '$lib/context';
import { Admin } from '$lib/utils/userHelper';

// Test runtime for the shared backend. Uses an in-memory PGlite by default, like the local app. With TEST_DATABASE_URL
// set, it uses a real Postgres with node-postgres, like the server.
export async function startTestBackend() {
  let db: Database;
  let close: () => Promise<void>;

  const databaseUrl = process.env.TEST_DATABASE_URL;
  if (databaseUrl) {
    const pool = new pg.Pool({ connectionString: databaseUrl });
    const nodePgDb = drizzleNodePg(pool, dbOptions);
    await migrate(nodePgDb, { migrationsFolder: 'drizzle' });
    db = nodePgDb;
    await pool.query(APP_USER_ROLE_SQL);
    setTransactionContext(new AsyncLocalStorage());
    close = () => pool.end();
  } else {
    const client = await PGlite.create();
    db = drizzlePglite(client, dbOptions);
    await migrateDb(client, db);
    setTransactionContext(new SerialContext());
    close = () => client.close();
  }

  setDb(db);

  // Empties all tables, so every test starts from a fresh instance. Migrations live in their own schema and stay.
  async function reset() {
    const result = await db.execute<{ tablename: string }>(
      sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`
    );
    const tables = result.rows.map((row) => `"${row.tablename}"`).join(', ');
    await db.execute(sql.raw(`TRUNCATE ${tables} CASCADE`));
  }

  return { db, reset, close };
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string;
};

// Sends a request to the backend, like the api client does. The token is passed as bearer, like on mobile.
export async function request(path: string, { method = 'GET', body, token }: RequestOptions = {}) {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return app.request(`/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

// Uploads a file as form data, like the import on the setup page.
export async function upload(path: string, field: string, file: File, token?: string) {
  const headers = new Headers();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const body = new FormData();
  body.set(field, file);

  return app.request(`/api${path}`, { method: 'POST', headers, body });
}

// Downloads a backup of the database and wraps it as a file, ready to be imported again.
export async function exportBackup(token: string) {
  const response = await request('/users/export', { token });
  if (response.status !== 200) {
    throw new Error(`Export failed with ${response.status}\n${await response.text()}`);
  }

  return new File([await response.arrayBuffer()], 'backup.tar.gz', { type: 'application/gzip' });
}

export async function importBackup(file: File) {
  return upload('/public/importDatabase', 'dumpFile', file);
}

// Sends a request and returns the parsed body. Fails on unexpected status codes, to keep the tests short.
export async function call<T = unknown>(path: string, options: RequestOptions & { status?: number } = {}) {
  const { status = 200, ...requestOptions } = options;

  const response = await request(path, requestOptions);
  if (response.status !== status) {
    throw new Error(`${requestOptions.method ?? 'GET'} ${path}: expected ${status}, got ${response.status}\n${await response.text()}`);
  }

  return (await response.json()) as T;
}

export const TEST_PASSWORD = 'password123';

// Initiates the instance with a household and its server admin. Returns the admin's session token.
export async function initiate(householdName = 'Home', username = 'admin') {
  const result = await call<{ sessionToken: string }>('/public/initiate', {
    method: 'POST',
    body: { householdName, username, password: TEST_PASSWORD }
  });

  return result.sessionToken;
}

export async function login(householdName: string, username: string) {
  return call<string>('/public/login', {
    method: 'POST',
    body: { householdName, username, password: TEST_PASSWORD }
  });
}

type TestUser = { id: string; username: string; householdId: string };

export async function findUsers(token: string) {
  return call<TestUser[]>('/users', { token });
}

// Adds a user to the household of the token's user and logs them in.
export async function addUser(adminToken: string, householdName: string, username: string, admin = Admin.None) {
  const [adminUser] = await findUsers(adminToken);
  await call('/users/update', {
    method: 'POST',
    token: adminToken,
    body: { id: null, householdId: adminUser.householdId, username, password: TEST_PASSWORD, admin }
  });

  const token = await login(householdName, username);
  const user = (await findUsers(token)).find((u) => u.username === username) as TestUser;

  return { ...user, token };
}

// Adds another household with an admin, as the server admin would. Returns the new admin, logged in.
export async function addHousehold(serverAdminToken: string, householdName: string, username = 'admin') {
  await call('/households', { method: 'POST', token: serverAdminToken, body: { name: householdName } });
  const households = await call<{ id: string; name: string }[]>('/households', { token: serverAdminToken });
  const household = households.find((h) => h.name === householdName)!;

  await call('/users/update', {
    method: 'POST',
    token: serverAdminToken,
    body: { id: null, householdId: household.id, username, password: TEST_PASSWORD, admin: Admin.Household }
  });

  const token = await login(householdName, username);
  const user = (await findUsers(token)).find((u) => u.username === username) as TestUser;

  return { ...user, token };
}
