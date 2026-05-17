<script lang="ts">
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import ApiFormItem from '$lib/components/ApiFormItem.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  let id = $derived(data.task?.id);
  let name = $derived(data.task?.name ?? '');
  let dueDate = $derived(data.task?.dueDate ?? '');
  let dueUserId = $derived(data.task?.dueUserId ?? '');

  async function saveTask() {
    const client = getApiClient();
    return client.api.tasks.single.$post({
      json: { id, name, dueDate, dueUserId }
    });
  }
</script>

<article>
  <h2>{ id ? m.schedule_single_task_edit() : m.schedule_single_task_add() }</h2>

  <ApiForm submitAction={saveTask} onSuccess={resolve('/tasks')}>
    <ApiFormItem
      label={m.generic_name()}
      name="name"
      bind:value={name}
    />
    <ApiFormItem
      label={m.schedule_single_task_assignee()}
      name="assignee"
      type="select"
      bind:value={dueUserId}
    >
      {#each data.users as user (user.id)}
        <option value={user.id}>{user.username}</option>
      {/each}
    </ApiFormItem>
    <ApiFormItem
      label={ m.schedule_single_task_due_date() }
      name="date"
      type="date"
      bind:value={dueDate}
    />
  </ApiForm>
</article>
