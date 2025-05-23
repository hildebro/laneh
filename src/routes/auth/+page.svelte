<script lang="ts">
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import * as m from '$lib/paraglide/messages.js';
</script>

<div class="card">
  <EnhancedForm>
    <label>
      {m.auth_access_code()}
      <input class="form-input input" type="text" name="code" />
    </label>
    <button class="btn mt-1" type="submit">{m.auth_login()}</button>
  </EnhancedForm>
</div>
