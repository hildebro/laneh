<script lang="ts">
  import { Switch } from '@skeletonlabs/skeleton-svelte';
  import { resolve } from '$app/paths';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  let filterByAge = $state(true);
  let filterByUnmatched = $state(false);

  const isOlderThan7Days = (date: Date) => {
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    const today = new Date();

    return (today.getTime() - date.getTime()) > sevenDaysInMs;
  };

  const filterPurchases = () => {
    let purchases = data.purchases;
    if (filterByAge) {
      purchases = purchases.filter(purchase => !isOlderThan7Days(purchase.date));
    }
    if (filterByUnmatched) {
      purchases = purchases.filter(purchase => !purchase.balanceEntryId);
    }

    return purchases;
  };

  let filteredPurchases = $derived(filterPurchases());

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
</script>

<div class="ml-auto mb-2">
  <Switch class="btn" checked={filterByAge} onCheckedChange={(e) => (filterByAge = e.checked)}>
    <Switch.Control>
      <Switch.Thumb />
    </Switch.Control>
    <Switch.Label>{ m.shopping_purchase_filter_age() }</Switch.Label>
    <Switch.HiddenInput />
  </Switch>
  <Switch class="btn" checked={filterByUnmatched} onCheckedChange={(e) => (filterByUnmatched = e.checked)}>
    <Switch.Control>
      <Switch.Thumb />
    </Switch.Control>
    <Switch.Label>{ m.shopping_purchase_filter_unmatched() }</Switch.Label>
    <Switch.HiddenInput />
  </Switch>
</div>
<div class="flex flex-row flex-wrap gap-2 justify-center">
  {#each filteredPurchases as purchase (purchase.id)}
    <div class="card flex flex-col gap-0.5 w-64">
    <span>
      { m.shopping_purchase_list_entry({ user: purchase.user.username, count: purchase.shoppingItems.length }) }
    </span>
      <span class="text-primary-900-100">{dateFormatter.format(purchase.date)}</span>
      {#if purchase.balanceEntry}
        {priceFormatter.format(purchase.balanceEntry.price / 100)}
      {:else }
        <a href={resolve(`/balance/add?purchaseId=${purchase.id}`)} class="btn">
          { m.balance_expense_add() }
        </a>
      {/if}
    </div>
  {/each}
</div>