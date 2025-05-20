<script lang="ts">
  import { enhance } from '$app/forms';
  import * as m from '$lib/paraglide/messages.js';
  import type { Weekday } from '$lib/server/db/schema';

  let { data, form } = $props();

  let name = $state(data.task?.name);
  let weekday = $state(data.task?.dueWeekday);
  let userId = $state(data.task?.nextDueUserId);

  function translateWeekday(weekday: Weekday) {
    switch (weekday) {
      case 'mon':
        return m.schedule_weekday_mon()
      case 'tue':
        return m.schedule_weekday_tue()
      case 'wed':
        return m.schedule_weekday_wed()
      case 'thu':
        return m.schedule_weekday_thu()
      case 'fri':
        return m.schedule_weekday_fri()
      case 'sat':
        return m.schedule_weekday_sat()
      case 'sun':
        return m.schedule_weekday_sun()
    }
  }
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
      <input class="form-input input mb-2" type="text" name="name" bind:value={name} />
    </label>

    <label>
      { m.schedule_weekday() }
      <select class="select mb-2" name="weekday" bind:value={weekday}>
        <option value="" disabled selected>{ m.generic_required() }</option>
        {#each data.weekdays as weekdayOption (weekdayOption)}
          <option value={weekdayOption}>{translateWeekday(weekdayOption)}</option>
        {/each}
      </select>
    </label>

    <label>
      { m.schedule_next_assignee() }
      <select class="select mb-2" name="userId" bind:value={userId}>
        <option value="" disabled selected>{ m.generic_required() }</option>
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