<script lang="ts">
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import * as m from '$lib/paraglide/messages.js';
</script>

<div class="card">
  <h1 class="h1">{m.auth_setup_welcome()}</h1>
  <p class="mb-4">{m.auth_setup_text()}</p>
  <EnhancedForm submitButtonText={m.auth_login()}>
    <label>
      {m.auth_setup_password()}
      <input class="input" type="password" name="password" />
    </label>
    <label>
      {m.auth_setup_password_confirm()}
      <input class="input" type="password" name="passwordConfirm" />
    </label>
  </EnhancedForm>
</div>
