<script lang="ts">
  import { resolve } from '$app/paths';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();
</script>

<div class="w-full">
  {#await data.categories}
    <LoadingSpinner />
  {:then categories}
    <div class="flex flex-wrap justify-end gap-2 mb-4">
      <a class="btn" href={resolve('/shopping/purchase/list')}>{m.shopping_purchase_list()}</a>
      <a class="btn" href={resolve('/shopping/item/add')}>{m.shopping_add_items()}</a>
      <a class="btn" href={resolve('/shopping/purchase')}>{m.shopping_start_purchase()}</a>
    </div>
    <div class="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-4">
      {#each categories as category (category.id)}
        <div class="card">
          <b>{category.name}</b>
          <div class="text-base">
            {#each category.shoppingItems as item (item.id)}
              - {item.amount} {item.name}<br />
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/await}
</div>
