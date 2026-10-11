import { mkdtemp, readdir, rm, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { initiate, startTestBackend } from '../helpers/backend';
import { lastScheduledRun } from '$lib/backend/jobs';

const dir = await mkdtemp(path.join(tmpdir(), 'laneh-backups-'));
vi.mock('$env/dynamic/private', () => ({ env: { BACKUP_DIR: dir } }));
const { runNightlyBackupIfDue } = await import('$lib/server/backups');

const backend = await startTestBackend();

beforeEach(async () => {
  await backend.reset();
  await initiate();
  for (const name of await readdir(dir)) {
    await rm(path.join(dir, name));
  }
});

afterAll(async () => {
  await backend.close();
  await rm(dir, { recursive: true });
});

// Places a fake backup, created the given number of days before the last scheduled backup.
async function addBackup(daysBefore: number) {
  const createdAt = lastScheduledRun(new Date(), 2);
  createdAt.setDate(createdAt.getDate() - daysBefore);
  const name = `laneh-1.0.0-db-2000010${daysBefore}-0200.tar.gz`;
  await writeFile(path.join(dir, name), 'old');
  await utimes(path.join(dir, name), createdAt, createdAt);

  return name;
}

describe('nightly backup', () => {
  it('creates a backup, if there is none', async () => {
    await runNightlyBackupIfDue();

    const files = await readdir(dir);
    expect(files).toHaveLength(1);
    expect(files[0]).toMatch(/^laneh-.+-db-\d{8}-\d{4}\.tar\.gz$/);
  });

  it('skips the backup, if it already ran since the scheduled time', async () => {
    const existing = await addBackup(0);

    await runNightlyBackupIfDue();

    expect(await readdir(dir)).toEqual([existing]);
  });

  it('keeps the 3 newest backups and leaves other files alone', async () => {
    const yesterday = await addBackup(1);
    const twoDaysAgo = await addBackup(2);
    await addBackup(3);
    await addBackup(4);
    await writeFile(path.join(dir, 'notes.txt'), 'mine');

    await runNightlyBackupIfDue();

    const files = await readdir(dir);
    expect(files).toHaveLength(4);
    expect(files).toEqual(expect.arrayContaining([yesterday, twoDaysAgo, 'notes.txt']));
  });
});
