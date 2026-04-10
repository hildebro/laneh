import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import * as m from '$lib/paraglide/messages.js';
import {
  addSingleTask,
  addWeeklyTask,
  countDueTasks,
  findAllSingleTasks,
  findAllWeeklyTasks,
  findSingleTask,
  findWeeklyTask,
  markTaskAsDone,
  updateSingleTask,
  updateWeeklyTask
} from '$lib/server/db/functions';
import { groupTasks, Weekday } from '$lib/utils/taskHelper';
import { z } from '$lib/zod';

const taskDoneSchema = z.object({
  taskId: z.string().trim().nonempty(),
  userId: z.string().trim().nonempty()
});

const singleTaskSchema = z.object({
  id: z.string().trim().nullish(),
  name: z.string().trim().nonempty(),
  dueUserId: z.string().trim().pipe(z.transform(val => val === '' ? null : val)),
  dueDate: z.string().trim().pipe(z.transform(val => val === '' ? null : val))
});

const weeklyTaskSchema = z.object({
  id: z.string().trim().nullish(),
  name: z.string().trim().nonempty(),
  dueUserId: z.string().trim().nonoptional(),
  dueDate: z.string().trim().pipe(z.transform((val) => (val === '' ? null : val))),
  weekday: z.enum(Weekday, { error: () => m.schedule_weekday_nonoptional() }),
  interval: z.coerce.number().min(1).nonoptional()
});

const tasksRouter = new Hono()
  .get('/', async (c) => {

    const weeklyTasks = await findAllWeeklyTasks();
    const singleTasks = await findAllSingleTasks();

    const [due, completed] = groupTasks(weeklyTasks, singleTasks);

    return c.json({ dueTasks: due, completedTasks: completed });
  })
  .get('/dueTaskCount', async (c) => {
    return c.json(await countDueTasks())
  })
  .post(
    '/done',
    zValidator('json', taskDoneSchema),
    async (c) => {
      const taskCompletion = c.req.valid('json');
      try {
        await markTaskAsDone(taskCompletion.taskId, taskCompletion.userId);

        return c.json({ success: true });
      } catch {
        return c.json({ error: 'Database error' }, 500);
      }
    }
  )
  .get('/single/:task', async (c) => {
    const taskParam = c.req.param('task');
    const task = await findSingleTask(taskParam);
    if (!task) return c.json({ error: 'Task not found' }, 404);

    return c.json(task);
  })
  .post(
    '/single',
    zValidator('json', singleTaskSchema),
    async (c) => {
      const task = c.req.valid('json');
      try {
        if (task.id) {
          await updateSingleTask(task.id, task.name, task.dueUserId, task.dueDate);
        } else {
          await addSingleTask(task.name, task.dueUserId, task.dueDate);
        }
        return c.json({ success: true });
      } catch {
        return c.json({ error: 'Database error' }, 500);
      }
    }
  )
  .get('/weekly/:task', async (c) => {
    const taskParam = c.req.param('task');
    const task = await findWeeklyTask(taskParam);
    if (!task) return c.json({ error: 'Task not found' }, 404);

    return c.json(task);
  })
  .post(
    '/weekly',
    zValidator('json', weeklyTaskSchema),
    async (c) => {
      const task = c.req.valid('json');
      try {
        if (task.id) {
          await updateWeeklyTask(task.id, task.name, task.weekday, task.interval, task.dueUserId, task.dueDate);
        } else {
          await addWeeklyTask(task.name, task.weekday, task.interval, task.dueUserId, task.dueDate);
        }
        return c.json({ success: true });
      } catch {
        return c.json({ error: 'Database error' }, 500);
      }
    }
  );

export default tasksRouter;