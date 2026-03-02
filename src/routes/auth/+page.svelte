<script lang="ts">
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import * as m from '$lib/paraglide/messages.js';
</script>

<div class="card">
  <EnhancedForm submitButtonText={m.auth_login()}>
    <label>
      {m.generic_name()}
      <input class="input" type="text" name="username" />
    </label>
    <label>
      {m.auth_register_password()}
      <input class="input" type="password" name="password" id="password" />
    </label>
  </EnhancedForm>
</div>
