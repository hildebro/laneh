import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/server/db/schema.ts',

  dbCredentials: {
    // Provide a fallback empty string to satisfy TypeScript during the build stage.
    // Drizzle Kit will use the actual process.env.DATABASE_URL at runtime.
    url: process.env.DATABASE_URL || '',
  },

  migrations: {
    prefix: 'timestamp',
    table: '__drizzle_migrations__',
    schema: 'public'
  },

  verbose: true,
  strict: true,
  dialect: 'postgresql',
  casing: 'snake_case'
});
