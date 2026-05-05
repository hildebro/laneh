<script lang="ts">
  import { Capacitor } from '@capacitor/core';
  import { Moon, Sun } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { goto, invalidateAll } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
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

  async function onSuccess() {
    password = undefined;
    await invalidateAll();
  }

  function exitInstance() {
    localStorage.removeItem('serverUrl');
    goto(resolve('/server-picker'));
  }

  let isDark = $state(false);

  onMount(() => {
    isDark = document.documentElement.getAttribute('data-color-scheme') === 'dark';
  });

  function toggleTheme() {
    isDark = !isDark;
    const newScheme = isDark ? 'dark' : 'light';

    document.documentElement.setAttribute('data-color-scheme', newScheme);
    localStorage.setItem('color-scheme', newScheme);
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
      <a role="button" href={resolve('/settings/users')}>
        {m.settings_users_distributions()}
      </a>
      <a role="button" href={resolve('/settings/register')}>
        {m.settings_users_add()}
      </a>
      <a role="button" href={resolve('/api/export')} download="database-dump.tar.gz">
        {m.settings_actions_export()}
      </a>
      {#if Capacitor.isNativePlatform()}
        <button onclick={exitInstance}>{m.settings_mobile_return_to_wrapper()}</button>
      {/if}
    </div>
  </article>
</div>
<article>
  <h2>{m.settings_user_data()}</h2>
  <ApiForm submitAction={updateUser} {onSuccess}>
    <label>
      {m.generic_name()}
      <input type="text" name="username" bind:value={username} />
    </label>
    <label>
      {m.settings_user_data_password()}
      <input type="password" name="password" id="password" bind:value={password} />
    </label>
  </ApiForm>
</article>
<article>
  <h2>{m.settings_users_theme()}</h2>
  <div class="action-row">
    <button onclick={() => toggleTheme()}>
      {#if isDark}
        <Moon />
      {:else}
        <Sun />
      {/if}
    </button>
  </div>
</article>

