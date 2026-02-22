<script lang="ts">
  import { Preferences } from '@capacitor/preferences';
  import { onMount } from 'svelte';

  let url = '';
  let isLoading = false;
  let errorMessage = '';

  let abortController: AbortController | null = null;
  const TIMEOUT_MS = 10000;

  onMount(async () => {
    const { value } = await Preferences.get({ key: 'savedServerUrl' });
    if (value) {
      url = value;
    }
  });

  async function connect() {
    if (!url) {
      errorMessage = 'Please enter a URL.';
      return;
    }

    // Basic formatting safety
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    isLoading = true;
    errorMessage = '';

    // Create a new AbortController for this request
    abortController = new AbortController();

    // Set up the automatic timeout
    const timeoutId = setTimeout(() => {
      if (abortController) abortController.abort();
    }, TIMEOUT_MS);

    try {
      // We use a HEAD request because we only care about the status code,
      // not downloading the whole website body right now.
      const response = await fetch(url, {
        method: 'HEAD',
        signal: abortController.signal
      });

      clearTimeout(timeoutId); // Clear timeout if we get a fast response

      if (response.ok) {
        // 1. Save the valid URL for next time
        await Preferences.set({ key: 'savedServerUrl', value: url });

        // 2. Navigate the webview to the hosted app
        window.location.href = url;
      } else {
        errorMessage = `Server responded with status: ${response.status}`;
      }
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Connection timed out or was cancelled.';
        } else {
          errorMessage = `Failed to reach the server: ${error.message}`;
        }
      } else {
        // Fallback for weird cases where a non-Error was thrown
        errorMessage = 'Failed to reach the server. Is the URL correct?';
      }
    } finally {
      isLoading = false;
      abortController = null;
    }
  }

  function cancel() {
    if (abortController) {
      abortController.abort(); // This instantly triggers the catch block above
    }
  }
</script>

<main>
  <h1>Connect to Server</h1>

  <div class="form-group">
    <input
      type="url"
      bind:value={url}
      placeholder="e.g., https://my-app.com"
      disabled={isLoading}
    />
  </div>

  {#if errorMessage}
    <p class="error">{errorMessage}</p>
  {/if}

  <div class="actions">
    {#if isLoading}
      <p>Connecting...</p>
      <button class="cancel-btn" on:click={cancel}>Cancel</button>
    {:else}
      <button class="connect-btn" on:click={connect}>Connect</button>
    {/if}
  </div>
</main>

<style>
    /* Some basic styles to make it look decent */
    main {
        padding: 2rem;
        font-family: sans-serif;
        text-align: center;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    input {
        padding: 0.8rem;
        width: 100%;
        max-width: 300px;
        font-size: 1rem;
    }

    button {
        padding: 0.8rem 2rem;
        font-size: 1rem;
        cursor: pointer;
    }

    .error {
        color: red;
        font-weight: bold;
    }

    .cancel-btn {
        background-color: #ff4444;
        color: white;
        border: none;
    }

    .connect-btn {
        background-color: #4CAF50;
        color: white;
        border: none;
    }
</style>