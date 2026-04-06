// src/lib/server/api/tasks.ts
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { addSingleTask, findSingleTask, updateSingleTask } from '$lib/server/db/functions';
import { z } from '$lib/zod';

const taskSchema = z.object({
  id: z.string().trim().nullish(),
  name: z.string().trim().nonempty(),
  dueUserId: z.string().trim().pipe(z.transform(val => val === '' ? null : val)),
  dueDate: z.string().trim().pipe(z.transform(val => val === '' ? null : val))
});

// Create a standard Hono instance for this domain
const tasksRouter = new Hono()
  .get('/single/:task', async (c) => {
    const taskParam = c.req.param('task');
    if (taskParam === 'add') return c.json({ task: null });

    const task = await findSingleTask(taskParam);
    if (!task) return c.json({ error: 'Task not found' }, 404);

    return c.json({ task });
  })
  .post(
    '/single/:task',
    zValidator('json', taskSchema, (result, c) => {
      if (!result.success) return c.json({ error: 'Invalid data', issues: result.error.issues }, 422);
    }),
    async (c) => {
      const task = c.req.valid('json');
      try {
        if (task.id) {
          await updateSingleTask(task.id, task.name, task.dueUserId, task.dueDate);
        } else {
          await addSingleTask(task.name, task.dueUserId, task.dueDate);
        }
        return c.json({ success: true });
      } catch (error) {
        return c.json({ error: 'Database error' }, 500);
      }
    }
  );

export default tasksRouter;