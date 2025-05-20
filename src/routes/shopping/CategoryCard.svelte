<script lang="ts">
  import type { ShoppingItem } from '$lib/server/db/schema';

  let { category } = $props();
</script>

<div class="card">
  <!-- Header -->
  <b>{category.name}</b>
  <!-- Item list -->
  <div class="mb-2">
    {#each category.shoppingItems.filter((item: ShoppingItem) => item.active) as item (item.id)}
      - {item.amount} {item.name}<br />
    {/each}
  </div>
</div>