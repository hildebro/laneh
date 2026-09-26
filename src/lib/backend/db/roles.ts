// Role used for row level security. Applied after migrations on the node server (scripts/migrate.ts) and in the
// local app. Kept free of imports, so the migration script can load it with plain node.
export const APP_USER_ROLE_SQL = `
  DO $$ 
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'app_user') THEN
      CREATE ROLE app_user;
    END IF;
  END
  $$;

  -- Grant basic access to the schema
  GRANT USAGE ON SCHEMA public TO app_user;

  -- Grant access to all existing tables and sequences
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;
  GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;

  -- CRITICAL: Automatically grant permissions for any FUTURE tables/sequences you add later
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO app_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO app_user;
`;
