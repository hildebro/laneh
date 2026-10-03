<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import HelpHint from '$lib/components/HelpHint.svelte';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import { getLocalBackend, setLocalMode } from '$lib/local';
  import * as m from '$lib/paraglide/messages.js';
  import { addToast } from '$lib/stores/toast';
  import { handleApiLoad } from '$lib/utils/apiHelper';
  import { getServerUrlCandidates } from '$lib/utils/serverUrlHelper';

  let inputUrl = $state('');

  // Both actions can take a while, so the buttons are locked until the redirect happens.
  let pending = $state<'server' | 'local' | null>(null);

  async function saveUrl() {
    const candidates = getServerUrlCandidates(inputUrl);

    if (candidates.length === 0) {
      addToast({ message: m.server_picker_input_invalid(), type: 'warning' });

      return;
    }

    pending = 'server';
    // A leftover local mode marker would send the requests to the backend on the device instead
    localStorage.removeItem('serverUrl');

    // All candidates are tried at once, so an unreachable host costs one timeout instead of one per candidate.
    // The attempts never reject, so the ones still running when a winner is found don't cause unhandled rejections.
    const attempts = candidates.map((candidate) =>
      handleApiLoad(getApiClient(undefined, candidate).api.public.marco.$get()).then(
        (result) => (result === 'polo' ? { ok: true as const, candidate } : { ok: false as const, error: result }),
        (error) => ({ ok: false as const, error: error as string })
      )
    );

    // Awaiting in candidate order picks the highest ranked server that answered, e.g. https over http.
    // Only the error of the last attempt is shown, as the earlier ones are just fallbacks that didn't work out.
    let lastError = '';

    try {
      for (const attempt of attempts) {
        const outcome = await attempt;

        if (outcome.ok) {
          localStorage.setItem('serverUrl', outcome.candidate);
          await goto(resolve('/'));

          return;
        }

        lastError = outcome.error;
      }

      console.error(lastError);
      addToast({ message: m.server_picker_error(), type: 'error' });
    } finally {
      pending = null;
    }
  }

  async function localMode() {
    pending = 'local';
    setLocalMode();

    try {
      // The first start runs all migrations, so it's done here with feedback instead of silently during navigation.
      await getLocalBackend();
      await goto(resolve('/'));
    } catch (error) {
      localStorage.removeItem('serverUrl');
      console.error(error);
      addToast({ message: m.server_picker_local_error(), type: 'error' });
    } finally {
      pending = null;
    }
  }
</script>

<main>
  <HelpHint />
  <article>
    <h2>{m.server_picker_header()}</h2>
    <p>{m.server_picker_text()}</p>

    <input
      type="url"
      bind:value={inputUrl}
      placeholder="https://your-server.com"
    />
    <div class="action-row">
      <button type="button" class="icon-button" disabled={pending !== null} onclick={saveUrl}>
        {#if pending === 'server'}
          <LoadingSpinner size={6} bright />
        {/if}
        {m.server_picker_connect()}
      </button>
      <button type="button" class="icon-button" disabled={pending !== null} onclick={localMode}>
        {#if pending === 'local'}
          <LoadingSpinner size={6} bright />
        {/if}
        {m.local_mode()}
      </button>
    </div>
  </article>
</main>

<style>
    main {
        align-content: center;
    }
</style>