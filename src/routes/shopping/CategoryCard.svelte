<script lang="ts">
  import type { ShoppingCategoryWithRelation } from '$lib/server/db/schema';

  let { category }: { category: ShoppingCategoryWithRelation } = $props();

  let activeItems = $state(category.shoppingItems.filter(item => item.active));
</script>

{#if activeItems.length > 0}
  <div class="card">
    <b>{category.name}</b>
    <div class="text-base">
      {#each activeItems as item (item.id)}
        - {item.amount} {item.name}<br />
      {/each}
    </div>
  </div>
{/if}