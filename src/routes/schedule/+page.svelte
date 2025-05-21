<script lang="ts">
  import { Modal } from '@skeletonlabs/skeleton-svelte';
  import { CheckCircle, Pencil, Undo2 } from 'lucide-svelte';
  import { slide } from 'svelte/transition';
  import { enhance } from '$app/forms';
  import * as m from '$lib/paraglide/messages.js';
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
      return ''; // Green for due today
    } else if (dueDate.getTime() === yesterday.getTime()) {
      return 'preset-filled-warning-500'; // Yellow for due yesterday
    } else {
      return 'preset-filled-error-500'; // Red for tasks due before yesterday
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

  let differentUserModalVisible = $state(false);

  function modalClose() {
    differentUserModalVisible = false;
  }
</script>

<a class="btn mb-2 ml-auto" href="schedule/add">{ m.schedule_add_task() }</a>
<div class="card w-full">
  <section class="space-y-4">
    <h2 class="h2">{ m.schedule_due_tasks() }</h2>
    {#if data.dueTasks.length === 0}
      <p class="mb-2">{ m.schedule_due_tasks_empty() }</p>
    {:else}
      <div>
        {#each data.dueTasks as task (task.id)}
          <div class="mb-2" transition:slide={{ duration: 300 }}>
            <div class="card">
              <h3 class="h3 text-lg font-semibold">{task.name}</h3>
              <div class="flex justify-end gap-1 mb-2">
                <a href="schedule/{task.id}" class="btn">
                  <Pencil size={18} />
                  <span>{ m.generic_edit() }</span>
                </a>
                {#if data.user.id !== task.nextDueUserId }
                  <Modal
                    open={differentUserModalVisible}
                    onOpenChange={(e) => (differentUserModalVisible = e.open)}
                    triggerBase="btn"
                    contentBase="card shadow-xl max-w-screen-sm"
                    backdropClasses="backdrop-blur-sm"
                  >
                    {#snippet trigger()}
                      <CheckCircle size={18} />
                      <span>{ m.schedule_done() }</span>
                    {/snippet}
                    {#snippet content()}
                      <h2 class="h2 mb-4">{m.schedule_done_who_headline()}</h2>
                      <p class="mb-8">{ m.schedule_done_who_text() }</p>
                      <form
                        method="POST"
                        action="?/markAsDoneInTheNameOf"
                        use:enhance={() => {
                          // Runs after the server action completes
                          return async ({ update }) => {
                            modalClose();
                            // Ensure the component updates if the action modified data
                            // or completed a redirect.
                            await update();
                          };
                        }}>
                        <input type="hidden" name="taskId" value={task.id} />
                        <div class="flex justify-end gap-4">
                          <button type="button" class="btn preset-filled-surface-800-200" onclick={modalClose}>
                            <Undo2 />
                            { m.generic_cancel() }
                          </button>
                          <button type="submit" class="btn" name="userId" value={data.user.id}>
                            { m.schedule_done_who_me() }
                          </button>
                          <button type="submit" class="btn" name="userId" value={task.nextDueUserId}>
                            { m.schedule_done_who_assignee({ assignee: task.nextDueUser?.username ?? 'n/a' }) }
                          </button>
                        </div>
                      </form>
                    {/snippet}
                  </Modal>
                {:else }
                  <form
                    method="POST"
                    action="?/markAsDone"
                    use:enhance
                  >
                    <input type="hidden" name="taskId" value={task.id} />
                    <button type="submit" class="btn">
                      <CheckCircle size={18} />
                      <span>{ m.schedule_done() }</span>
                    </button>
                  </form>
                {/if}
              </div>
              <hr class="my-2 opacity-50" />
              <div class="text-sm space-y-1">
                <p>{ m.schedule_assignee() }: {task.nextDueUser?.username}</p>
                <p class={getDueCardPreset(task)}>
                  <strong>{ m.schedule_due_since() }:</strong> {formatDate(task.nextDueDate)}
                </p>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <section class="space-y-4">
    <h2 class="h2">{ m.schedule_upcoming_tasks() }</h2>
    {#if data.upcomingTasks.length === 0}
      <p>{ m.schedule_upcoming_tasks_empty() }</p>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each data.upcomingTasks as task (task.id)}
          <div class="mb-2" transition:slide={{ duration: 300 }}>
            <div class="card">
              <div class="mb-2">
                <h3 class="h3 text-lg font-semibold">{task.name}</h3>
                <div class="flex justify-end gap-1 mb-2">
                  <a href="schedule/{task.id}" class="btn">
                    <Pencil size={18} />
                    <span>{ m.generic_edit() }</span>
                  </a>
                </div>
              </div>
              <hr class="my-2 opacity-50" />
              <div class="text-sm space-y-1">
                <p>{ m.schedule_assignee() }: {task.nextDueUser?.username}</p>
                <p><strong>{ m.schedule_upcoming_at() }:</strong> {formatDate(task.nextDueDate)}</p>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>
</div>
