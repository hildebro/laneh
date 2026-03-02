<script lang="ts">
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();
</script>

<div class="card">
  {#if data.users.length === 0}
    <p class="card w-full preset-filled-error-50-950 rounded m-2 text-center">
      { m.settings_users_add_disclaimer_no_users() }
    </p>
  {/if}
  <EnhancedForm submitButtonText={m.settings_users_add()}>
    <label>
      {m.generic_name()}
      <input class="input" type="text" name="username" id="username" />
    </label>
    <label>
      {m.auth_register_password()}
      <input class="input" type="password" name="password" id="password" />
    </label>
  </EnhancedForm>
</div>
