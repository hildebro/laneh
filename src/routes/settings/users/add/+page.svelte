<script lang="ts">
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import * as m from '$lib/paraglide/messages.js';
</script>

<div class="card">
  <EnhancedForm submitButtonText={m.settings_users_add()}>
    <label>
      {m.generic_name()}
      <br />
      <input class="input" type="text" name="username" id="username" />
    </label>
  </EnhancedForm>
</div>
