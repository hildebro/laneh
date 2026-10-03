<script lang="ts">
  import { TextCursorInput } from '@lucide/svelte';
  import { invalidateAll } from '$app/navigation';
  import { getApiClient } from '$lib/apiClient';
  import type { ShoppingCategory, ShoppingItem } from '$lib/backend/db/schema';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import ApiFormItem from '$lib/components/ApiFormItem.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { items, categories }: { items: ShoppingItem[], categories: ShoppingCategory[] } = $props();

  // Unique per group, since every group has its own name and synonym fields.
  const key = $derived(items[0].id);

  let selectedIds = $derived(items.map(item => item.id));
  let selectedItems = $derived(items.filter(item => selectedIds.includes(item.id)));

  // The merged items live on in the one whose name was picked last. Name and synonyms can be edited freely afterward.
  let chosenItemId = $derived(items[0].id);
  let mainItemId = $derived(selectedIds.includes(chosenItemId) ? chosenItemId : selectedItems[0]?.id ?? '');
  let name = $derived(items[0].name);
  let synonyms = $derived(synonymsFor(items[0], items));

  // Everything the other items are called becomes a synonym, so nothing gets lost unless it's removed by hand.
  function synonymsFor(item: ShoppingItem, others: ShoppingItem[]) {
    return [...item.synonyms, ...others.filter(other => other.id !== item.id).flatMap(other => [other.name, ...other.synonyms])]
      .filter((synonym, index, all) => all.findIndex(other => other.toLowerCase() === synonym.toLowerCase()) === index)
      .join(', ');
  }

  function setAsName(item: ShoppingItem) {
    chosenItemId = item.id;
    name = item.name;
    synonyms = synonymsFor(item, selectedItems);
  }

  // A category only has to be picked, if the selected items disagree.
  let selectedCategoryIds = $derived([...new Set(selectedItems.map(item => item.categoryId))]);
  let pickedCategoryId = $state('');
  let categoryId = $derived(selectedCategoryIds.length === 1 ? selectedCategoryIds[0] ?? '' : pickedCategoryId);

  const categoryName = (id: string | null) => categories.find(category => category.id === id)?.name ?? '';

  let dismissing = $state(false);

  async function merge() {
    const client = getApiClient();
    return client.api.shopping.mergeItems.$post({
      json: { itemIds: selectedIds, mainItemId, name, synonyms: synonyms.split(','), categoryId }
    });
  }

  async function dismiss() {
    dismissing = true;
    try {
      const client = getApiClient();
      await client.api.shopping.dismissMergeCandidates.$post({ json: { itemIds: items.map(item => item.id) } });
      await invalidateAll();
    } finally {
      dismissing = false;
    }
  }
</script>

<article>
  <ApiForm
    submitAction={merge}
    submitButtonText={m.settings_items_merge()}
    onSuccess={() => {}}
    warnOnUnsavedChanges={false}
  >
    <ul class="items">
      {#each items as item (item.id)}
        <li>
          <label>
            <input type="checkbox" value={item.id} bind:group={selectedIds} />
            <span>
              <strong>{item.name}</strong>
              <small>
                {categoryName(item.categoryId)}
                {#if item.synonyms.length > 0}
                  · {item.synonyms.join(', ')}
                {/if}
              </small>
            </span>
          </label>
          <button
            type="button"
            class="tertiary"
            disabled={!selectedIds.includes(item.id)}
            onclick={() => setAsName(item)}
            title={m.settings_items_merge_set_name()}
            aria-label={m.settings_items_merge_set_name()}
          >
            <TextCursorInput />
          </button>
        </li>
      {/each}
    </ul>

    <ApiFormItem
      label={m.generic_name()}
      name="name"
      id="name-{key}"
      bind:value={name}
    />
    <ApiFormItem
      label={m.settings_items_synonyms()}
      name="synonyms"
      id="synonyms-{key}"
      bind:value={synonyms}
    />
    {#if selectedCategoryIds.length > 1}
      <ApiFormItem
        label={m.generic_category()}
        name="categoryId"
        id="category-{key}"
        type="select"
        bind:value={pickedCategoryId}
      >
        <option value="" selected></option>
        {#each categories as category (category.id)}
          <option value={category.id}>{category.name}</option>
        {/each}
      </ApiFormItem>
    {/if}

    {#snippet additionalButtons()}
      <button type="button" class="warning" onclick={dismiss} disabled={dismissing}>
        {m.settings_items_merge_dismiss()}
      </button>
    {/snippet}
  </ApiForm>
</article>

<style>
    .items {
        list-style: none;
        padding: 0;
        margin: 0 0 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .items li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
    }

    .items label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .items span {
        display: flex;
        flex-direction: column;
    }

    .items button {
        flex-shrink: 0;
    }
</style>
