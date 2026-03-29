<script lang="ts">
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  let name = $derived(data.task?.name);
  let dueDate = $derived(data.task?.dueDate);
  let dueUserId = $derived(data.task?.dueUserId);
</script>

<article>
  <h2>
    {#if data.task}
      { m.schedule_single_task_edit() }
    {:else }
      { m.schedule_single_task_add() }
    {/if}
  </h2>
  <EnhancedForm action="?/create">
    <input type="hidden" name="id" value={data.task?.id}>
    <label>
      { m.generic_name() }
      <input type="text" name="name" bind:value={name} />
    </label>
    <label>
      { m.schedule_single_task_assignee() }
      <select name="dueUserId" bind:value={dueUserId}>
        <option value="" selected>{ m.generic_required() }</option>
        {#await data.users then users}
          {#each users as user (user.id)}
            <option value={user.id}>{user.username}</option>
          {/each}
        {/await}
      </select>
    </label>
    <label>
      { m.schedule_single_task_due_date() }
      <input type="date" name="dueDate" bind:value={dueDate} />
    </label>
  </EnhancedForm>
</article>
