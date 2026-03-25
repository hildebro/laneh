<script lang="ts">
  import { Capacitor } from '@capacitor/core';
  import { enhance } from '$app/forms';
  import { resolve } from '$app/paths';
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import { transLocale } from '$lib/locale-translations.js';
  import { disconnectFromWrapper } from '$lib/mobile-shell';
  import * as m from '$lib/paraglide/messages.js';
  import { locales, setLocale } from '$lib/paraglide/runtime.js';

  let { data } = $props();
</script>

<article>
  <div class="action-row">
    <a role="button" href={resolve('/settings/users')}>
      {m.settings_users_headline()}
    </a>
    <a role="button" href={resolve('/settings/items')}>
      {m.settings_items_headline()}
    </a>
    <a role="button" href={resolve('/settings/categories')}>
      {m.settings_categories_headline()}
    </a>
  </div>
</article>

<article>
  <h2>{m.settings_user_data()}</h2>
  <EnhancedForm action="?/updateUser">
    <label>
      {m.generic_name()}
      <input type="text" name="username" value={data.user?.username} />
    </label>
    <label>
      {m.settings_user_data_password()}
      <input type="password" name="password" id="password" />
    </label>
  </EnhancedForm>
</article>
<article>
  <h2>{m.settings_users_language()}</h2>
  <div class="action-row">
    {#each locales as locale(locale)}
      <button onclick={() => setLocale(locale)}>
        {transLocale(locale)}
      </button>
    {/each}
  </div>
</article>
<article>
  <h2>{m.settings_actions()}</h2>
  <div class="action-row">
    <a role="button" href={resolve('/api/export')} download="database-dump.tar.gz">
      {m.settings_actions_export()}
    </a>
    <a role="button" href={resolve('/auth/register')}>
      {m.settings_users_add()}
    </a>
    <form action="?/logout" method="POST" use:enhance>
      <button type="submit">{m.auth_logout()}</button>
    </form>
    {#if Capacitor.isNativePlatform()}
      <div>
        <button type="button" onclick={() => disconnectFromWrapper(data.returnUrl)}>
          {m.settings_mobile_return_to_wrapper()}
        </button>
      </div>
    {/if}
  </div>
</article>
