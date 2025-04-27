<script lang="ts">
  import type { ShoppingItem } from '$lib/server/db/schema';

  let { categories, unfiltered = false } = $props();
</script>

{#each categories as category (category.id)}
  {#if category.shoppingItems.length > 0 }
    <div class="card w-full">
      <!-- Header -->
      <b>{category.name}</b>
      <!-- Item list -->
      <div class="flex flex-col">
        {#each category.shoppingItems.filter((item: ShoppingItem) => item.active) as item (item.id)}
          <label>
            <input type="checkbox" name="items" value={item.id} />
            {item.amount} {item.name}
          </label>
        {/each}
        {#if unfiltered}
          {#each category.shoppingItems.filter((item: ShoppingItem) => !item.active) as item (item.id)}
            <label>
              <input type="checkbox" name="items" value={item.id} />
              <span class="preset-filled-primary-900-100">{item.name}</span>
            </label>
          {/each}
        {/if}
      </div>
    </div>
  {/if}
{/each}
