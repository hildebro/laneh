import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { APP_USER_ROLE_SQL } from '../src/lib/backend/db/roles.ts';

const dataDir = process.env.DOCKER_DATABASE_LOCATION || '/data/pglite';

async function run() {
  console.log(`⏳ Running migrations on database at ${dataDir}...`);

  // Initialize minimal client just for migrations
  const client = new PGlite(dataDir);
  const db = drizzle(client, { casing: 'snake_case' });

  await migrate(db, { migrationsFolder: 'drizzle' });

  await client.exec(APP_USER_ROLE_SQL);

  console.log('✅ Migrations complete!');

  await client.close();

  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1); // Fails the container startup if migrations break
});
