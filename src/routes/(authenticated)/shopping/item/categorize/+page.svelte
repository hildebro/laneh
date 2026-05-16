<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import ApiFormGroup from '$lib/components/ApiFormGroup.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  let itemIds = $state([]);

  let pendingCategoryId = $state<string>('');

  async function submitAction() {
    const client = getApiClient();
    return client.api.shopping.categorizeItems.$post({
      json: { itemIds, categoryId: pendingCategoryId }
    });
  }

  async function onSuccess(response: Response) {
    const json = await response.json();
    if (json?.finished) {
      await goto(resolve('/shopping'));
    }

    await invalidateAll();
  }

  async function cancelAction() {
    const client = getApiClient();
    return client.api.shopping.cancelStagedItems.$post();
  }
</script>

<svelte:head>
  <title>{ m.shopping_categorize() }</title>
</svelte:head>

<div class="action-bar">
  <ApiForm
    submitAction={cancelAction}
    submitButtonText={m.shopping_cancel_staging()}
    onSuccess={resolve('/shopping')}
  >
    <span></span>
  </ApiForm>
</div>
<article>
  <h2>{ m.shopping_categorize() }</h2>

  { m.shopping_categorize_select_items() }
  <div class="select-container">
    {#each data.items.filter(item => item.status === 'unmatched' && item.selectedCategoryId === null) as item (item.id)}
      <label>
        <input type="checkbox" name="itemIds" value={item.id} bind:group={itemIds} />
        {item.name}
      </label>
    {/each}
  </div>

  <ApiForm
    {submitAction}
    {onSuccess}
    submitButtonHidden={true}
  >
    <ApiFormGroup name="itemIds" label={m.shopping_categorize_select_category()}>
      <div class="action-row">
        {#each data.selectableCategories as category (category.id)}
          <button
            type="submit"
            onclick={() => pendingCategoryId = category.id}
          >
            {category.name}
          </button>
        {/each}
      </div>
    </ApiFormGroup>
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