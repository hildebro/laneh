<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let username = $state('');
  let password = $state('');

  async function submitAction() {
    const client = getApiClient();

    return client.api.users.$put({ json: { username, password } });
  }
  
  async function onSuccess() {
    // Updating user data requires `invalidateAll` to bubble the change up to layout files.
    await invalidateAll();
    await goto(resolve('/settings'))
  }
</script>

<article>
  <h2>{ m.settings_users_add() }</h2>
  <ApiForm {submitAction} {onSuccess} submitButtonText={m.settings_users_add()}>
    <label>
      {m.generic_name()}
      <input type="text" name="username" id="username" bind:value={username} />
    </label>
    <label>
      {m.auth_register_password()}
      <input type="password" name="password" id="password" bind:value={password} />
    </label>
  </ApiForm>
</article>
