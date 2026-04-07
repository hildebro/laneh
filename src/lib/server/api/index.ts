import { Hono } from 'hono';
import tasksRouter from '$lib/server/api/task';
import usersRouter from '$lib/server/api/user';

const app = new Hono().basePath('/api');

// Technically unused, but this definition is required for the routes to be available.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
  .route('/tasks', tasksRouter)
  .route('/users', usersRouter);

export type AppType = typeof routes;

export default app;
