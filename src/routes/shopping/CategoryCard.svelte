<script lang="ts">
  import type { ShoppingItem } from '$lib/server/db/schema';

  let { category } = $props();
</script>

<div class="card preset-filled-secondary-100-900">
  <!-- Header -->
  <b>{category.name}</b>
  <!-- Item list -->
  <div class="mb-2">
    {#each category.shoppingItems.filter((item: ShoppingItem) => item.active) as item}
      - {item.amount} {item.name}<br />
    {/each}
  </div>
</div>