<script lang="ts">
  import CancelAction from '../cancel/CancelAction.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import EnhancedForm from '$lib/EnhancedForm.svelte';

  let { data, form } = $props();

  let isSubmitting = $state(false);
</script>

<svelte:head>
  <title>{ m.shopping_categorize() }</title>
</svelte:head>

<div class="action-bar">
  <CancelAction />
</div>
<article>
  <h2>{ m.shopping_categorize() }</h2>

  <EnhancedForm method="POST" hideSubmitButton>
    { m.shopping_categorize_select_items() }
    <div class="select-container">
      {#each data.items.filter(item => item.status === 'unmatched' && item.selectedCategoryId === null) as item (item.id)}
        <label>
          <input type="checkbox" name="itemIds" value={item.id} />
          {item.name}
        </label>
      {/each}
    </div>

    { m.shopping_categorize_select_category() }
    <div class="select-container">
      {#each data.selectableCategories as category (category.id)}
        <button type="submit" name="categoryId" value={category.id} disabled={isSubmitting}>
          {category.name}
        </button>
      {/each}
    </div>
  </EnhancedForm>
</article>

<!--    mt-2 mb-4 flex gap-6 flex-wrap text-lg justify-center -->
<style>
    .select-container {
        margin-top: 1rem;
        margin-bottom: 1rem;
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        justify-content: center;
    }
</style>