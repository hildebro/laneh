<script lang="ts">
  import { enhance } from '$app/forms';
  import * as m from '$lib/paraglide/messages.js';

  let { data, form } = $props();
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
      <input class="form-input input" type="text" name="name" required />
    </label>

    <label>
      Weekday
      <select class="select" name="weekday">
        <option value="" disabled selected>--Please choose a weekday--</option>
        {#each data.weekdays as weekdayOption (weekdayOption)}
          <option value={weekdayOption}>{weekdayOption}</option>
        {/each}
      </select>
    </label>

    <label>
      User
      <select class="select" name="userId">
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

  {#if data.task}
    <form method="POST" action="?/delete" use:enhance>
      <input type="hidden" name="taskId" value={data.task?.id}>
      <button type="submit" class="mt-2 btn preset-filled-error-400-600">
        { m.settings_categories_delete() }
      </button>
    </form>
  {/if}
</div>