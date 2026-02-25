<script lang="ts">
  import { resolve } from '$app/paths';
  import * as m from '$lib/paraglide/messages.js';
  import type { BalanceEntry } from '$lib/server/db/schema';

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

  const getLabel = (balanceEntry: BalanceEntry) => {
    if (balanceEntry.name) {
      return balanceEntry.name;
    }

    return m.balance_no_name_label();
  };
</script>

<div class="flex flex-col gap-3">
  <div class="card flex flex-col gap-2">
    <span class="h5">{m.balance()}</span>
    {#if data.userDebts.length === 0}
      { m.balance_none() }
    {/if}
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
  </div>
  <a class="btn ml-auto" href={resolve('/balance/add')}>{ m.balance_expense_add() }</a>
  {#each data.entries as entry (entry.id)}
    <div class="card flex flex-col">
      <div>
        {getLabel(entry)}
        <span class="font-bold">{priceFormatter.format(entry.price / 100)}</span>
      </div>
      <span>{entry.user.username}</span>
      <span class="text-primary-900-100">{dateFormatter.format(entry.date)}</span>
      <a href={resolve('/balance/[entry]', {entry: entry.id})} class="btn mt-2 ml-auto">
        {m.generic_edit()}
      </a>
    </div>
  {/each}
</div>