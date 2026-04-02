import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { findAllSingleTasks, findAllWeeklyTasks, markTaskAsDone } from '$lib/server/db/functions';
import { type TaskWithRelation } from '$lib/server/db/schema';
import { processForm } from '$lib/server/formHandler';
import { z } from '$lib/zod';

export const load: PageServerLoad = async () => {
  const due: TaskWithRelation[] = [];
  const completed: TaskWithRelation[] = [];
  const today = new Date();
  // Normalize today to midnight for accurate date comparison
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const weeklyTasks = await findAllWeeklyTasks();
  weeklyTasks.forEach((task) => {
    // Parse the nextDueDate string (received from load function) into a Date object.
    // Appending 'T00:00:00' helps treat the date string as local time's start of day.
    const dueDate = new Date(task.dueDate + 'T00:00:00');
    // Normalize due date to midnight
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate <= today) {
      due.push(task);
    } else {
      completed.push(task);
    }
  });
  const singleTasks = await findAllSingleTasks();
  singleTasks.forEach((task) => {
    if (!task.done) {
      due.push(task);
    } else {
      completed.push(task);
    }
  });

  due.sort((a, b) => sortTasks(a, b));

  return { dueTasks: due, completedTasks: completed };
};

function sortTasks(a: TaskWithRelation, b: TaskWithRelation) {
  if (!a.dueDate && !b.dueDate) {
    return a.name.localeCompare(b.name);
  }

  if (!a.dueDate) {
    return 1;
  }

  if (!b.dueDate) {
    return -1;
  }

  const timeBasedSort = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  if (timeBasedSort !== 0) {
    return timeBasedSort;
  }

  return a.name.localeCompare(b.name);
}

const taskCompletionSchema = z.object({
  taskId: z.string().trim().nonempty(),
  userId: z.string().trim().nullish()
});

export const actions: Actions = {
  markAsDone: async (event) => {
    return processForm(event, taskCompletionSchema, async (taskCompletion, { locals }) => {
      const completionUserId = taskCompletion.userId ?? locals.user?.id as string;

      await markTaskAsDone(taskCompletion.taskId, completionUserId);
    });
  }
};
