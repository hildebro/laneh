<script lang="ts">
  import { resolve } from '$app/paths';
  import * as m from '$lib/paraglide/messages.js';
  import type { ApiBalanceEntry } from '$lib/server/api/balance';

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

  const getLabel = (balanceEntry: ApiBalanceEntry) => {
    if (balanceEntry.name) {
      return balanceEntry.name;
    }

    return m.balance_no_name_label();
  };
</script>

<div class="action-bar">
  <a role="button" href={resolve('/balance/add')}>{ m.balance_expense_add() }</a>
</div>

<article>
  <h2>{m.balance()}</h2>
  {#if data.userDebts.length === 0}
    <p>{ m.balance_none() }</p>
  {/if}
  {#each data.userDebts as userDebt (userDebt.creditor.id)}
    <div>
      <h4>{m.balance_owed({ user: userDebt.creditor.username })}</h4>
      <ul>
        {#each userDebt.debtorData as debtorEntry (debtorEntry.debtor.id)}
          <li>
            {m.balance_owed_debtor({
              amount: priceFormatter.format(debtorEntry.amount / 100),
              debtor: debtorEntry.debtor.username
            })}
          </li>
        {/each}
      </ul>
    </div>
  {/each}
</article>

<h2 class="headline">{ m.balance_expenses() }</h2>
{#each data.entries as entry (entry.id)}
  <article>
    <div class="action-bar">
      <a role="button" href={resolve('/(authenticated)/balance/[entry]', {entry: entry.id})}>
        {m.generic_edit()}
      </a>
    </div>
    <div>
      {getLabel(entry)}
      <b>{priceFormatter.format(entry.price / 100)}</b>
    </div>
    <span>{entry.user.username}</span>
    <footer>
      <span>{dateFormatter.format(new Date(entry.date))}</span>
    </footer>
  </article>
{/each}