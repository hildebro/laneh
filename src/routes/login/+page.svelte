<script lang="ts">
  import { Capacitor } from '@capacitor/core';
  import { Preferences } from '@capacitor/preferences';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import ApiFormItem from '$lib/components/ApiFormItem.svelte';
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
    <h2>{m.login_headline()}</h2>
    <ApiForm {submitAction} {onSuccess} submitButtonText={m.auth_login()}>
      <ApiFormItem
        label={m.generic_name()}
        name="username"
        bind:value={username}
      />
      <ApiFormItem
        label={m.auth_register_password()}
        name="password"
        type="password"
        bind:value={password}
      />
    </ApiForm>
  </article>
</main>
