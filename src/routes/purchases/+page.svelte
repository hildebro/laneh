<script lang="ts">
  import { resolve } from '$app/paths';
  import * as m from '$lib/paraglide/messages.js';
  import type { ShoppingPurchase } from '$lib/server/db/schema';

  let { data } = $props();

  const dateFormatter = new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });

  const priceFormatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  });

  const getPriceLabel = (price: number | null) => {
    if (!price) {
      return '?? €';
    }

    return priceFormatter.format(price / 100);
  };

  const getLabel = (purchase: ShoppingPurchase) => {
    if (purchase.name) {
      return purchase.name;
    }

    return m.shopping_purchases_no_name_label();
  };
</script>

<div class="flex flex-col gap-2">
  {#each data.purchases as purchase (purchase.id)}
    <div class="card flex flex-col">
      <div>
        {getLabel(purchase)}
        <span class="font-bold">{getPriceLabel(purchase.price)}</span>
      </div>
      <div class="text-primary-900-100">{dateFormatter.format(purchase.date)}</div>
      <a href={resolve('/purchases/[purchase]', {purchase: purchase.id})} class="btn ml-auto">
        {m.generic_edit()}
      </a>
    </div>
  {/each}
</div>