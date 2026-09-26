import type { PGlite } from '@electric-sql/pglite';
import { drizzle, type PgliteDatabase } from 'drizzle-orm/pglite';
import * as schema from './schema';

export type Database = PgliteDatabase<typeof schema>;

// The database is injected by the runtime (node server or local app), since each one stores its data differently.
let database: Database | undefined;

export function createDb(client: PGlite): Database {
  return drizzle(client, { casing: 'snake_case', schema });
}

export function setDb(db: Database) {
  database = db;
}

export function getDb(): Database {
  if (!database) {
    throw new Error('Database is not initialized. Call setDb() before handling requests.');
  }

  return database;
}
