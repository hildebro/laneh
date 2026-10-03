import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { call, exportBackup, importBackup, initiate, startTestBackend } from '../helpers/backend';
import { enableLocalRuntime } from '$lib/backend/runtime';

// The local runtime can't be disabled again, so these tests have their own file. Server backups are created before it
// is enabled.
const backend = await startTestBackend();
// With Postgres, the database still contains the data of the previous test file.
await backend.reset();

const serverToken = await initiate('Home', 'alice');
const serverBackup = await exportBackup(serverToken);

enableLocalRuntime();

beforeEach(backend.reset);
afterAll(backend.close);

async function initiateLocal(householdName = 'Home', username = 'alice') {
  const result = await call<{ sessionToken: string }>('/public/local/initiate', {
    method: 'POST',
    body: { householdName, username }
  });

  return result.sessionToken;
}

describe('local backup', () => {
  it('restores a backup of the local app', async () => {
    const token = await initiateLocal();
    await call('/shopping/category', { method: 'POST', token, body: { id: null, name: 'Garden' } });
    const before = await call('/shopping/categoriesWithItems', { token });

    const backup = await exportBackup(token);
    await backend.reset();
    const response = await importBackup(backup);

    expect(response.status).toBe(200);
    const { sessionToken } = await call<{ sessionToken: string }>('/public/local/login', { method: 'POST' });
    expect(await call('/shopping/categoriesWithItems', { token: sessionToken })).toEqual(before);
  });

  it('rejects a backup of a server', async () => {
    const response = await importBackup(serverBackup);

    expect(response.status).toBe(400);
    expect(await call('/public/needsInitiation')).toBe(true);
  });
});
