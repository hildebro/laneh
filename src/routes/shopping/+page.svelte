<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();
</script>

<div class="w-full">
  <div class="flex flex-row items-end justify-between">
    <a class="underline" href={resolve('/shopping/purchase/list')}>{m.shopping_purchase_list()}</a>
    <div class="flex flex-wrap justify-end gap-2 mb-4">
      <button
        class="btn"
        disabled={data.hasNoCategories}
        onclick={() => goto(resolve('/shopping/item/add'))}
      >
        {m.shopping_add_items()}
      </button>
      <button
        class="btn"
        disabled={data.activeCategories.length === 0}
        onclick={() => goto(resolve('/shopping/purchase'))}
      >
        {m.shopping_start_purchase()}
      </button>
    </div>
  </div>
  {#if data.hasNoCategories}
    <div class="card mt-4">
      { m.error_shopping_no_categories() }
      <div class="flex justify-end">
        <a class="btn" href={resolve('/settings/categories/add')}>
          { m.settings_categories_add() }
        </a>
      </div>
    </div>
  {:else if data.activeCategories.length === 0}
    <div class="card mt-4">{ m.error_shopping_no_active_categories() }</div>
  {/if}
  <div class="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-4">
    {#each data.activeCategories as category (category.id)}
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
</div>
