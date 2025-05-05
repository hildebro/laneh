<script lang="ts">
  // Import necessary types and components
  import { enhance } from '$app/forms'; // SvelteKit form enhancement action
  import { slide } from 'svelte/transition'; // Svelte transition
  import { CheckCircle } from 'lucide-svelte';
  import type { WeeklyTask } from '$lib/server/db/schema'; // Icons

  let { data } = $props();

  // Use $derived for reactive computations based on props or state
  let { dueTasks, upcomingTasks } = $derived(processTasks(data.tasks));

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

  // Function to determine the Skeleton UI card preset based on how overdue a task is
  function getDueCardPreset(task: WeeklyTask): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1); // Get yesterday's date

    const dueDate = new Date(task.nextDueDate + 'T00:00:00');
    dueDate.setHours(0, 0, 0, 0);

    // Assign color based on due date relative to today
    if (dueDate.getTime() === today.getTime()) {
      return 'preset-filled-success'; // Green for due today
    } else if (dueDate.getTime() === yesterday.getTime()) {
      return 'preset-filled-warning'; // Yellow for due yesterday
    } else {
      return 'preset-filled-error'; // Red for tasks due before yesterday
    }
  }

  // Function to format date strings for display (e.g., "May 2, 2025")
  function formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A'; // Handle null or undefined dates
    try {
      // Use Intl.DateTimeFormat for locale-aware date formatting
      return new Intl.DateTimeFormat('en-US', { // Adjust locale ('en-GB', 'de-DE', etc.) as needed
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(new Date(dateString + 'T00:00:00')); // Treat as local date
    } catch (e) {
      console.error('Error formatting date:', dateString, e);
      return 'Invalid Date'; // Fallback for parsing errors
    }
  }
</script>

<div class="container mx-auto p-4 space-y-8">
  <section class="space-y-4">
    <h2 class="h2">Due Tasks ({dueTasks.length})</h2>
    {#if dueTasks.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each dueTasks as task (task.id)}
          <div transition:slide={{ duration: 300 }}>
            <div class="card p-4 {getDueCardPreset(task)}">
              <header class="flex justify-between items-center mb-2">
                <h3 class="h3 text-lg font-semibold">{task.name}</h3>
                <form
                  method="POST"
                  action="?/markAsDone"
                  use:enhance
                >
                  <input type="hidden" name="taskId" value={task.id} />
                  <button
                    type="submit"
                    class="btn variant-filled-primary btn-sm"
                    aria-label={`Mark ${task.name} as done`}
                  >
                    <CheckCircle size={18} />
                    <span>Done</span>
                  </button>
                </form>
              </header>
              <hr class="my-2 opacity-50" />
              <div class="text-sm space-y-1">
                <p><strong>Due:</strong> {formatDate(task.nextDueDate)}</p>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <p class="text-center text-gray-500 dark:text-gray-400">No tasks are currently due. Great job!</p>
    {/if}
  </section>

  <section class="space-y-4">
    <h2 class="h2">Upcoming Tasks ({upcomingTasks.length})</h2>
    {#if upcomingTasks.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each upcomingTasks as task (task.id)}
          <div transition:slide={{ duration: 300 }}>
            <div class="card p-4 variant-soft">
              <header class="mb-2">
                <h3 class="h3 text-lg font-semibold">{task.name}</h3>
              </header>
              <hr class="my-2 opacity-50" />
              <div class="text-sm space-y-1">
                <p><strong>Next Due:</strong> {formatDate(task.nextDueDate)}</p>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <p class="text-center text-gray-500 dark:text-gray-400">No upcoming tasks scheduled.</p>
    {/if}
  </section>
</div>
