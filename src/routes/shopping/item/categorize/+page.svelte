<script lang="ts">
  import CancelAction from '../cancel/CancelAction.svelte';
  import { enhance } from '$app/forms';
  import * as m from '$lib/paraglide/messages.js';

  let { data, form } = $props();

  let isSubmitting = $state(false);
</script>

<svelte:head>
  <title>{ m.shopping_categorize() }</title>
</svelte:head>

<CancelAction />
<div class="card">
  <h1 class="text-2xl font-semibold mb-4">{ m.shopping_categorize() }</h1>

  {#if form?.message}
    <p class="preset-filled-error-50-950 rounded m-2 text-center">{form.message}</p>
  {/if}

  <form
    method="POST"
    use:enhance={() => {
        isSubmitting = true;
        return async ({ update }) => {
          isSubmitting = false;
          await update();
        };
      }}
  >
    { m.shopping_categorize_select_items() }
    <div class="mt-2 mb-4 flex gap-6 flex-wrap text-lg justify-center">
      {#each data.items.filter(item => item.status === 'unmatched' && item.selectedCategoryId === null) as item (item.id)}
        <label>
          <input type="checkbox" name="itemIds" value={item.id} />
          {item.name}
        </label>
      {/each}
    </div>

    { m.shopping_categorize_select_category() }
    <div class="mt-2 flex gap-6 flex-wrap text-lg justify-center">
      {#each data.categories as category (category.id)}
        <button type="submit" class="btn" name="categoryId" value={category.id} disabled={isSubmitting}>
          {category.name}
        </button>
      {/each}
    </div>
  </form>
</div>