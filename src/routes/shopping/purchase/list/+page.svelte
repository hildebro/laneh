<script lang="ts">
  import { resolve } from '$app/paths';
  import * as m from '$lib/paraglide/messages.js';

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
</script>

{#each data.purchases as purchase (purchase.id)}
  <div class="card flex flex-col gap-0.5">
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