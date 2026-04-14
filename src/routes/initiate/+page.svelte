<script lang="ts">
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let username = $state('');
  let password = $state('');

  async function initiate() {
    const client = getApiClient();
    return client.api.public.initiate.$post({ json: { username, password } });
  }

  let files: FileList | undefined = $state();

  async function importDatabase() {
    const dumpFile = files && files.length > 0
      ? files[0]
      : new File([], '');

    const client = getApiClient();
    return client.api.public.importDatabase.$post({ form: { dumpFile } });
  }
</script>

<main>
  <article>
    { m.settings_users_add_disclaimer_no_users() }
  </article>
  <article>
    <h2>{ m.settings_users_add() }</h2>
    <ApiForm submitAction={initiate} submitButtonText={m.settings_users_add()} onSuccess={resolve('/')}>
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
  <article>
    <ApiForm
      submitAction={importDatabase}
      onSuccess={resolve('/login')}
      submitButtonText={m.settings_actions_import()}
    >
      <label class="label">
        <span>{m.settings_actions_import_file_label()}</span>
        <input
          type="file"
          name="dumpFile"
          accept="application/gzip, .tar.gz, .gz"
          bind:files={files}
        />
      </label>
    </ApiForm>
  </article>
</main>
