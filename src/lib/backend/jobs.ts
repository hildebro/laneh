import { getDb } from '$lib/backend/db';
import { getShoppingItemStatsCalculatedAt, refreshShoppingItemStats } from '$lib/backend/db/functions';
import { runInTransactionContext } from '$lib/context';

// Local hour at which the nightly jobs become due.
const NIGHTLY_HOUR = 3;
const CHECK_INTERVAL_MS = 10 * 60 * 1000;

let running = false;

// Most recent point in time, at which the nightly jobs were supposed to run.
function lastScheduledRun(now: Date) {
  const scheduled = new Date(now);
  scheduled.setHours(NIGHTLY_HOUR, 0, 0, 0);
  if (scheduled > now) {
    scheduled.setDate(scheduled.getDate() - 1);
  }

  return scheduled;
}

// Runs the nightly jobs, if they didn't run since the last scheduled time. That way, a missed night (server down,
// app closed) is caught up on the next check.
export async function runNightlyJobsIfDue() {
  if (running) {
    return;
  }

  running = true;
  try {
    await getDb().transaction((tx) => runInTransactionContext(tx, async () => {
      const calculatedAt = await getShoppingItemStatsCalculatedAt();
      if (!calculatedAt || calculatedAt < lastScheduledRun(new Date())) {
        await refreshShoppingItemStats(calculatedAt);
      }
    }));
  } catch (error) {
    console.error('❌ Nightly jobs failed:', error);
  } finally {
    running = false;
  }
}

// Checks right away and then periodically. Runtimes can call runNightlyJobsIfDue() for additional checks.
export function startNightlyJobs() {
  void runNightlyJobsIfDue();
  const timer = setInterval(() => void runNightlyJobsIfDue(), CHECK_INTERVAL_MS);
  // On node, the timer must not keep the process alive, otherwise the graceful shutdown never finishes.
  (timer as { unref?: () => void }).unref?.();
}
