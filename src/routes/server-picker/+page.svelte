<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import { getLocalBackend, setLocalMode } from '$lib/local';
  import * as m from '$lib/paraglide/messages.js';
  import { addToast } from '$lib/stores/toast';
  import { handleApiLoad } from '$lib/utils/apiHelper';

  let inputUrl = $state('');

  // Both actions can take a while, so the buttons are locked until the redirect happens.
  let pending = $state<'server' | 'local' | null>(null);

  async function saveUrl() {
    if (!inputUrl) {
      addToast({ message: m.server_picker_input_invalid(), type: 'warning' });

      return;
    }

    pending = 'server';
    localStorage.setItem('serverUrl', inputUrl);
    const client = getApiClient();

    try {
      const result = await handleApiLoad(client.api.public.marco.$get());

      if (result === 'polo') {
        await goto(resolve('/'));
      } else {
        localStorage.removeItem('serverUrl');
        addToast({ title: m.server_picker_error(), message: result });
      }
    } catch (error) {
      localStorage.removeItem('serverUrl');
      addToast({ title: m.server_picker_error(), message: error as string });
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
      addToast({ title: m.server_picker_local_error(), message: String(error), type: 'error' });
    } finally {
      pending = null;
    }
  }
</script>

<main>
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