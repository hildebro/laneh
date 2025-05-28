<script lang="ts">
  import { type ShoppingCategoryWithRelation, type ShoppingItem } from '$lib/server/db/schema';

  // unfiltered implies that all items should be displayed, including deactivated ones.
  let { categories, unfiltered = false, value = $bindable([]) } = $props();

  const filterActive = (shoppingItems: ShoppingItem[], active: boolean = true): ShoppingItem[] =>
    shoppingItems.filter((item) => item.active === active);

  const shouldBeDisplayed = (category: ShoppingCategoryWithRelation) => {
    // Unfiltered categories are always displayed.
    if (unfiltered) {
      return true;
    }

    // Otherwise the category must include at least one active item.
    return filterActive(category.shoppingItems).length > 0;
  };
</script>

{#each categories as category (category.id)}
  {#if shouldBeDisplayed(category) }
    <div class="card w-full">
      <b>{category.name}</b>
      <div class="flex flex-col text-base">
        {#each filterActive(category.shoppingItems) as item (item.id)}
          <label class="flex items-center gap-0.5">
            <input type="checkbox" name="itemIds" value={item.id} bind:group={value} />
            {item.amount} {item.name}
          </label>
        {/each}
        {#if unfiltered}
          {#each filterActive(category.shoppingItems, false) as item (item.id)}
            <label class="flex items-center gap-0.5">
              <input type="checkbox" name="itemIds" value={item.id} bind:group={value} />
              <span class="opacity-50 italic">~{item.name}</span>
            </label>
          {/each}
        {/if}
      </div>
    </div>
  {/if}
{/each}
