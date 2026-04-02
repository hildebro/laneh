<script lang="ts">
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { Weekday } from '$lib/server/db/schema';

  let { data } = $props();

  let name = $derived(data.task?.name);
  let weekday = $derived(data.task?.dueWeekday);
  let interval = $derived(data.task?.interval);
  let dueDate = $derived(data.task?.dueDate);
  let dueUserId = $derived(data.task?.dueUserId);

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

<article>
  <h2>
    {#if data.task}
      { m.schedule_weekly_task_edit() }
    {:else }
      { m.schedule_weekly_task_add() }
    {/if}
  </h2>
  <EnhancedForm action="?/create">
    <input type="hidden" name="id" value={data.task?.id}>
    <label>
      { m.generic_name() }
      <input type="text" name="name" bind:value={name} />
    </label>
    <label>
      { m.schedule_next_assignee() }
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
      { m.schedule_weekday() }
      <select name="weekday" bind:value={weekday}>
        <option value="" selected>{ m.generic_required() }</option>
        {#each data.weekdays as weekdayOption (weekdayOption)}
          <option value={weekdayOption}>{translateWeekday(weekdayOption)}</option>
        {/each}
      </select>
    </label>
    <div class="label">{ m.schedule_interval() }</div>
    <div class="interval-row">
      <span>{ m.schedule_interval_every()}</span>
      <input type="number" name="interval" bind:value={interval} min="1">
      <span>{ m.schedule_interval_weeks() }</span>
    </div>
    <label>
      { m.schedule_next_date() }
      <input type="date" name="dueDate" bind:value={dueDate} />
    </label>
    <p>
      { m.schedule_next_date_info() }
    </p>
  </EnhancedForm>
</article>

<style>
    .interval-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.75rem;
        margin-top: 0.25rem;
    }

    .interval-row input[type="number"] {
        width: 5rem;
        text-align: center;
    }
</style>