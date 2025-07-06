import { type Actions, error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import * as m from '$lib/paraglide/messages.js';
import { addTask, findTask, updateTask } from '$lib/server/db/functions';
import { weekday } from '$lib/server/db/schema';
import { processForm } from '$lib/server/formHandler';
import { z } from '$lib/zod';

export const load: PageServerLoad = async ({ params }) => {
  if (params.task === 'add') {
    return { task: null, weekdays: weekday.enumValues };
  }

  const task = await findTask(params.task);
  if (!task) {
    throw error(404, m.error_task_not_found());
  }

  return { task, weekdays: weekday.enumValues };
};

const taskSchema = z.object({
  id: z.string().trim().nullish(),
  name: z.string().trim().nonempty(),
  dueUserId: z.string().trim().nonempty(),
  weekday: z.enum(weekday.enumValues, { error: () => m.schedule_weekday_nonoptional() }),
  interval: z.coerce.number().min(1).nonoptional(),
  // An empty date input will post an empty string, so we clean it up here.
  dueDate: z.string().pipe(z.transform(val => val === '' ? null : val))
});

export const actions: Actions = {
  create: async (event) => {
    return processForm(event, taskSchema, async (task) => {
      if (task.id) {
        await updateTask(task.id, task.name, task.weekday, task.interval, task.dueUserId, task.dueDate);
      } else {
        await addTask(task.name, task.weekday, task.interval, task.dueUserId, task.dueDate);
      }

      return redirect(302, './');
    });
  },
  delete: async ({ request }) => {
    const formData = await request.formData();
    const taskId = formData.get('taskId')?.toString();
    if (!taskId) {
      throw new Error('Action called without task. This should not happen.');
    }

    const task = await findTask(taskId);
    if (!task) {
      throw error(404, m.error_task_not_found());
    }

    // await deleteTask(taskId);

    return redirect(302, './');
  }
};