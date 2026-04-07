import type { TaskWithRelation, WeeklyTaskWithRelation } from '$lib/server/db/schema';

export function groupTasks(weeklyTasks: WeeklyTaskWithRelation[], singleTasks: TaskWithRelation[]) {
  const due: TaskWithRelation[] = [];
  const completed: TaskWithRelation[] = [];
  const today = new Date();
  // Normalize today to midnight for accurate date comparison
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

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
  singleTasks.forEach((task) => {
    if (!task.done) {
      due.push(task);
    } else {
      completed.push(task);
    }
  });

  return [
    due.sort((a, b) => sortTasks(a, b)),
    completed.sort((a, b) => sortTasks(a, b))
  ];
}

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
