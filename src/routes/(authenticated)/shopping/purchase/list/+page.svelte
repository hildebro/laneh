<script lang="ts">
  import { resolve } from '$app/paths';
  import * as m from '$lib/paraglide/messages.js';
  import { dateFormatter, priceFormatter } from '$lib/utils/formatter';

  let { data } = $props();

  let filterByAge = $state(true);
  let filterByUnmatched = $state(false);

  const isOlderThan7Days = (date: string) => {
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    const today = new Date();

    return (today.getTime() - new Date(date).getTime()) > sevenDaysInMs;
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
</script>

<div class="action-bar">
  <label>
    { m.shopping_purchase_filter_age() }
    <input type="checkbox" checked={filterByAge} onclick={() => (filterByAge = !filterByAge)} />
  </label>
  <label>
    { m.shopping_purchase_filter_unmatched() }
    <input type="checkbox" checked={filterByUnmatched} onclick={() => (filterByUnmatched = !filterByUnmatched)} />
  </label>
</div>
{#each filteredPurchases as purchase (purchase.id)}
  <article>
    <span>
      { m.shopping_purchase_list_entry({ user: purchase.user.username, count: purchase.shoppingItems.length }) }
    </span>
    <span>{dateFormatter.format(new Date(purchase.date))}</span>
    <footer>
      {#if purchase.balanceEntry}
        {priceFormatter.format(purchase.balanceEntry.price / 100)}
      {:else }
        <a role="button" href={resolve(`/balance/add?purchaseId=${purchase.id}`)}>
          { m.balance_expense_add() }
        </a>
      {/if}
    </footer>
  </article>
{/each}