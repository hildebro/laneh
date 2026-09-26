import type { ServerInit } from '@sveltejs/kit';
import { building } from '$app/environment';
import { startNightlyJobs } from '$lib/backend/jobs';
import { getServerApp } from '$lib/server/backend';

// Runs once, when the node server starts. The build also calls this, but must not touch the database.
export const init: ServerInit = () => {
  if (building) {
    return;
  }

  getServerApp();
  startNightlyJobs();
};
