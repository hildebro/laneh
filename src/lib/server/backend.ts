import { drizzle } from 'drizzle-orm/node-postgres';
import { AsyncLocalStorage } from 'node:async_hooks';
import pg from 'pg';
import { env } from '$env/dynamic/private';
import app from '$lib/backend/api';
import { dbOptions, setDb } from '$lib/backend/db';
import { setTransactionContext } from '$lib/context';

let initialized = false;

// Node runtime for the shared backend. Kept in the server folder, so none of it ends up in the mobile build.
// Initialized on the first request, since SvelteKit also imports this module while building.
export function getServerApp() {
  if (!initialized) {
    if (!env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set.');
    }

    setDb(drizzle(new pg.Pool({ connectionString: env.DATABASE_URL }), dbOptions));
    setTransactionContext(new AsyncLocalStorage());
    initialized = true;
  }

  return app;
}
