<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';

  let inputUrl = $state('');

  function saveUrl(event: Event) {
    event.preventDefault();

    if (inputUrl) {
      localStorage.setItem('serverUrl', inputUrl);
      // Optional: Test the API connection here before redirecting
      goto(resolve('/'));
    }
  }
</script>

<main>
  <h1>Enter Server URL</h1>
  <p>Please enter the URL of your self-hosted instance:</p>

  <form onsubmit={saveUrl}>
    <input
      type="url"
      bind:value={inputUrl}
      placeholder="https://your-server.com"
      required
    />
    <button type="submit">Connect</button>
  </form>
</main>
