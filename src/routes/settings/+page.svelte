<script lang="ts">
  import { resolve } from '$app/paths';
  import EnhancedForm from '$lib/EnhancedForm.svelte';
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
</div>