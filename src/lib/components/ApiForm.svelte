<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import type { Snippet } from 'svelte';

  let {
    submitAction,
    redirectTo,
    children
  }: {
    submitAction: () => Promise<Response>;
    redirectTo: string;
    children: Snippet;
  } = $props();

  let isSubmitting = $state(false);
  let errorMessage = $state('');

  async function handleSubmit(event: Event) {
    event.preventDefault();
    isSubmitting = true;
    errorMessage = '';

    try {
      const response = await submitAction();

      if (response.ok) {
        goto(resolve(redirectTo));
      } else {
        errorMessage = 'Failed to save data. Please try again.';
        console.error('API Error:', await response.text());
      }
    } catch (err) {
      errorMessage = 'An unexpected error occurred.';
      console.error(err);
    } finally {
      isSubmitting = false;
    }
  }
</script>

<form onsubmit={handleSubmit}>
  {#if errorMessage}
    <div style="color: red; margin-bottom: 1rem;">{errorMessage}</div>
  {/if}

  {@render children()}

  <button type="submit" disabled={isSubmitting}>
    {isSubmitting ? 'Saving...' : 'Save'}
  </button>
</form>