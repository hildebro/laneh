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

<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-4 card">
    <a class="btn" href={resolve('/settings/users')}>
      {m.settings_users_headline()}
    </a>
    <a class="btn" href={resolve('/settings/items')}>
      {m.settings_items_headline()}
    </a>
    <a class="btn" href={resolve('/settings/categories')}>
      {m.settings_categories_headline()}
    </a>
  </div>
  <div class="card">
    <h2 class="h2">{m.settings_user_data()}</h2>
    <EnhancedForm action="?/updateUser">
      <label>
        {m.generic_name()}
        <input class="input" type="text" name="username" value={data.user?.username} />
      </label>
      <label>
        {m.settings_user_data_password()}
        <input class="input" type="password" name="password" id="password" />
      </label>
    </EnhancedForm>
  </div>
  <div class="card">
    <h2 class="h2 mb-2">{m.settings_actions()}</h2>
    <h5 class="h5">{m.settings_users_language()}</h5>
    <div class="flex flex-row gap-4 mb-4">
      {#each locales as locale(locale)}
        <button class="btn text-2xl" onclick={() => setLocale(locale)}>
          {transLocale(locale)}
        </button>
      {/each}
    </div>
    <div class="flex flex-row gap-4">
      <a class="btn" href={resolve('/auth/register')}>
        {m.settings_users_add()}
      </a>
      <form action="?/logout" method="POST" use:enhance>
        <button type="submit" class="btn">{m.auth_logout()}</button>
      </form>
      {#if Capacitor.isNativePlatform()}
        <div class="native-controls">
          <button type="button" onclick={() => disconnectFromWrapper(data.returnUrl)} class="btn">
            {m.settings_mobile_return_to_wrapper()}
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>