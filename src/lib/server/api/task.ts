import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import * as m from '$lib/paraglide/messages.js';
import {
  addTask,
  countDueTasks,
  findCompletedTasks,
  findDueTasks,
  findTask,
  markTaskAsDone,
  updateTask
} from '$lib/server/db/functions';
import { Weekday } from '$lib/utils/taskHelper';
import { z } from '$lib/zod';

const taskDoneSchema = z.object({
  taskId: z.string().trim().nonempty(),
  userId: z.string().trim().nonempty()
});

const taskSchema = z.object({
    id: z.string().trim().nullish(),
    name: z.string().trim().nonempty(),
    dueUserId: z.string().trim().pipe(z.transform((val) => (val === '' ? null : val))),
    dueDate: z.string().trim().pipe(z.transform((val) => (val === '' ? null : val))),
    weekday: z.union([z.enum(Weekday, { error: () => m.schedule_weekday_nonoptional() }), z.null()]),
    interval: z.coerce.number().min(1).nullable()
  })
    .refine(
      (data) => {
        return !!data.weekday === !!data.interval;
      },
      {
        message: 'schedule_error_task_state',
        path: ['weekday']
      }
    )
;

const tasksRouter = new Hono()
  .get('/', async (c) => {
    return c.json({ dueTasks: await findDueTasks(), completedTasks: await findCompletedTasks() });
  })
  .get('/dueTaskCount', async (c) => {
    return c.json(await countDueTasks());
  })
  .post(
    '/done',
    zValidator('json', taskDoneSchema),
    async (c) => {
      const taskCompletion = c.req.valid('json');
      await markTaskAsDone(taskCompletion.taskId, taskCompletion.userId);

      return c.json({ success: true });
    }
  )
  .get('/:task', async (c) => {
    const taskParam = c.req.param('task');
    const task = await findTask(taskParam);
    if (!task) return c.json({ error: 'Task not found' }, 404);

    return c.json(task);
  })
  .post(
    '/',
    zValidator('json', taskSchema),
    async (c) => {
      const task = c.req.valid('json');
      try {
        if (task.id) {
          await updateTask(task.id, task.name, task.weekday, task.interval, task.dueUserId, task.dueDate);
        } else {
          await addTask(task.name, task.weekday, task.interval, task.dueUserId, task.dueDate);
        }
        return c.json({ success: true });
      } catch {
        return c.json({ error: 'Database error' }, 500);
      }
    }
  );

export default tasksRouter;