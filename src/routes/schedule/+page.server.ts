import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { findAllTasks, markTaskAsDone } from '$lib/server/db/functions';
import type { WeeklyTask } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
  return processTasks(await findAllTasks());
};

// Function to process tasks and categorize them into 'due' and 'upcoming'
function processTasks(tasks: WeeklyTask[]) {
  // Handle potential undefined tasks array (e.g., during initial load or if error occurred)
  if (!tasks) {
    return { dueTasks: [], upcomingTasks: [] };
  }

  const due: WeeklyTask[] = [];
  const upcoming: WeeklyTask[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today to midnight for accurate date comparison

  tasks.forEach((task) => {
    // Parse the nextDueDate string (received from load function) into a Date object.
    // Appending 'T00:00:00' helps treat the date string as local time's start of day.
    // Consider using a robust date library (like date-fns) for complex timezone handling if needed.
    const dueDate = new Date(task.nextDueDate + 'T00:00:00');
    dueDate.setHours(0, 0, 0, 0); // Normalize due date to midnight

    // Categorize task based on whether its due date is today or in the past
    if (dueDate <= today) {
      due.push(task);
    } else {
      upcoming.push(task);
    }
  });

  // Sort due tasks chronologically (oldest first) for consistent display order
  due.sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());

  return { dueTasks: due, upcomingTasks: upcoming };
}

export const actions: Actions = {
  markAsDone: async ({ request }) => {
    const formData = await request.formData();
    const taskId = formData.get('taskId')?.toString();
    if (!taskId) {
      throw new Error('Action called without task id. This should not happen.');
    }

    await markTaskAsDone(taskId);
  },
};
