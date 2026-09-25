<script lang="ts">
  import { Preferences } from '@capacitor/preferences';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import ApiFormItem from '$lib/components/ApiFormItem.svelte';
  import * as m from '$lib/paraglide/messages.js';

  // Offline mode has no use for households and users, so dummies are created instead of asking for them.
  async function startFresh() {
    const client = getApiClient();
    return client.api.public.offline.initiate.$post({
      json: { householdName: m.initiate_offline_household_name(), username: m.initiate_offline_username() }
    });
  }

  async function onStarted(response: Response) {
    const { sessionToken } = await response.json();
    await Preferences.set({ key: 'session_token', value: sessionToken });

    await goto(resolve('/'));
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
    <ApiForm submitAction={startFresh} submitButtonText={m.initiate_offline_submit()} onSuccess={onStarted}>
      <p>{m.initiate_offline_text()}</p>
    </ApiForm>
  </article>
  <article>
    <!-- The authenticated area logs in automatically. -->
    <ApiForm
      submitAction={importDatabase}
      onSuccess={resolve('/')}
      submitButtonText={m.settings_actions_import()}
    >
      <ApiFormItem
        type="file"
        name="dumpFile"
        label={m.settings_actions_import_file_label()}
        accept="application/gzip, .tar.gz, .gz"
        bind:files={files}
      />
    </ApiForm>
  </article>
</main>
