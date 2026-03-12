<script lang="ts">
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { Weekday } from '$lib/server/db/schema';

  let { data } = $props();

  let name = $derived(data.task?.name);
  let weekday = $derived(data.task?.dueWeekday);
  let interval = $derived(data.task?.interval);
  let dueDate = $derived(data.task?.nextDueDate);
  let dueUserId = $derived(data.task?.nextDueUserId);

  function translateWeekday(weekday: Weekday) {
    switch (weekday) {
      case 'mon':
        return m.schedule_weekday_mon();
      case 'tue':
        return m.schedule_weekday_tue();
      case 'wed':
        return m.schedule_weekday_wed();
      case 'thu':
        return m.schedule_weekday_thu();
      case 'fri':
        return m.schedule_weekday_fri();
      case 'sat':
        return m.schedule_weekday_sat();
      case 'sun':
        return m.schedule_weekday_sun();
    }
  }
</script>

<div class="card max-w-screen-sm">
  <div class="h5 mb-4">
    {#if data.task}
      { m.settings_tasks_edit() }
    {:else }
      { m.settings_tasks_add() }
    {/if}
  </div>
  <EnhancedForm action="?/create">
    <div class="flex flex-col gap-3">
      <input type="hidden" name="id" value={data.task?.id}>
      <label>
        { m.generic_name() }
        <input class="input" type="text" name="name" bind:value={name} />
      </label>
      <label>
        { m.schedule_next_assignee() }
        <select class="select" name="dueUserId" bind:value={dueUserId}>
          <option value="" selected>{ m.generic_required() }</option>
          {#await data.users then users}
            {#each users as user (user.id)}
              <option value={user.id}>{user.username}</option>
            {/each}
          {/await}
        </select>
      </label>
      <label>
        { m.schedule_weekday() }
        <select class="select" name="weekday" bind:value={weekday}>
          <option value="" selected>{ m.generic_required() }</option>
          {#each data.weekdays as weekdayOption (weekdayOption)}
            <option value={weekdayOption}>{translateWeekday(weekdayOption)}</option>
          {/each}
        </select>
      </label>
      <div>
        { m.schedule_interval() }
        <div class="flex items-center gap-1">
          <span>{ m.schedule_interval_every()}</span>
          <input class="input w-36" type="number" name="interval" bind:value={interval} min="1">
          <span>{ m.schedule_interval_weeks() }</span>
        </div>
      </div>
      <label>
        { m.schedule_next_date() }
        <input class="input" type="date" name="dueDate" bind:value={dueDate} />
      </label>
      <p class="opacity-60">
        { m.schedule_next_date_info() }
      </p>
    </div>
  </EnhancedForm>
</div>