<script lang="ts">
  import { resolve } from '$app/paths';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  // Sorted by name instead of list priority, since items are looked up here.
  let categories = $derived(data.categories
    .filter(category => category.shoppingItems.length > 0)
    .map(category => ({
      ...category,
      shoppingItems: category.shoppingItems.toSorted((a, b) => a.name.localeCompare(b.name))
    })));
</script>

<div class="action-bar">
  <a role="button" href={resolve('/settings/items/add')}>{ m.settings_items_add() }</a>
</div>
{#if categories.length === 0}
  <article>{m.settings_items_empty()}</article>
{:else}
  <div class="single-col-wrapper">
    {#each categories as category (category.id)}
      <article>
        <h2>{category.name}</h2>
        <div class="action-row">
          {#each category.shoppingItems as item (item.id)}
            <a role="button" href={resolve('/(authenticated)/settings/items/[item]', { item: item.id })}>
              {item.name}
              {#if item.synonyms.length > 0}
                <small>({item.synonyms.join(', ')})</small>
              {/if}
            </a>
          {/each}
        </div>
      </article>
    {/each}
  </div>
{/if}
