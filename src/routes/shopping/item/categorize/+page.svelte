<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  let isSubmitting = $state(false);
</script>

<svelte:head>
  <title>Categorize New Items</title>
</svelte:head>

<div class="container mx-auto p-4">
  <h1 class="text-2xl font-semibold mb-4">Categorize New Items</h1>

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
    {#each data.items as item (item.id)}
      <label>
        <input type="checkbox" name="itemIds" value={item.id} />
        {item.name}
      </label>
    {/each}

    <div class="mt-6 text-center">
      {#each data.categories as category (category.id)}
        <button type="submit" class="btn" name="categoryId" value={category.id} disabled={isSubmitting}>
          {category.name}
        </button>
      {/each}
    </div>
  </form>
</div>