<script lang="ts">
  import { enhance } from '$app/forms';
  import * as m from '$lib/paraglide/messages.js';

  let { data, form } = $props();

  let name = $state(data.task?.name);
  let weekday = $state(data.task?.dueWeekday);
  let userId = $state(data.task?.nextDueUserId);
</script>

<div class="card">
  <div class="h5 mb-4">
    {#if data.task}
      { m.settings_tasks_edit() }
    {:else }
      { m.settings_tasks_add() }
    {/if}
  </div>
  <form method="POST" action="?/create" use:enhance>
    <input type="hidden" name="taskId" value={data.task?.id}>
    <label>
      { m.generic_name() }
      <input class="form-input input" type="text" name="name" bind:value={name} />
    </label>

    <label>
      Weekday
      <select class="select" name="weekday" bind:value={weekday}>
        <option value="" disabled selected>--Please choose a weekday--</option>
        {#each data.weekdays as weekdayOption (weekdayOption)}
          <option value={weekdayOption}>{weekdayOption}</option>
        {/each}
      </select>
    </label>

    <label>
      User
      <select class="select" name="userId" bind:value={userId}>
        <option value="" disabled selected>--Please choose a user--</option>
        {#await data.users then users}
          {#each users as user (user.id)}
            <option value={user.id}>{user.username}</option>
          {/each}
        {/await}
      </select>
    </label>

    <button type="submit" class="btn mt-1">
      { m.generic_save() }
    </button>

    {#if form?.message}
      <p class="preset-filled-error-50-950 rounded mt-4 text-center">{form.message}</p>
    {/if}
  </form>
</div>