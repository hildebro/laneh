<script lang="ts">
  import { Capacitor } from '@capacitor/core';
  import { resolve } from '$app/paths';
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import { disconnectFromWrapper } from '$lib/mobile-shell';
  import * as m from '$lib/paraglide/messages.js';

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
    <EnhancedForm action="?/updateUser">
      <h2 class="h2">{m.settings_user_data_edit()}</h2>
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
  {#if Capacitor.isNativePlatform()}
    <div class="card native-controls">
      <h2 class="h2 mb-2">{m.settings_mobile_label()}</h2>
      <button type="button" onclick={() => disconnectFromWrapper(data.returnUrl)} class="btn">
        {m.settings_mobile_return_to_wrapper()}
      </button>
    </div>
  {/if}
</div>