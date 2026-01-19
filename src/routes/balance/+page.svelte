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

  const getUsername = (userId: string) => {
    return data.users.find(user => user.id === userId)?.username as string;
  }
</script>

<div class="flex flex-col gap-2">
  <div class="card">
    <span class="h5 mb-4">{m.balance()}</span>
    {#each data.userDebts as userDebt (`${userDebt.debtor_user_id}-${userDebt.creditor_user_id}`)}
      <div>
        {getUsername(userDebt.creditor_user_id)} is owed {userDebt.amount / 100} by {getUsername(userDebt.debtor_user_id)}
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