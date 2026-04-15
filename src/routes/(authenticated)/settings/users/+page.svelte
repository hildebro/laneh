<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  let distributionPayload = $derived(
    data.users.map((user) => ({
      userId: user.id,
      percent: user.defaultDistribution
    }))
  );

  // 2. Sync the state when data updates (e.g., after invalidateAll runs)
  $effect(() => {
    distributionPayload = data.users.map((user) => ({
      userId: user.id,
      percent: user.defaultDistribution
    }));
  });

  async function submitAction() {
    const client = getApiClient();

    // 3. Pass the $state array into your Hono client's json payload
    return client.api.users.distributions.$post({
      json: distributionPayload
    });
  }

  async function onSuccess() {
    await invalidateAll();
  }
</script>

<article>
  <h2>{m.settings_users_default_distribution()}</h2>
  <ApiForm {submitAction} {onSuccess}>
    <div>
      {#each data.users as user, index (user.id)}
        <label>
          {user.username}
          <input type="hidden" name="userIds" value={user.id} />

          <input
            type="text"
            name="percents"
            bind:value={distributionPayload[index].percent}
          />
        </label>
      {/each}
    </div>
  </ApiForm>
</article>