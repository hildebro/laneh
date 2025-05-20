<script lang="ts">
  import { CheckCircle } from 'lucide-svelte';
  import { slide } from 'svelte/transition';
  import { enhance } from '$app/forms';
  import type { WeeklyTask } from '$lib/server/db/schema';

  let { data } = $props();

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
      return 'preset-filled-secondary-100-900'; // Green for due today
    } else if (dueDate.getTime() === yesterday.getTime()) {
      return 'preset-filled-warning-100-900'; // Yellow for due yesterday
    } else {
      return 'preset-filled-error-100-900'; // Red for tasks due before yesterday
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

<a class="btn mb-2 ml-auto" href="schedule/add">Add task</a>
<div class="card w-full">
  <section class="space-y-4">
    <h2 class="h2">Due Tasks</h2>
    {#if data.dueTasks.length === 0}
      <p class="text-center text-gray-500 dark:text-gray-400">No tasks are currently due. Great job!</p>
    {:else}
      <div>
        {#each data.dueTasks as task (task.id)}
          <div class="mb-2" transition:slide={{ duration: 300 }}>
            <div class="card p-4 preset-filled-secondary-100-900">
              <div class="flex justify-between items-center mb-2">
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
              </div>
              <hr class="my-2 opacity-50" />
              <div class="text-sm space-y-1">
                <p>Assignee: {task.nextDueUser.username}</p>
                <p class={getDueCardPreset(task)}><strong>Due:</strong> {formatDate(task.nextDueDate)}</p>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <section class="space-y-4">
    <h2 class="h2">Upcoming Tasks</h2>
    {#if data.upcomingTasks.length === 0}
      <p class="text-center text-gray-500 dark:text-gray-400">No upcoming tasks scheduled.</p>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each data.upcomingTasks as task (task.id)}
          <div class="mb-2" transition:slide={{ duration: 300 }}>
            <div class="card preset-filled-secondary-100-900 p-4 variant-soft">
              <div class="mb-2">
                <h3 class="h3 text-lg font-semibold">{task.name}</h3>
              </div>
              <hr class="my-2 opacity-50" />
              <div class="text-sm space-y-1">
                <p>Assignee: {task.nextDueUser.username}</p>
                <p><strong>Next Due:</strong> {formatDate(task.nextDueDate)}</p>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>
</div>
