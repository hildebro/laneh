<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  // State for item assignments: maps originalName to categoryId (or null if unassigned)
  let assignedItems = $state(data.newItems.map(item => ({ ...item, categoryId: null })));

  let isSubmitting = $state(false);

  function handleCategoryChange(itemName: string, categoryId: number | null) {
    assignedItems = assignedItems.map(item =>
      item.originalName === itemName ? { ...item, categoryId } : item
    );
  }
</script>

<svelte:head>
  <title>Categorize New Items</title>
</svelte:head>

<div class="container mx-auto p-4">
  <h1 class="text-2xl font-semibold mb-4">Categorize New Shopping Items</h1>

  {#if form?.message}
    <div class="alert alert-error shadow-lg mb-4">
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Error: {form.message}</span>
      </div>
    </div>
  {/if}

  {#if assignedItems.length === 0}
    <p>No new items require categorization.</p>
    <a href="../../" class="link link-primary">Back to Shopping List</a>
  {:else}
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
      <input type="hidden" name="assignments" value={JSON.stringify(assignedItems)} />

      {#each assignedItems as item (item.originalName)}
        <div class="flex items-center space-x-4">
          <span>{item.originalName}</span>
          <select class="select select-bordered" bind:value={item.categoryId} on:change={() => handleCategoryChange(item.originalName, item.categoryId)}>
            <option value={null}>Unassigned</option>
            {#each data.categories as category (category.id)}
              <option value={category.id}>{category.name}</option>
            {/each}
          </select>
        </div>
      {/each}

      <div class="mt-6 text-center">
        <button type="submit" class="btn" disabled={isSubmitting}>
          {#if isSubmitting}
            <span class="loading loading-spinner loading-xs"></span> Saving...
          {:else}
            Confirm Categories & Add Items
          {/if}
        </button>
      </div>
    </form>
  {/if}
</div>