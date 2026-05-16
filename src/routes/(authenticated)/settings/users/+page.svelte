<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import ApiFormGroup from '$lib/components/ApiFormGroup.svelte';
  import ApiFormItem from '$lib/components/ApiFormItem.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  let distributions = $state(
    data.users.map((user) => ({
      userId: user.id,
      username: user.username,
      percent: user.defaultDistribution
    }))
  );

  async function submitAction() {
    const client = getApiClient();

    // 3. Pass the $state array into your Hono client's json payload
    return client.api.users.distributions.$post({
      json: distributions
    });
  }

  async function onSuccess() {
    // Updating user data requires `invalidateAll` to bubble the change up to layout files.
    await invalidateAll();
    await goto(resolve('/settings'))
  }
</script>

<article>
  <ApiForm {submitAction} {onSuccess}>
    <ApiFormGroup
      label={m.settings_users_default_distribution()}
      name="distributions"
    >
      {#each distributions as dist, index (dist.userId)}
        <ApiFormItem
          label={dist.username}
          name={`${index}.percent`}
          type="number"
          bind:value={dist.percent}
        />
      {/each}
    </ApiFormGroup>
  </ApiForm>
</article>