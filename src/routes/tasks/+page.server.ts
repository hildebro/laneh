import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { findAllWeeklyTasks, findOpenSingleTasks, markTaskAsDone } from '$lib/server/db/functions';
import { type WeeklyTaskWithRelation } from '$lib/server/db/schema';
import { processForm } from '$lib/server/formHandler';
import { z } from '$lib/zod';

export const load: PageServerLoad = async () => {
  const tasks = await findAllWeeklyTasks();

  const due: WeeklyTaskWithRelation[] = [];
  const upcoming: WeeklyTaskWithRelation[] = [];
  const completed: WeeklyTaskWithRelation[] = [];
  const today = new Date();
  // Normalize today to midnight for accurate date comparison
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  tasks.forEach((task) => {
    // Parse the nextDueDate string (received from load function) into a Date object.
    // Appending 'T00:00:00' helps treat the date string as local time's start of day.
    const dueDate = new Date(task.nextDueDate + 'T00:00:00');
    // Normalize due date to midnight
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate <= today) {
      due.push(task);
    } else if (dueDate <= tomorrow || task.completions.length === 0) {
      upcoming.push(task);
    } else {
      completed.push(task);
    }
  });

  due.sort((a, b) => sortTasks(a, b));
  upcoming.sort((a, b) => sortTasks(a, b));

  return { dueTasks: due, upcomingTasks: upcoming, completedTasks: completed, singleTasks: await findOpenSingleTasks() };
};

function sortTasks(a: WeeklyTaskWithRelation, b: WeeklyTaskWithRelation) {
  const timeBasedSort = new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime();
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
