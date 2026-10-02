import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import { APP_USER_ROLE_SQL } from '../src/lib/backend/db/roles.ts';

async function run() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set.');
  }

  console.log('⏳ Running migrations...');

  // Initialize minimal client just for migrations
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const db = drizzle(client, { casing: 'snake_case' });

  await migrate(db, { migrationsFolder: 'drizzle' });

  await client.query(APP_USER_ROLE_SQL);

  console.log('✅ Migrations complete!');

  await client.end();

  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1); // Fails the container startup if migrations break
});
