<script lang="ts">
  import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
  import { Check, Pencil, Undo2 } from 'lucide-svelte';
  import { SvelteDate } from 'svelte/reactivity';
  import { slide } from 'svelte/transition';
  import { resolve } from '$app/paths';
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { WeeklyTask, WeeklyTaskWithRelation } from '$lib/server/db/schema';

  let { data } = $props();

  // Function to determine the Skeleton UI card preset based on how overdue a task is
  function getDueCardPreset(task: WeeklyTask): string {
    const today = new SvelteDate();
    today.setHours(0, 0, 0, 0);
    const yesterday = new SvelteDate(today);
    yesterday.setDate(today.getDate() - 1); // Get yesterday's date

    const dueDate = new SvelteDate(task.nextDueDate + 'T00:00:00');
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

  let showTaskCompleteModal = $state(false);
  let taskToComplete: WeeklyTaskWithRelation | undefined = $state();

  function openModalForTask(task: WeeklyTaskWithRelation) {
    showTaskCompleteModal = true;
    taskToComplete = task;
  }

  function closeModal() {
    showTaskCompleteModal = false;
  }
</script>

<a class="btn mb-2 ml-auto" href={resolve('/schedule/add')}>{ m.schedule_add_task() }</a>
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
                <a href={resolve('/schedule/[task]', {task: task.id})} class="btn">
                  <Pencil size={18} />
                  <span>{ m.generic_edit() }</span>
                </a>
                <button class="btn" onclick={() => openModalForTask(task)}>
                  <Check size={18} />
                  <span>{ m.schedule_done() }</span>
                </button>
              </div>
              <hr class="my-2 opacity-50" />
              <div class="text-sm space-y-1">
                <p>{ m.schedule_assignee() }: {task.nextDueUser?.username}</p>
                <p class={getDueCardPreset(task)}>
                  <strong>{ m.schedule_due_since() }:</strong> {formatDate(task.nextDueDate)}
                </p>
                {#await data.users}
                  <span></span>
                {:then users}
                  <p>{ m.schedule_completions() }</p>
                  {#each users as user (user.id)}
                    <p>
                      {user.username}: { task.completions.filter(completion => completion.userId === user.id).length }
                    </p>
                  {/each}
                {/await}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <Dialog
    open={showTaskCompleteModal}
    onOpenChange={(e) => (showTaskCompleteModal = e.open)}
  >
    <Portal>
      <Dialog.Backdrop class="fixed inset-0 z-50 backdrop-blur-xs" />
      <Dialog.Positioner class="fixed inset-0 z-50 flex justify-center items-center">
        <Dialog.Content class="card shadow-xl">
          <Dialog.Description>
            <EnhancedForm
              action="?/markAsDone"
              preUpdatedCallback={() => closeModal()}
            >
              <input type="hidden" name="taskId" value={taskToComplete?.id} />
              <label>
                { m.schedule_done_who() }
                <select class="select mb-2" name="userId">
                  {#await data.users then users}
                    {#each users as user (user.id)}
                      <option value={user.id}
                              selected={user.id === taskToComplete?.nextDueUserId}>{user.username}</option>
                    {/each}
                  {/await}
                </select>
              </label>
              {#snippet additionalButtons(submitting)}
                <button type="button" class="btn preset-filled-surface-800-200" onclick={closeModal}
                        disabled={submitting}>
                  <Undo2 size={12} />
                  { m.generic_cancel() }
                </button>
              {/snippet}
            </EnhancedForm>
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  </Dialog>

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
                  <a href={resolve('/schedule/[task]', {task: task.id})} class="btn">
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
