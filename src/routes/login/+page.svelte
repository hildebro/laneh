<script lang="ts">
  import { Capacitor } from '@capacitor/core';
  import { Preferences } from '@capacitor/preferences';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let username = $state('');
  let password = $state('');

  async function submitAction() {
    const client = getApiClient();
    return client.api.public.login.$post({ json: { username, password } });
  }

  async function onSuccess(response: Response) {
    if (Capacitor.isNativePlatform()) {
      const sessionToken = await response.json();
      await Preferences.set({
        key: 'session_token',
        value: sessionToken
      });
    }

    await goto(resolve('/shopping'));
  }
</script>

<main>
  <article>
    <ApiForm {submitAction} {onSuccess} submitButtonText={m.auth_login()}>
      <label>
        {m.generic_name()}
        <input class="input" type="text" name="username" bind:value={username} />
      </label>
      <label>
        {m.auth_register_password()}
        <input class="input" type="password" name="password" id="password" bind:value={password} />
      </label>
    </ApiForm>
  </article>
</main>
