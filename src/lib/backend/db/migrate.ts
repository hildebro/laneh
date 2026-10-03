import type { PGlite } from '@electric-sql/pglite';
import { pg_trgm } from '@electric-sql/pglite/contrib/pg_trgm';
import { unaccent } from '@electric-sql/pglite/contrib/unaccent';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';
import type { MigrationMeta } from 'drizzle-orm/migrator';
import { PgDialect, type PgSession } from 'drizzle-orm/pg-core';
import journal from '../../../../drizzle/meta/_journal.json';
import type { Database } from '$lib/backend/db';
import { APP_USER_ROLE_SQL } from '$lib/backend/db/roles';

// The migration files are bundled at build time, since the local app has no file system access to read them.
const migrationFiles = import.meta.glob<string>('/drizzle/*.sql', { query: '?raw', import: 'default', eager: true });

// Postgres extensions created by the migrations. PGlite only ships them, if they are passed to PGlite.create().
export const pgliteExtensions = { pg_trgm, unaccent };

// Same as drizzle's readMigrationFiles(), but based on the bundled files.
function getMigrations(): MigrationMeta[] {
  return journal.entries.map((entry) => {
    const query = migrationFiles[`/drizzle/${entry.tag}.sql`];
    if (query === undefined) {
      throw new Error(`Missing migration file for ${entry.tag}`);
    }

    return {
      sql: query.split('--> statement-breakpoint'),
      bps: entry.breakpoints,
      folderMillis: entry.when,
      hash: encodeHexLowerCase(sha256(new TextEncoder().encode(query)))
    };
  });
}

// Uses the same migrations table as drizzle's migrator in scripts/migrate.ts.
export async function migrateDb(client: PGlite, db: Database) {
  // The schema generics of the session are irrelevant for migrations, but don't match the dialect's signature.
  await new PgDialect().migrate(getMigrations(), db._.session as unknown as PgSession, {
    migrationsFolder: 'drizzle' // Unused, since the migrations are passed in directly.
  });
  await client.exec(APP_USER_ROLE_SQL);
}
