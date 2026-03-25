<script lang="ts">
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();
</script>

<article>
  {#await data.users}
    <div>
      <LoadingSpinner />
    </div>
  {:then users}
    {#if !data.has_active_user}
      <p>
        { m.settings_users_no_active_user() }
      </p>
    {/if}
    <h2>{ m.settings_users_default_distribution() }</h2>
    <EnhancedForm action="?/distribution">
      <div>
        {#each users as user (user.id)}
          <label>
            {user.username}
            <input type="hidden" name="userIds" value={user.id} />
            <input
              type="text"
              name="percents"
              bind:value={user.defaultDistribution}
            />
          </label>
        {/each}
      </div>
    </EnhancedForm>
  {/await}
</article>