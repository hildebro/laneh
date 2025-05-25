<script lang="ts">
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import * as m from '$lib/paraglide/messages.js';
</script>

<div class="card">
  <EnhancedForm submitButtonText={m.auth_login()}>
    <label>
      {m.auth_access_code()}
      <input class="form-input input" type="text" name="code" />
    </label>
  </EnhancedForm>
</div>
