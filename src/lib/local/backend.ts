import { PGlite } from '@electric-sql/pglite';
import app from '$lib/backend/api';
import { createDb, setDb } from '$lib/backend/db';
import { migrateDb } from '$lib/backend/db/migrate';
import { enableLocalRuntime } from '$lib/backend/runtime';
import { SerialContext, setTransactionContext } from '$lib/context';

// Local runtime for the shared backend. The database is stored in the WebView's IndexedDB.
export async function startLocalBackend(dataDir = 'idb://laneh') {
  // Ask the browser not to evict the database under storage pressure. Not supported everywhere, so failures are fine.
  await navigator.storage?.persist?.().catch(() => false);

  const client = await PGlite.create(dataDir);
  const db = createDb(client);
  await migrateDb(client, db);

  setDb(db);
  setTransactionContext(new SerialContext());
  enableLocalRuntime();

  return (request: Request) => app.fetch(request);
}
