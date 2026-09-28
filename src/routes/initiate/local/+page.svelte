<script lang="ts">
  import { Preferences } from '@capacitor/preferences';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import ApiFormItem from '$lib/components/ApiFormItem.svelte';
  import HelpHint from '$lib/components/HelpHint.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { getLocale } from '$lib/paraglide/runtime.js';

  // Local mode has no use for households and users, so dummies are created instead of asking for them.
  async function startFresh() {
    const client = getApiClient();
    return client.api.public.local.initiate.$post({
      json: {
        householdName: m.initiate_local_household_name(),
        username: m.initiate_local_username(),
        locale: getLocale()
      }
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
  <HelpHint />
  <article>
    <ApiForm submitAction={startFresh} submitButtonText={m.initiate_local_submit()} onSuccess={onStarted}>
      <p>{m.initiate_local_text()}</p>
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
