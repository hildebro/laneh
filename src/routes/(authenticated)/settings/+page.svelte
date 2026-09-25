<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import ApiFormItem from '$lib/components/ApiFormItem.svelte';
  import { isOfflineMode } from '$lib/offline';
  import * as m from '$lib/paraglide/messages.js';
  import { addToast } from '$lib/stores/toast';
  import { saveFile } from '$lib/utils/fileHelper';
  import { Admin } from '$lib/utils/userHelper';

  let { data } = $props();

  // The offline app has a single dummy user and household, so there is nothing to manage about them.
  const offline = isOfflineMode();

  let username = $derived(data.logged_in_user.username);
  let password = $state(undefined);

  async function updateUser() {
    const client = getApiClient();
    return client.api.users.update.me.$post({
      json: { username, password }
    });
  }

  async function exportDatabase() {
    const res = await getApiClient().api.users.export.$get();
    if (!res.ok) {
      addToast({ title: m.form_error(), message: m.error_database_export(), type: 'error' });

      return;
    }

    const disposition = res.headers.get('content-disposition');
    let downloadName = 'database-dump.tar.gz';
    if (disposition && disposition.includes('filename=')) {
      downloadName = disposition.split('filename=')[1]?.replace(/["']/g, '');
    }

    try {
      await saveFile(await res.blob(), downloadName);
    } catch {
      addToast({ title: m.form_error(), message: m.error_database_export(), type: 'error' });
    }
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
</div>
{#if !offline}
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
        type="password"
        bind:value={password}
      />
    </ApiForm>
  </article>
{/if}
{#if data.logged_in_user.admin !== Admin.None}
  <article>
    <h2>{m.settings_admin()}</h2>
    <div class="action-row">
      {#if !offline}
        <a role="button" href={resolve('/settings/households')}>
          {m.settings_households()}
        </a>
        <a role="button" href={resolve('/settings/users/add')}>
          {m.settings_users_add()}
        </a>
        <a role="button" href={resolve('/settings/users')}>
          {m.settings_users_distributions()}
        </a>
      {/if}
      {#if data.logged_in_user.admin === Admin.Server}
        <button type="button" onclick={exportDatabase}>
          {m.settings_actions_export()}
        </button>
      {/if}
    </div>
  </article>
{/if}
