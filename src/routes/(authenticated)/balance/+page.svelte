<script lang="ts">
  import ExpenseEntry from './ExpenseEntry.svelte';
  import { resolve } from '$app/paths';
  import * as m from '$lib/paraglide/messages.js';
  import { priceFormatter } from '$lib/utils/formatter';

  let { data } = $props();

  // The full history lives on the list page, so the overview stays short.
  const recentEntries = $derived.by(() => {
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    return data.entries.filter(entry => now - entry.date.getTime() <= sevenDaysInMs);
  });

  // Based on the local time, so the month matches the user's calendar.
  const monthTotal = $derived.by(() => {
    const now = new Date();

    return data.entries
      .filter(entry => entry.date.getFullYear() === now.getFullYear() && entry.date.getMonth() === now.getMonth())
      .reduce((sum, entry) => sum + entry.price, 0);
  });
</script>

<div class="action-bar">
  <a href={resolve('/balance/list')}>{ m.balance_expenses_all() }</a>
  <a role="button" href={resolve('/balance/add')}>{ m.balance_expense_add() }</a>
</div>

<article>
  <h2>{m.balance_month_total()}</h2>
  <p class="month-total">{priceFormatter.format(monthTotal / 100)}</p>
</article>

{#if data.showDebts}
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
{/if}

<h2 class="headline">{ m.balance_expenses_recent() }</h2>
{#if recentEntries.length === 0}
  <p class="headline">{ m.balance_expenses_recent_none() }</p>
{/if}
{#each recentEntries as entry (entry.id)}
  <ExpenseEntry {entry} />
{/each}

<style>
    .month-total {
        font-size: 2rem;
        font-weight: bold;
        margin: 0;
    }
</style>
