import { mkdir, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { env } from '$env/dynamic/private';
import { getDb } from '$lib/backend/db';
import { generateDatabaseBackup } from '$lib/backend/db/export';
import { CHECK_INTERVAL_MS, lastScheduledRun } from '$lib/backend/jobs';
import { runInTransactionContext } from '$lib/context';

// Local hour at which the nightly backup becomes due. Runs before the other nightly jobs.
const BACKUP_HOUR = 2;
// One backup per night, so this is the number of days that can be restored.
const BACKUPS_TO_KEEP = 3;
const BACKUP_FILE = /^laneh-.+-db-\d{8}-\d{4}\.tar\.gz$/;

let running = false;

function backupDir() {
  return path.resolve(env.BACKUP_DIR || 'backups');
}

// Backups in the folder, newest first. Other files in the folder are left alone.
async function listBackups(dir: string) {
  const names = (await readdir(dir)).filter((name) => BACKUP_FILE.test(name));
  const backups = await Promise.all(
    names.map(async (name) => {
      const file = path.join(dir, name);
      return { file, createdAt: (await stat(file)).mtime };
    })
  );

  return backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// Creates a backup, if there's none since the last scheduled time, and removes the ones exceeding the limit. Like the
// other nightly jobs, a missed night (server down) is caught up on the next check.
export async function runNightlyBackupIfDue() {
  if (running) {
    return;
  }

  running = true;
  try {
    const dir = backupDir();
    await mkdir(dir, { recursive: true });

    const [newest] = await listBackups(dir);
    if (newest && newest.createdAt >= lastScheduledRun(new Date(), BACKUP_HOUR)) {
      return;
    }

    const { archive, filename } = await getDb().transaction((tx) =>
      runInTransactionContext(tx, () => generateDatabaseBackup())
    );

    // Written under a different name first, so an interrupted write never looks like a complete backup.
    const target = path.join(dir, filename);
    await writeFile(`${target}.partial`, archive);
    await rename(`${target}.partial`, target);
    console.log(`💾 Created backup ${target}`);

    const outdated = (await listBackups(dir)).slice(BACKUPS_TO_KEEP);
    for (const { file } of outdated) {
      await rm(file);
    }
  } catch (error) {
    console.error('❌ Nightly backup failed:', error);
  } finally {
    running = false;
  }
}

// Checks right away and then periodically.
export function startNightlyBackups() {
  void runNightlyBackupIfDue();
  const timer = setInterval(() => void runNightlyBackupIfDue(), CHECK_INTERVAL_MS);
  // The timer must not keep the process alive, otherwise the graceful shutdown never finishes.
  timer.unref();
}
