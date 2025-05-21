<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  let lastPurchaseDate = $state(
    !data.last_purchase_date
      ? null
      : new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(data.last_purchase_date)
  );
</script>

<div class="card">
  <h2 class="h2 mb-2">{ m.header_shopping() }</h2>
  <p>{ m.dashboard_shopping_count({ count: data.shopping_item_count }) }</p>
  {#if lastPurchaseDate}
    <p>{ m.dashboard_shopping_last_purchase({ date: lastPurchaseDate }) }</p>
  {/if}
  <div class="flex gap-2 mt-4">
    <a class="btn" href="shopping/item/add">{m.shopping_add_items()}</a>
    <a class="btn" href="shopping/purchase">{m.shopping_start_purchase()}</a>
  </div>
</div>