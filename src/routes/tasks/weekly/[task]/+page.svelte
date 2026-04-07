<script lang="ts">
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { Weekday } from '$lib/utils/taskHelper';

  let { data } = $props();

  let id = $derived(data.task?.id);
  let name = $derived(data.task?.name ?? '');
  let weekday = $derived(data.task?.dueWeekday ?? '');
  let interval = $derived(data.task?.interval ?? '');
  let dueDate = $derived(data.task?.dueDate ?? '');
  let dueUserId = $derived(data.task?.dueUserId ?? '');

  async function saveTask() {
    const client = getApiClient();
    return client.api.tasks.weekly.$post({
      json: { id, name, dueDate, dueUserId, weekday: weekday as Weekday, interval }
    });
  }

  function translateWeekday(weekday: Weekday) {
    switch (weekday) {
      case Weekday.Monday:
        return m.schedule_weekday_mon();
      case Weekday.Tuesday:
        return m.schedule_weekday_tue();
      case Weekday.Wednesday:
        return m.schedule_weekday_wed();
      case Weekday.Thursday:
        return m.schedule_weekday_thu();
      case Weekday.Friday:
        return m.schedule_weekday_fri();
      case Weekday.Saturday:
        return m.schedule_weekday_sat();
      case Weekday.Sunday:
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
  <ApiForm submitAction={saveTask} onSuccess={resolve('/tasks')}>
    <input type="hidden" name="id" value={id}>
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
        {#each Object.values(Weekday) as weekdayOption (weekdayOption)}
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
    {#if data.task?.completions}
      {#await data.users}
        <LoadingSpinner />
      {:then users}
        <div>{ m.schedule_completions() }</div>
        <ul>
          {#each users as user (user.id)}
            <li>
              {user.username}: { data.task.completions?.filter(completion => completion.userId === user.id).length }
            </li>
          {/each}
        </ul>
      {/await}
    {/if}
  </ApiForm>
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