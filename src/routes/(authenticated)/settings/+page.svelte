<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import ApiFormItem from '$lib/components/ApiFormItem.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  let username = $derived(data.logged_in_user.username);
  let password = $state(undefined);

  async function updateUser() {
    const client = getApiClient();
    return client.api.users.update.$post({
      json: { username, password }
    });
  }

  async function exportDatabase() {
    const res = await getApiClient().api.users.export.$get();

    // Trigger the browser download using a streamlined anchor trick
    const a = document.createElement('a');
    a.href = URL.createObjectURL(await res.blob());

    // Extract the filename from the header, falling back to a default if empty
    a.download = res.headers.get('content-disposition')?.split('filename=')[1]?.replace(/["']/g, '')
      || 'database-dump.tar.gz';

    a.click();
  }

  async function onSuccess() {
    password = undefined;
    await invalidateAll();
  }
</script>

<div class="double-article">
  <article>
    <h2>{m.settings_shopping()}</h2>
    <div class="action-row">
      <a role="button" href={resolve('/settings/items')}>
        {m.settings_items_headline()}
      </a>
      <a role="button" href={resolve('/settings/categories')}>
        {m.settings_categories_headline()}
      </a>
    </div>
  </article>
  <article>
    <h2>{m.settings_actions()}</h2>
    <div class="action-row">
      <a role="button" href={resolve('/settings/households')}>
        {m.settings_households()}
      </a>
      <a role="button" href={resolve('/settings/users')}>
        {m.settings_users_distributions()}
      </a>
      <a role="button" href={resolve('/settings/register')}>
        {m.settings_users_add()}
      </a>
      <button type="button" onclick={exportDatabase}>
        {m.settings_actions_export()}
      </button>
    </div>
  </article>
</div>
<article>
  <h2>{m.settings_user_data()}</h2>
  <ApiForm submitAction={updateUser} {onSuccess}>
    <ApiFormItem
      label={m.generic_name()}
      name="username"
      bind:value={username}
    />
    <ApiFormItem
      label={m.settings_user_data_password()}
      name="password"
      bind:value={password}
    />
  </ApiForm>
</article>
