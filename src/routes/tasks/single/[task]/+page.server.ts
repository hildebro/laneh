import { type Actions, error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { resolve } from '$app/paths';
import * as m from '$lib/paraglide/messages.js';
import { addSingleTask, findSingleTask, updateSingleTask } from '$lib/server/db/functions';
import { processForm } from '$lib/server/formHandler';
import { z } from '$lib/zod';

export const load: PageServerLoad = async ({ params }) => {
  if (params.task === 'add') {
    return { task: null };
  }

  const task = await findSingleTask(params.task);
  if (!task) {
    throw error(404, m.error_task_not_found());
  }

  return { task };
};

const taskSchema = z.object({
  id: z.string().trim().nullish(),
  name: z.string().trim().nonempty(),
  dueUserId: z.string().trim().pipe(z.transform(val => val === '' ? null : val)),
  dueDate: z.string().trim().pipe(z.transform(val => val === '' ? null : val))
});

export const actions: Actions = {
  create: async (event) => {
    return processForm(event, taskSchema, async (task) => {
      if (task.id) {
        await updateSingleTask(task.id, task.name, task.dueUserId, task.dueDate);
      } else {
        await addSingleTask(task.name, task.dueUserId, task.dueDate);
      }

      return redirect(302, resolve('/tasks'));
    });
  },
};