// src/lib/server/api/index.ts
import { Hono } from 'hono';
import tasksRouter from '$lib/server/api/task';

const app = new Hono().basePath('/api');

// ⚠️ CRITICAL STEP: You MUST chain the .route() calls.
// Do not do `app.route(...)` on separate lines, or AppType will only
// infer the very last route you attached.
const routes = app.route('/tasks', tasksRouter);

// Export the combined type for the frontend
export type AppType = typeof routes;

// Export the app for SvelteKit to consume
export default app;
