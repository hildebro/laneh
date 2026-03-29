<script lang="ts">
  import { Check, Pencil, Undo2 } from 'lucide-svelte';
  import { SvelteDate } from 'svelte/reactivity';
  import { resolve } from '$app/paths';
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { WeeklyTask, WeeklyTaskWithRelation } from '$lib/server/db/schema';

  let { data } = $props();

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
      return 'warning'; // Yellow for due yesterday
    } else {
      return 'error'; // Red for tasks due before yesterday
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

  let taskToComplete: WeeklyTaskWithRelation | undefined = $state();

  function openModalForTask(task: WeeklyTaskWithRelation) {
    taskToComplete = task;
    doneDialog.showModal();
  }

  function closeModal() {
    doneDialog.close();
  }

  let doneDialog: HTMLDialogElement;
</script>

<dialog bind:this={doneDialog}>
  <EnhancedForm
    action="?/markAsDone"
    preUpdatedCallback={() => closeModal()}
  >
    <input type="hidden" name="taskId" value={taskToComplete?.id} />
    <label>
      { m.schedule_done_who() }
      <select name="userId">
        {#await data.users then users}
          {#each users as user (user.id)}
            <option value={user.id}
                    selected={user.id === taskToComplete?.nextDueUserId}>{user.username}</option>
          {/each}
        {/await}
      </select>
    </label>
    {#snippet additionalButtons(submitting)}
      <button type="button" onclick={closeModal}
              disabled={submitting}>
        <Undo2 size={12} />
        { m.generic_cancel() }
      </button>
    {/snippet}
  </EnhancedForm>
</dialog>

<div class="action-bar">
  <a role="button" href={resolve('/tasks/weekly/add')}>{ m.schedule_weekly_task_add() }</a>
</div>
<h2 class="headline">{ m.schedule_due_tasks() }</h2>
{#if data.dueTasks.length === 0}
  <article>{ m.schedule_due_tasks_empty() }</article>
{/if}
{#each data.dueTasks as task (task.id)}
  <article class={getDueCardPreset(task)}>
    <div class="action-bar">
      <a class="icon-button" role="button" href={resolve('/tasks/weekly/[task]', {task: task.id})}>
        <Pencil size={16} />
        { m.generic_edit() }
      </a>
      <button class="icon-button" onclick={() => openModalForTask(task)}>
        <Check size={16} />
        { m.schedule_done() }
      </button>
    </div>
    <h3>{task.name}</h3>
    <hr />
    <div>
      <div>{ m.schedule_assignee() }: {task.nextDueUser?.username}</div>
      <p>
        <strong>{ m.schedule_due_since() }:</strong> {formatDate(task.nextDueDate)}
      </p>
      {#await data.users}
        <LoadingSpinner />
      {:then users}
        <div>{ m.schedule_completions() }</div>
        <ul>
          {#each users as user (user.id)}
            <li>
              {user.username}: { task.completions.filter(completion => completion.userId === user.id).length }
            </li>
          {/each}
        </ul>
      {/await}
    </div>
  </article>
{/each}

<h2 class="headline">{ m.schedule_upcoming_tasks() }</h2>
{#if data.upcomingTasks.length === 0}
  <article>{ m.schedule_upcoming_tasks_empty() }</article>
{/if}
{#each data.upcomingTasks as task (task.id)}
  <article>
    <div class="action-bar">
      <a role="button" href={resolve('/tasks/weekly/[task]', {task: task.id})}>
        <Pencil size={16} />
        { m.generic_edit() }
      </a>
    </div>
    <h3>{task.name}</h3>
    <hr />
    <div>
      <div>{ m.schedule_assignee() }: {task.nextDueUser?.username}</div>
      <p><strong>{ m.schedule_upcoming_at() }:</strong> {formatDate(task.nextDueDate)}</p>
    </div>
  </article>
{/each}
