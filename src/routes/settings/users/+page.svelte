<script lang="ts">
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();
</script>

{#await data.users}
  <div class="card">
    <LoadingSpinner />
  </div>
{:then users}
  {#if !data.has_active_user}
    <p class="card w-full preset-filled-error-50-950 rounded m-2 text-center">
      { m.settings_users_no_active_user() }
    </p>
  {/if}
  <div class="card mb-2 w-full">
    <h1 class="text-2xl font-semibold mb-4">{ m.settings_users_default_distribution() }</h1>
    <EnhancedForm action="?/distribution">
      <div class="flex flex-row flex-wrap gap-4">
        {#each users as user (user.id)}
          <label class="w-17">
            {user.username}
            <input type="hidden" name="userIds" value={user.id} />
            <input
              class="input"
              type="text"
              name="percents"
              bind:value={user.defaultDistribution}
            />
          </label>
        {/each}
      </div>
    </EnhancedForm>
  </div>
{/await}
