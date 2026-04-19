<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';

  let inputUrl = '';

  function saveUrl() {
    if (inputUrl) {
      localStorage.setItem('serverUrl', inputUrl);
      // Optional: Test the API connection here before redirecting
      goto(resolve('/')); // Go back to the main app
    }
  }
</script>

<main>
  <h1>Enter Server URL</h1>
  <p>Please enter the URL of your self-hosted instance:</p>

  <form on:submit|preventDefault={saveUrl}>
    <input
      type="url"
      bind:value={inputUrl}
      placeholder="https://your-server.com"
      required
    />
    <button type="submit">Connect</button>
  </form>
</main>
