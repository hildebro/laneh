import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import type { AppEnv } from '$lib/backend/api/types';
import { findNotificationsSince } from '$lib/backend/db/functions';
import { z } from '$lib/zod';

const notificationQuerySchema = z.object({
  since: z.iso.datetime().optional()
});

// Polled by the background runner of the mobile app.
const notificationRouter = new Hono<AppEnv>()
  .get(
    '/',
    zValidator('query', notificationQuerySchema),
    async (c) => {
      const { since } = c.req.valid('query');
      const refreshedToken = c.get('refreshedToken') ?? null;

      // The first poll only establishes the cursor, so a new device doesn't get notified about old events.
      if (!since) {
        return c.json({ cursor: new Date().toISOString(), notifications: [], refreshedToken });
      }

      const notifications = await findNotificationsSince(c.get('loggedInUser').id, new Date(since));
      const cursor = notifications.at(-1)?.createdAt.toISOString() ?? since;

      return c.json({
        cursor,
        notifications: notifications.map((notification) => ({
          id: notification.id,
          type: notification.type,
          actor: notification.actor.username,
          subject: notification.subject
        })),
        refreshedToken
      });
    }
  );

export default notificationRouter;
