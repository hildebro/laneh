<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import ApiFormItem from '$lib/components/ApiFormItem.svelte';

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
    <ApiFormItem
      label={m.generic_name()}
      name="username"
      bind:value={username}
      />
    <ApiFormItem
      label={m.auth_register_password()}
      name="password"
      bind:value={password}
    />
  </ApiForm>
</article>
