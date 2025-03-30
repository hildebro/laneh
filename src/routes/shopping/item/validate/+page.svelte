<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  // State for item assignments: maps originalName to categoryId (or null if unassigned)
  let perfectItems = $state(data.items.filter(item => item.status === 'perfect'));
  let veryCloseItems = $state(data.items.filter(item => item.status === 'very_close'));
  let newItems = $state(data.items.filter(item => item.status === 'new'));

  let isSubmitting = $state(false);
</script>

<svelte:head>
  <title>Categorize New Items</title>
</svelte:head>

<div class="container mx-auto p-4">
  <h1 class="text-2xl font-semibold mb-4">Validate Shopping Items</h1>

  {#if form?.message}
    <div class="alert alert-error shadow-lg mb-4">
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none"
             viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Error: {form.message}</span>
      </div>
    </div>
  {/if}

  Existing item count: {perfectItems.length}
  <br />
  <br />
  New item count: {newItems.length}
  <br />
  <br />
  <form
    method="POST"
    use:enhance={() => {
        isSubmitting = true;
        return async ({ update }) => {
          isSubmitting = false;
          await update(); // Perform redirect or update UI
        };
      }}
    class="space-y-6"
  >
    {#each veryCloseItems as item (item.originalName)}
      <div class="flex items-center gap-2">
        <span>{item.originalName}</span>
        <span>Auto-fix item: {item.suggestion.name}</span>
        <label>
          <input type="checkbox" name="{item.originalName}" />
          Save as new instead
        </label>
      </div>
    {/each}

    <div class="mt-6 text-center">
      <button type="submit" class="btn" disabled={isSubmitting}>
        {#if isSubmitting}
          <span class="loading loading-spinner loading-xs"></span> Saving...
        {:else}
          Continue
        {/if}
      </button>
    </div>
  </form>
</div>