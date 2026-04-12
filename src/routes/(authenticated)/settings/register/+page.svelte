<script lang="ts">
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import * as m from '$lib/paraglide/messages.js';
</script>

<article>
  <h2>{ m.settings_users_add() }</h2>
  <EnhancedForm action="?/register" submitButtonText={m.settings_users_add()}>
    <label>
      {m.generic_name()}
      <input type="text" name="username" id="username" />
    </label>
    <label>
      {m.auth_register_password()}
      <input type="password" name="password" id="password" />
    </label>
  </EnhancedForm>
</article>
