import { Hono } from 'hono';
import { cors} from 'hono/cors';
import { transactionContext } from '$lib/context';
import balanceRouter from '$lib/server/api/balance';
import publicRouter from '$lib/server/api/public';
import shoppingRouter from '$lib/server/api/shopping';
import tasksRouter from '$lib/server/api/task';
import type { AppEnv } from '$lib/server/api/types';
import usersRouter from '$lib/server/api/user';
import { getLoggedInUser } from '$lib/server/auth';
import { db } from '$lib/server/db';

const app = new Hono<AppEnv>().basePath('/api');

// Cors settings for capacitor
app.use('*', cors({
  origin: ['capacitor://localhost', 'http://localhost', 'https://localhost'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['x-refreshed-token'],
}));

// Database Transaction
app.use('*', async (c, next) => {
  // Start the Drizzle transaction using the main db client
  await db.transaction(async (tx) => {
    // Run the downstream Hono routes within the ALS context
    await transactionContext.run(tx, async () => {
      await next();
    });
  });
});

// Authentication
app.use('*', async (c, next) => {
  if (c.req.path.startsWith('/api/public')) {
    return await next();
  }

  const user = await getLoggedInUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('loggedInUser', user);

  await next();
});

// Technically unused, but this definition is required for the routes to be available.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
  .route('/tasks', tasksRouter)
  .route('/users', usersRouter)
  .route('/shopping', shoppingRouter)
  .route('/balance', balanceRouter)
  .route('/public', publicRouter);

export type AppType = typeof routes;

export default app;
