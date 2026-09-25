import { PGlite } from '@electric-sql/pglite';
import { AsyncLocalStorage } from 'node:async_hooks';
import { env } from '$env/dynamic/private';
import app from '$lib/backend/api';
import { createDb, setDb } from '$lib/backend/db';
import { setTransactionContext } from '$lib/context';

// Node runtime for the shared backend. Kept in the server folder, so none of it ends up in the mobile build.
const dataDir = env.DOCKER_DATABASE_LOCATION || '/data/pglite';

setDb(createDb(new PGlite(dataDir)));
setTransactionContext(new AsyncLocalStorage());

export default app;
