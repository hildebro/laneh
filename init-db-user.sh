#!/bin/bash
set -e

# This script runs as the superuser ($POSTGRES_USER) on first startup.
# We create a restricted user and grant it basic CRUD permissions.

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER $APP_DB_USER WITH PASSWORD '$APP_DB_PASSWORD';
    GRANT CONNECT ON DATABASE $POSTGRES_DB TO $APP_DB_USER;
    GRANT USAGE ON SCHEMA public TO $APP_DB_USER;

    -- Grant permissions on existing tables
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO $APP_DB_USER;

    -- Ensure the user gets permissions for any future tables created by the root user
    ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO $APP_DB_USER;
EOSQL