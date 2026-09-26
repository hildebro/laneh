import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import * as schema from './schema';

type QueryResult<TRow> = { rows: TRow[] };

// Query result shape shared by PGlite and node-postgres. Only the rows are used, so the driver doesn't matter.
export interface QueryResultHKT extends PgQueryResultHKT {
  type: QueryResult<this['row']>;
}

export type Database = PgDatabase<QueryResultHKT, typeof schema>;

// Options for drizzle(), so every runtime creates the same database, regardless of the driver.
export const dbOptions = { casing: 'snake_case', schema } as const;

// The database is injected by the runtime (node server or local app), since each one uses a different driver.
let database: Database | undefined;

export function setDb(db: Database) {
  database = db;
}

export function getDb(): Database {
  if (!database) {
    throw new Error('Database is not initialized. Call setDb() before handling requests.');
  }

  return database;
}
