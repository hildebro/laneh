<script lang="ts">
  import { Check, Pencil, Undo2 } from 'lucide-svelte';
  import { SvelteDate } from 'svelte/reactivity';
  import { resolve } from '$app/paths';
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { TaskWithRelation } from '$lib/server/db/schema';

  let { data } = $props();

  function getDueCardPreset(task: TaskWithRelation): string {
    if (!task.dueDate) {
      return '';
    }

    const today = new SvelteDate();
    today.setHours(0, 0, 0, 0);
    const yesterday = new SvelteDate(today);
    yesterday.setDate(today.getDate() - 1); // Get yesterday's date

    const dueDate = new SvelteDate(task.dueDate + 'T00:00:00');
    dueDate.setHours(0, 0, 0, 0);

    // Assign color based on due date relative to today
    if (dueDate.getTime() < yesterday.getTime()) {
      return 'error'; // Red for tasks due before yesterday
    } else if (dueDate.getTime() < today.getTime()) {
      return 'warning'; // Yellow for due yesterday
    } else {
      return ''; // Green for due today
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

  let taskToComplete: TaskWithRelation | undefined = $state();

  function openModalForTask(task: TaskWithRelation) {
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
                    selected={user.id === taskToComplete?.dueUser?.id}>{user.username}</option>
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
  <a role="button" href={resolve('/tasks/single/add')}>{ m.schedule_single_task_add() }</a>
  <a role="button" href={resolve('/tasks/weekly/add')}>{ m.schedule_weekly_task_add() }</a>
</div>
<h2 class="headline">{ m.schedule_due_tasks() }</h2>
{#if data.dueTasks.length === 0}
  <article>{ m.schedule_due_tasks_empty() }</article>
{/if}
{#each data.dueTasks as task (task.id)}
  <article class={getDueCardPreset(task)}>
    <div class="action-bar">
      {#if task.completions !== undefined}
        <a class="icon-button" role="button" href={resolve('/tasks/weekly/[task]', {task: task.id})}>
          <Pencil size={16} />
          { m.generic_edit() }
        </a>
      {:else}
        <a class="icon-button" role="button" href={resolve('/tasks/single/[task]', {task: task.id})}>
          <Pencil size={16} />
          { m.generic_edit() }
        </a>
      {/if}
      <button class="icon-button" onclick={() => openModalForTask(task)}>
        <Check size={16} />
        { m.schedule_done() }
      </button>
    </div>
    <h3>{task.name}</h3>
    <hr />
    <div>
      <div>{ m.schedule_assignee() }: {task.dueUser?.username ?? 'N/A'}</div>
      <p>
        <strong>{ m.schedule_due_since() }:</strong> {formatDate(task.dueDate)}
      </p>
    </div>
  </article>
{/each}

{#if data.completedTasks.length > 0}
  <h2 class="headline">{ m.schedule_completed_tasks() }</h2>
  {#each data.completedTasks as task (task.id)}
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
        <div>{ m.schedule_assignee() }: {task.dueUser?.username}</div>
        <p><strong>{ m.schedule_upcoming_at() }:</strong> {formatDate(task.dueDate)}</p>
      </div>
    </article>
  {/each}
{/if}
