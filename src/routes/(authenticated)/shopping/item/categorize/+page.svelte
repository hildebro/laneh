<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import ApiFormGroup from '$lib/components/ApiFormGroup.svelte';
  import ApiFormItem from '$lib/components/ApiFormItem.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { clearStagedShoppingItems, setStagedShoppingItems } from '$lib/utils/shoppingItemStaging';

  let { data } = $props();

  // Indices into data.items
  let selectedIndices = $state<number[]>([]);

  let pendingCategoryId = $state<string>('');

  // Sends the whole list each time. The server only adds the items, once none of them needs a category anymore.
  async function submitCategorizeAction() {
    const client = getApiClient();
    return client.api.shopping.items.$post({
      json: data.items.map((item, index) => selectedIndices.includes(index)
        ? { ...item, categoryId: pendingCategoryId }
        : item)
    });
  }

  async function onCategorizeSuccess(response: Response) {
    const result = await response.json();
    selectedIndices = [];

    if (result.committed) {
      clearStagedShoppingItems(data.logged_in_user.id);
      await goto(resolve('/shopping'));
    } else {
      // The form reloads the page data afterwards, which picks up the new state.
      setStagedShoppingItems(data.logged_in_user.id, result.items);
    }
  }

  async function submitNewCategoryAction() {
    const client = getApiClient();
    return client.api.shopping.category.$post({
      json: { name: categoryName, id: null }
    });
  }

  let categoryName = $state('');

  async function onNewCategorySuccess() {
    await invalidateAll();
    categoryName = '';
  }

  async function cancel() {
    clearStagedShoppingItems(data.logged_in_user.id);
    await goto(resolve('/shopping'));
  }
</script>

<svelte:head>
  <title>{ m.shopping_categorize() }</title>
</svelte:head>

<div class="action-bar">
  <button type="button" onclick={cancel}>{ m.shopping_cancel_staging() }</button>
</div>
<article>
  <h2>{ m.shopping_categorize() }</h2>

  { m.shopping_categorize_select_items() }
  <div class="select-container">
    {#each data.items as item, index (index)}
      {#if item.needsCategory}
        <label>
          <input type="checkbox" name="itemIds" value={index} bind:group={selectedIndices} />
          {item.name}
        </label>
      {/if}
    {/each}
  </div>

  <ApiForm
    submitAction={submitCategorizeAction}
    onSuccess={onCategorizeSuccess}
    submitButtonHidden={true}
  >
    <ApiFormGroup name="itemIds" label={m.shopping_categorize_select_category()}>
      <div class="action-row">
        {#each data.selectableCategories as category (category.id)}
          <button
            type="submit"
            disabled={selectedIndices.length === 0}
            onclick={() => pendingCategoryId = category.id}
          >
            {category.name}
          </button>
        {/each}
      </div>
    </ApiFormGroup>
  </ApiForm>
  <ApiForm
    submitAction={submitNewCategoryAction}
    onSuccess={onNewCategorySuccess}
    submitButtonText={m.settings_categories_add()}
  >
    <ApiFormItem
      label={m.shopping_categorize_new_category()}
      name="name"
      bind:value={categoryName}
    />
  </ApiForm>
</article>

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
