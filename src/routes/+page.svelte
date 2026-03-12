<script lang="ts">
  import { resolve } from '$app/paths';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  const priceFormatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  });

  let lastPurchaseDate = $derived(
    !data.last_purchase_date
      ? null
      : new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(data.last_purchase_date)
  );
</script>

<div class="flex flex-wrap items-start gap-10">
  <div class="card">
    <h2 class="h2 mb-2">{ m.header_shopping() }</h2>
    <p>{ m.dashboard_shopping_count({ count: data.shopping_item_count }) }</p>
    {#if lastPurchaseDate}
      <p>{ m.dashboard_shopping_last_purchase({ date: lastPurchaseDate }) }</p>
    {/if}
    <div class="flex gap-2 mt-4">
      <a class="btn" href={resolve('/shopping/item/add')}>{m.shopping_add_items()}</a>
      <a class="btn" href={resolve('/shopping/purchase')}>{m.shopping_start_purchase()}</a>
    </div>
  </div>
  <div class="card">
    <h2 class="h2 mb-2">{ m.header_schedule() }</h2>
    <p>{ m.dashboard_schedule_count({ count: data.due_task_count }) }</p>
    <div class="flex gap-2 mt-4">
      <a class="btn" href={resolve('/schedule')}>{ m.dashboard_schedule_go_to() }</a>
    </div>
  </div>
  <div class="card">
    <h2 class="h2 mb-2">{ m.balance() }</h2>
    {#if data.userDebts.length === 0}
      { m.balance_none() }
    {:else }
      {#each data.userDebts as userDebt (userDebt.creditor.id)}
        <div class="flex flex-row justify-center">
          <span>{m.balance_owed({ user: userDebt.creditor.username })}</span>
          <div>
            {#each userDebt.debtorData as debtorEntry (debtorEntry.debtor.id)}
              <div class="px-2 font-bold">
                {m.balance_owed_debtor({
                  amount: priceFormatter.format(debtorEntry.amount / 100),
                  debtor: debtorEntry.debtor.username
                })}
              </div>
            {/each}
          </div>
        </div>
      {/each}
    {/if}
    <div class="mt-4">
      <a class="btn" href={resolve('/schedule')}>{ m.dashboard_balance_go_to() }</a>
    </div>
  </div>
</div>