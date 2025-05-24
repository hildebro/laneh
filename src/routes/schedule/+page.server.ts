import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { findAllTasks, markTaskAsDone } from '$lib/server/db/functions';
import { type WeeklyTaskWithRelation } from '$lib/server/db/schema';
import { processForm } from '$lib/server/formHandler';
import { z } from '$lib/zod';

export const load: PageServerLoad = async () => {
  const tasks = await findAllTasks();

  const due: WeeklyTaskWithRelation[] = [];
  const upcoming: WeeklyTaskWithRelation[] = [];
  const today = new Date();
  // Normalize today to midnight for accurate date comparison
  today.setHours(0, 0, 0, 0);

  tasks.forEach((task) => {
    // Parse the nextDueDate string (received from load function) into a Date object.
    // Appending 'T00:00:00' helps treat the date string as local time's start of day.
    const dueDate = new Date(task.nextDueDate + 'T00:00:00');
    // Normalize due date to midnight
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate <= today) {
      due.push(task);
    } else {
      upcoming.push(task);
    }
  });

  due.sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
  upcoming.sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());

  return { dueTasks: due, upcomingTasks: upcoming };
};

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
  },
};
