<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { getBaseUrl } from '$lib/config';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  let id = $derived(data.task?.id);
  let name = $derived(data.task?.name ?? '');
  let dueDate = $derived(data.task?.dueDate ?? '');
  let dueUserId = $derived(data.task?.dueUserId ?? '');

  async function handleSubmit(event: Event) {
    event.preventDefault();
    const baseUrl = getBaseUrl();

    const response = await fetch(baseUrl + resolve('/api/tasks/single/[task]', { task: id ?? 'add' }), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // 'Authorization': `Bearer ${token}` // You will likely need this
      },
      body: JSON.stringify({ id, name, dueDate, dueUserId })
    });

    if (response.ok) {
      goto(resolve('/tasks'));
    } else {
      console.error('Failed to save task');
    }
  }
</script>

<article>
  <h2>{ data.task ? m.schedule_single_task_edit() : m.schedule_single_task_add() }</h2>

  <form onsubmit={handleSubmit}>
    <label>
      { m.generic_name() }
      <input type="text" bind:value={name} required />
    </label>

    <label>
      { m.schedule_single_task_assignee() }
      <select bind:value={dueUserId}>
        <option value=""></option>
        {#await data.users then users}
          {#each users as user (user.id)}
            <option value={user.id}>{user.username}</option>
          {/each}
        {/await}
      </select>
    </label>

    <label>
      { m.schedule_single_task_due_date() }
      <input type="date" bind:value={dueDate} />
    </label>

    <button type="submit">Save</button>
  </form>
</article>