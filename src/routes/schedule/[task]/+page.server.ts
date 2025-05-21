import { type Actions, error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import * as m from '$lib/paraglide/messages.js';
import { addTask, findAllUsers, findTask, updateTask } from '$lib/server/db/functions';
import { weekday } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ params }) => {
  if (params.task === 'add') {
    return { task: null, weekdays: weekday.enumValues, users: findAllUsers() };
  }

  const task = await findTask(params.task);
  if (!task) {
    throw error(404, m.error_task_not_found());
  }

  return { task, weekdays: weekday.enumValues, users: findAllUsers() };
};

export const actions: Actions = {
  create: async (event) => {
    const formData = await event.request.formData();
    const name = formData.get('name')?.toString()?.trim();
    if (!name) {
      return fail(400, { message: m.settings_categories_name_invalid() });
    }

    const weekday = formData.get('weekday')?.toString()?.trim();
    if (!weekday) {
      return fail(400, { message: 'Missing weekday' });
    }

    const userId = formData.get('userId')?.toString()?.trim();
    if (!userId) {
      return fail(400, { message: 'Missing user' });
    }

    let dueDate = formData.get('dueDate')?.toString()?.trim() ?? null;
    if (dueDate === '') {
      dueDate = null;
    }

    const id = formData.get('taskId')?.toString();

    if (id) {
      await updateTask(id, name, weekday, userId, dueDate);
    } else {
      await addTask(name, weekday, userId, dueDate);
    }

    return redirect(302, './');
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