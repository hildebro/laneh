<script lang="ts">
  import { Capacitor } from '@capacitor/core';
  import EnhancedForm from '$lib/EnhancedForm.svelte';
  import { disconnectFromWrapper } from '$lib/mobile-shell';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();
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
    {#snippet additionalButtons()}
      {#if Capacitor.isNativePlatform()}
        <button type="button" onclick={() => disconnectFromWrapper(data.returnUrl)} class="btn">
          {m.settings_mobile_return_to_wrapper()}
        </button>
      {/if}
    {/snippet}
  </EnhancedForm>
</div>
